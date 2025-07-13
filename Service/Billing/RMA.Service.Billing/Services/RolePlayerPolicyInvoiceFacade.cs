using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using Invoice = RMA.Service.Billing.Contracts.Entities.Invoice;

namespace RMA.Service.Billing.Services
{
    public class RolePlayerPolicyInvoiceFacade : RemotingStatelessService, IRolePlayerPolicyInvoiceService
    {
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<billing_PolicyPaymentAllocation> _policyPaymentAllocation;
        private readonly IPolicyService _policyService;

        public RolePlayerPolicyInvoiceFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService,
            IRepository<billing_Invoice> invoiceRepository,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<billing_PolicyPaymentAllocation> policyPaymentAllocation,
            IPolicyService policyService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
            _configurationService = configurationService;
            _documentGeneratorService = documentGeneratorService;
            _policyPaymentAllocation = policyPaymentAllocation;
            _policyService = policyService;
        }

        public async Task<int> AddInvoiceItem(Invoice invoice)
        {
            Contract.Requires(invoice != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_Invoice>(invoice);
                _invoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.InvoiceId;
            }
        }

        public async Task AssignInvoiceNumbers()
        {
            var allowBilling = (await _configurationService.GetModuleSetting(SystemSettings.AllowBilling)).ToBoolean(false);
            if (allowBilling)
            {
                using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
                {
                    var invoices = await _invoiceRepository.Where(x => (string.IsNullOrEmpty(x.InvoiceNumber) || x.InvoiceNumber == null)).ToListAsync();
                    foreach (var invoice in invoices)
                    {
                        //prevent multiple assignments during concurrent execution
                        var unAssignedInvoice = await _invoiceRepository.Where(x => x.InvoiceId == invoice.InvoiceId && string.IsNullOrEmpty(x.InvoiceNumber)).FirstOrDefaultAsync();
                        if (unAssignedInvoice != null)
                        {
                            var invoiceNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Invoice, "");
                            invoice.InvoiceNumber = invoiceNumber;
                            _invoiceRepository.Update(invoice);
                        }
                    }

                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<List<PolicyBilling>> GetDebtorsPolicyBillingInvoice(int rolePlayerId, DateTime billingPeriod)
        {
            var results = new List<PolicyBilling>();
            var billingMonth = DateTimeHelper.StartOfTheMonth(billingPeriod);
            var policiesLinkedToEmployer = await _policyService.GetOnlyPoliciesByRolePlayer(rolePlayerId);
            if (policiesLinkedToEmployer == null || policiesLinkedToEmployer.Count == 0)
                return results;

            var policyIdsLinkedToEmployer = policiesLinkedToEmployer.Select(p => p.PolicyId).ToList();

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var invoices = await _invoiceRepository.Where(x =>
                                                          x.InvoiceDate == billingMonth &&
                                                          x.IsDeleted == false &&
                                                          x.InvoiceStatus == InvoiceStatusEnum.NonAllocatable &&
                                                          x.PolicyId.HasValue &&
                                                          policyIdsLinkedToEmployer.Contains(x.PolicyId.Value))
                                                          .ToListAsync();

                if (invoices == null || invoices.Count == 0)
                    return results;

                await _invoiceRepository.LoadAsync(invoices, i => i.Transactions);
                foreach (var item in invoices)
                {

                    if (results.Any(p => p.PolicyId == item.PolicyId))
                    {
                        int index = results.FindIndex(p => p.PolicyId == item.PolicyId);
                        var currentAmount = results[index].BillingAmount.HasValue ? results[index].BillingAmount.Value : 0;
                        results[index].BillingAmount = GetInvoiceBalance(item);
                    }
                    else
                    {
                        results.Add(new PolicyBilling
                        {
                            BillingAmount = GetInvoiceBalance(item),
                            BillingDate = item.InvoiceDate,
                            PolicyNumber = policiesLinkedToEmployer.First(p => p.PolicyId == item.PolicyId).PolicyNumber,
                            PolicyId = item.PolicyId.HasValue ? item.PolicyId.Value : 0,
                            AllocatedAmount = 0M
                        });
                    }
                }
                var policyIds = results.Select(i => i.PolicyId).ToList();
                var policyTransactions = await _policyPaymentAllocation.Where(tx => policyIds.Contains(tx.PolicyId) &&
                           tx.BillingMonth == billingMonth)
                           .ToListAsync();

                if (policyTransactions != null && policyTransactions.Count > 0)
                {
                    foreach (var item in policyTransactions)
                    {
                        int index = results.FindIndex(p => p.PolicyId == item.PolicyId);
                        var currentAmount = results[index].AllocatedAmount.HasValue ? results[index].AllocatedAmount.Value : 0;
                        results[index].AllocatedAmount = GetTransactionAmount(currentAmount, item.TransactionTypeLinkId, item.Amount);
                    }
                    foreach (var item in results)
                    {
                        item.PaymentAllocations = Mapper.Map<List<PolicyPaymentAllocation>>(policyTransactions.Where(p => p.PolicyId == item.PolicyId).ToList());

                    }
                }
            }

            return results;
        }

        private decimal GetInvoiceBalance(billing_Invoice invoice)
        {
            decimal balance = 0;
            if (invoice == null || invoice.Transactions == null || invoice.Transactions.Count == 0)
                return balance;

            foreach (var transaction in invoice.Transactions)
            {
                balance = GetTransactionAmount(balance, transaction.TransactionTypeLinkId, transaction.Amount);
            }
            return balance;
        }
        private decimal GetTransactionAmount(decimal currentAmount, int TransactionTypelinkId, decimal amount)
        {
            if (TransactionTypelinkId == (int)TransactionActionType.Credit)
                return currentAmount + amount;

            if (TransactionTypelinkId == (int)TransactionActionType.Debit)
                return currentAmount - amount;

            return currentAmount;
        }
    }
}
