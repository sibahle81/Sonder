using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using InvoiceAllocation = RMA.Service.Billing.Contracts.Entities.InvoiceAllocation;
using Transaction = RMA.Service.Billing.Contracts.Entities.Transaction;

namespace RMA.Service.Billing.Services
{
    public class TransactionCreatorFacade : RemotingStatelessService, ITransactionCreatorService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const string ViewCollection = "View Collection";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<billing_InvoiceAllocation> _invoiceAllocationRepository;
        private readonly IRepository<billing_DebitTransactionAllocation> _debitTransactionAllocationRepository;
        private readonly IRepository<billing_Collection> _collectionRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentNumberService _documentNumberService;
        private readonly IPeriodService _periodService;
        private readonly IAbilityTransactionsAuditService _abilityTransactionsAuditService;
        private readonly ITransactionService _transactionService;
        private readonly IBillingService _billingService;

        public TransactionCreatorFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<billing_Invoice> invoiceRepository,
            IRepository<billing_InvoiceAllocation> invoiceAllocationRepository,
            IRepository<billing_Transaction> transactionRepository,
            IRepository<billing_DebitTransactionAllocation> debitTransactionAllocationRepository,
            IRepository<billing_Collection> collectionRepository,
            IConfigurationService configurationService,
            IDocumentNumberService documentNumberService,
            IPeriodService periodService,
            IAbilityTransactionsAuditService abilityTransactionsAuditService,
            ITransactionService transactionService,
            IBillingService billingService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _documentGeneratorService = documentGeneratorService;
            _invoiceRepository = invoiceRepository;
            _invoiceAllocationRepository = invoiceAllocationRepository;
            _transactionRepository = transactionRepository;
            _debitTransactionAllocationRepository = debitTransactionAllocationRepository;
            _collectionRepository = collectionRepository;
            _configurationService = configurationService;
            _documentNumberService = documentNumberService;
            _periodService = periodService;
            _abilityTransactionsAuditService = abilityTransactionsAuditService;
            _transactionService = transactionService;
            _billingService = billingService;
        }

        public async Task<Transaction> CreateCreditNoteByRolePlayerId(int rolePlayerId, decimal amount, string reason)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            if (amount <= 0)
            {
                return null;
            }
            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

            var reference = await CreateCreditNoteReferenceNumber();

            var transaction = new billing_Transaction
            {
                Reason = reason,
                TransactionType = TransactionTypeEnum.CreditNote,
                RmaReference = reference,
                TransactionDate = postingDate,
                PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                Amount = amount,
                RolePlayerId = rolePlayerId,
                TransactionTypeLinkId = (int)TransactionActionType.Credit
            };

            using (var scope = _dbContextScopeFactory.Create())
            {
                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return Mapper.Map<Transaction>(transaction);
        }

        public async Task<Transaction> CreateDebitNoteByRolePlayerId(int rolePlayerId, decimal amount, string reason)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            if (amount <= 0)
            {
                return null;
            }
            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

            var reference = await CreateDebitNoteReferenceNumber();

            var transaction = new billing_Transaction
            {
                Reason = reason,
                TransactionType = TransactionTypeEnum.DebitNote,
                RmaReference = reference,
                TransactionDate = postingDate,
                PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                Amount = amount,
                RolePlayerId = rolePlayerId,
                TransactionTypeLinkId = (int)TransactionActionType.Debit
            };

            using (var scope = _dbContextScopeFactory.Create())
            {
                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return Mapper.Map<Transaction>(transaction);
        }

        public async Task<Transaction> DoPayOutDebtAdjustment(int rolePlayerId, decimal amount, string reason, TransactionTypeEnum transactionType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            if (amount <= 0)
            {
                return null;
            }

            var transaction = new billing_Transaction
            {
                Reason = reason,
                TransactionType = TransactionTypeEnum.Payment,
                TransactionDate = DateTime.Now.ToSaDateTime(),
                PeriodId = await GetPeriodIdBasedOnOpenPeriod(),
                IsLogged = true,
                Amount = amount,
                RolePlayerId = rolePlayerId,
            };

            if (transactionType == TransactionTypeEnum.DebitNoteDebtAdjustment)
            {
                var reference = await CreateDebitNoteReferenceNumber();
                transaction.TransactionTypeLinkId = (int)TransactionActionType.Debit;
                transaction.TransactionReason = TransactionReasonEnum.ClaimsPaymentReversal;
                transaction.RmaReference = reference;
            }
            else if (transactionType == TransactionTypeEnum.CreditNoteDebtAdjustment)
            {
                var reference = await CreateCreditNoteReferenceNumber();
                transaction.TransactionTypeLinkId = (int)TransactionActionType.Credit;
                transaction.TransactionReason = TransactionReasonEnum.ClaimsPaymentReversal;
                transaction.RmaReference = reference;
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return Mapper.Map<Transaction>(transaction);
        }


        public async Task<Transaction> CreateCreditNoteForPremiumPayback(int rolePlayerId, decimal amount, string reason, DateTime transactionDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            if (amount <= 0) { return null; }

            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

            var reference = await CreateCreditNoteReferenceNumber();

            var transaction = new billing_Transaction
            {
                Reason = reason,
                TransactionType = TransactionTypeEnum.CreditNote,
                RmaReference = reference,
                TransactionDate = transactionDate,
                PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                Amount = amount,
                RolePlayerId = rolePlayerId,
                TransactionTypeLinkId = (int)TransactionActionType.Credit
            };

            using (var scope = _dbContextScopeFactory.Create())
            {
                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return Mapper.Map<Transaction>(transaction);
        }

        private async Task<string> CreateCreditNoteReferenceNumber()
        {
            return await _documentNumberService.GenerateCreditNoteDocumentNumber();
        }

        private async Task<string> CreateDebitNoteReferenceNumber()
        {
            return await _documentNumberService.GenerateDebitNoteDocumentNumber();
        }

        public async Task<Transaction> CreateInvoiceTransaction(Policy policy, int invoiceId)
        {
            Contract.Requires(policy != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            if (policy.InstallmentPremium <= 0)
            {
                return null;
            }
            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

            var transaction = new billing_Transaction
            {
                Reason = null,
                InvoiceId = invoiceId,
                TransactionType = TransactionTypeEnum.Invoice,
                BankReference = policy.PolicyNumber,
                TransactionDate = postingDate,
                PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                Amount = policy.InstallmentPremium,
                RolePlayerId = policy.PolicyOwnerId,
                TransactionTypeLinkId = (int)TransactionActionType.Debit
            };
            using (var scope = _dbContextScopeFactory.Create())
            {
                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return Mapper.Map<Transaction>(transaction);
        }

        public async Task<Transaction> CreateNewInvoice(string policyNumber, decimal amount, int rolePlayerId, int invoiceId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            if (amount <= 0)
            {
                return null;
            }
            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
            var transaction = new billing_Transaction
            {
                Reason = null,
                InvoiceId = invoiceId,
                TransactionType = TransactionTypeEnum.Invoice,
                RmaReference = policyNumber,
                TransactionDate = postingDate,
                PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                Amount = amount,
                RolePlayerId = rolePlayerId,
                TransactionTypeLinkId = (int)TransactionActionType.Debit
            };
            using (var scope = _dbContextScopeFactory.Create())
            {
                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return Mapper.Map<Transaction>(transaction);
        }

        public async Task<List<Invoice>> GetInvoicesRaisedForContinuationOrReinstate(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<Invoice>();
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var defaultCollectionDate = new DateTime(0001, 01, 01);
                var entities = await _invoiceRepository.Where(c => c.PolicyId == policyId && c.CollectionDate == defaultCollectionDate).ToListAsync();
                if (entities.Count > 0)
                {
                    results = Mapper.Map<List<Invoice>>(entities);
                }
                return results;
            }
        }

        public async Task<List<InvoiceAllocation>> GetPaymentMadeAfterSpecificDate(int policyId, DateTime activityDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var results = await (from invoiceAllocations in _invoiceAllocationRepository
                                     join invoices in _invoiceRepository on invoiceAllocations.InvoiceId equals invoices.InvoiceId
                                     join transactions in _transactionRepository on invoiceAllocations.TransactionId equals transactions.TransactionId
                                     where transactions.TransactionType == TransactionTypeEnum.Payment
                                     && transactions.TransactionDate > activityDate && invoices.PolicyId == policyId
                                     select new InvoiceAllocation
                                     {
                                         InvoiceAllocationId = invoiceAllocations.InvoiceAllocationId,
                                         Amount = invoiceAllocations.Amount,
                                         CreatedDate = invoiceAllocations.CreatedDate,
                                         InvoiceId = invoiceAllocations.InvoiceId,
                                         TransactionId = invoiceAllocations.TransactionId
                                     })
                                     .ToListAsync();
                return results;
            }
        }

        public async Task<List<Invoice>> GetOutstandingInvoices(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<Invoice>();
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository.Where(c => c.PolicyId == policyId &&
                c.InvoiceStatus != InvoiceStatusEnum.Paid).ToListAsync();
                if (entities.Count > 0)
                    results = Mapper.Map<List<Invoice>>(entities);
                return results;
            }
        }

        public async Task<List<Invoice>> GetInvoicesByPolicyIdNoRefData(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var invoices = new List<Invoice>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository.Where(inv => inv.PolicyId == policyId).ToListAsync();
                if (entities.Count > 0)
                {
                    invoices = Mapper.Map<List<Invoice>>(entities);
                }
                return invoices;
            }
        }

        private async Task<decimal> CalculateInvoiceBalance(int invoiceId, decimal totalInvoiceAmount)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var balance = await _transactionRepository
                   .SqlQueryAsync<decimal>(
                       DatabaseConstants.CalculateInvoiceBalance,
                       new SqlParameter { ParameterName = "@invoiceId", Value = invoiceId },
                       new SqlParameter { ParameterName = "@totalInvoiceAmount", Value = totalInvoiceAmount }
                   );
                return balance[0];
            }
        }

        public async Task<List<Invoice>> GetInvoicesByPolicyIdNumbersRefData(List<int> policyIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var invoices = new List<Invoice>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository.Where(e => policyIds.Contains((int)e.PolicyId)).ToListAsync();
                if (entities.Count > 0)
                {
                    foreach (var e in entities)
                    {
                        var balance = await CalculateInvoiceBalance(e.InvoiceId, e.TotalInvoiceAmount);
                        invoices.Add(new Invoice
                        {
                            InvoiceId = e.InvoiceId,
                            PolicyId = (int)e.PolicyId,
                            CollectionDate = e.CollectionDate,
                            TotalInvoiceAmount = e.TotalInvoiceAmount,
                            InvoiceStatus = e.InvoiceStatus,
                            InvoiceNumber = e.InvoiceNumber,
                            InvoiceDate = e.InvoiceDate,
                            NotificationDate = e.NotificationDate,
                            SourceModule = e.SourceModule,
                            SourceProcess = e.SourceProcess,
                            Balance = balance,
                            IsDeleted = e.IsDeleted,
                            CreatedBy = e.CreatedBy,
                            CreatedDate = e.CreatedDate,
                            ModifiedBy = e.ModifiedBy,
                            ModifiedDate = e.ModifiedDate
                        });
                    }
                }
                return invoices;
            }
        }

        public async Task<List<Invoice>> GetInvoicesInSpecificDateRange(int policyId, DateTime startDate, DateTime endDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var invoices = new List<Invoice>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fullStartDate = startDate.StartOfTheDay();
                var fullEndDate = endDate.EndOfTheDay();
                var entities = await _invoiceRepository.Where(inv => inv.PolicyId == policyId && inv.InvoiceDate >= fullStartDate && inv.CreatedDate <= fullEndDate).ToListAsync();
                await _invoiceRepository.LoadAsync(entities, c => c.Transactions);
                if (entities.Count > 0)
                {
                    invoices = Mapper.Map<List<Invoice>>(entities);
                }
                return invoices;
            }
        }

        public async Task<bool> AllocateCreditNoteForRefundTransaction(Invoice invoice, int transactionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (invoice != null)
                {
                    invoice.InvoiceStatus = InvoiceStatusEnum.Paid;
                    var invoiceEntity = Mapper.Map<billing_Invoice>(invoice);
                    var allocation = new billing_InvoiceAllocation
                    {
                        InvoiceId = invoice.InvoiceId,
                        TransactionId = transactionId,
                        Amount = invoice.TotalInvoiceAmount
                    };
                    _invoiceAllocationRepository.Create(allocation);
                    _invoiceRepository.Update(invoiceEntity);
                    await scope.SaveChangesAsync();
                }
            }
            return await Task.FromResult(true);
        }

        public async Task<int> CreateCreditNoteForInvoicesSettlement(int rolePlayerId, decimal amount, string reason, List<Invoice> invoices)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddCreditNote);

            if (invoices == null || invoices.Count == 0) return 0;
            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
            var creditNoteReference = await CreateCreditNoteReferenceNumber();
            var creditNoteTransaction = new Transaction
            {
                Reason = reason,
                TransactionType = TransactionTypeEnum.CreditNote,
                RmaReference = creditNoteReference,
                TransactionDate = postingDate,
                PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                Amount = amount,
                RolePlayerId = rolePlayerId,
                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                InvoiceAllocations = new List<InvoiceAllocation>()
            };


            if (invoices?.Count > 0)
                foreach (var invoice in invoices)
                {
                    var invoiceAllocation = new InvoiceAllocation { InvoiceId = invoice.InvoiceId, Amount = invoice.Balance };
                    creditNoteTransaction.InvoiceAllocations.Add(invoiceAllocation);

                    creditNoteTransaction.TransactionDate = postingDate;
                }

            var transaction = Mapper.Map<billing_Transaction>(creditNoteTransaction);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoiceIds = invoices.Select(c => c.InvoiceId).ToList();
                var invoiceEntities = await _invoiceRepository.Where(c => invoiceIds.Contains(c.InvoiceId)).ToListAsync();
                invoiceEntities.ForEach(c => { c.InvoiceStatus = InvoiceStatusEnum.Paid; });

                _invoiceRepository.Update(invoiceEntities);
                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return transaction.TransactionId;
        }

        public async Task<List<Invoice>> GetPolicyInvoices(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await _invoiceRepository.Where(s => s.PolicyId == policyId).ToListAsync();
                await _invoiceRepository.LoadAsync(invoices, s => s.InvoiceAllocations);
                return Mapper.Map<List<Invoice>>(invoices);
            }
        }

        public async Task<List<Invoice>> GetPolicyInvoicesAfterDate(int policyId, DateTime fromDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await _invoiceRepository
                    .Where(s => s.PolicyId == policyId && s.InvoiceDate >= fromDate)
                    .ToListAsync();
                await _invoiceRepository.LoadAsync(invoices, s => s.InvoiceAllocations);
                return Mapper.Map<List<Invoice>>(invoices);
            }
        }

        public async Task<Collection> GetCollectionForInvoice(int invoiceId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewCollection);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var collection = await _collectionRepository.Where(s => s.InvoiceId == invoiceId).FirstOrDefaultAsync();
                return Mapper.Map<Collection>(collection);
            }
        }

        public async Task<decimal> GetPolicyNettBalance(int policyId, DateTime fromDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var amount = 0.0M;
                var invoices = await _invoiceRepository
                    .Where(s => s.PolicyId == policyId
                             && s.InvoiceDate >= fromDate)
                    .ToListAsync();
                await _invoiceRepository.LoadAsync(invoices, s => s.InvoiceAllocations);

                var list = new List<Invoice>();
                foreach (var invoice in invoices)
                {
                    await _invoiceAllocationRepository.LoadAsync(invoice.InvoiceAllocations, s => s.Transaction);
                    // Get all the payments
                    var payments = invoice.InvoiceAllocations
                        .Where(s => s.Transaction.TransactionType == TransactionTypeEnum.Payment);
                    // Get all the payment reversals
                    var transactionIds = payments.Select(s => s.TransactionId).Distinct().ToList();
                    var reversals = await _transactionRepository
                        .Where(s => s.LinkedTransactionId != null
                                 && transactionIds.Contains((int)s.LinkedTransactionId)
                                 && s.TransactionType == TransactionTypeEnum.PaymentReversal)
                        .ToListAsync();
                    // Get the nett payment amount
                    var paymentTotal = Math.Abs(payments.Sum(s => s.Amount));
                    var reversalTotal = Math.Abs(reversals.Sum(s => s.Amount));
                    var nettAmount = paymentTotal - reversalTotal;

                    amount += nettAmount;
                }
                return amount;
            }
        }

        public async Task<decimal> GetPolicyNetBalance(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var allocations = await _invoiceAllocationRepository
                    .Where(t => t.Invoice.Policy.PolicyId == policyId)
                    .ToListAsync();

                await _invoiceAllocationRepository
                    .LoadAsync(allocations, c => c.Transaction);

                var transactions = allocations.Select(c => c.Transaction).ToList();

                var debits = await _transactionRepository
                    .Where(t => t.Invoice.Policy.PolicyId == policyId
                             && t.TransactionTypeLinkId == 1
                             && t.TransactionType == TransactionTypeEnum.Invoice)
                    .ToListAsync();

                var debitAmount = debits.Sum(c => c.Amount);
                var creditAmount = transactions.Sum(c => c.Amount);

                return debitAmount - creditAmount;
            }
        }

        public async Task<List<Invoice>> GetFirstRaisedInvoice(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var invoices = new List<Invoice>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository
                    .Where(inv => inv.PolicyId == policyId)
                    .ToListAsync();
                await _invoiceRepository.LoadAsync(entities, c => c.Transactions);
                if (entities.Count > 0)
                {
                    var firstInvoice = entities
                        .OrderBy(c => c.InvoiceId)
                        .FirstOrDefault();
                    invoices.Add(Mapper.Map<Invoice>(firstInvoice));
                }
            }
            return invoices;
        }

        public async Task<List<Invoice>> GetLastRaisedInvoice(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var invoices = new List<Invoice>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository.Where(inv => inv.PolicyId == policyId).ToListAsync();
                await _invoiceRepository.LoadAsync(entities, c => c.Transactions);
                if (entities.Count > 0)
                {
                    var firstInvoice = entities.OrderBy(c => c.InvoiceId).LastOrDefault();
                    invoices.Add(Mapper.Map<Invoice>(firstInvoice));
                }
            }
            return invoices;
        }

        public async Task<int> CreateCreditNoteForInvoice(int rolePlayerId, decimal amount, string reason, Invoice invoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddCreditNote);
            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
            var creditNoteReference = await CreateCreditNoteReferenceNumber();
            var creditNoteTransaction = new Transaction
            {
                InvoiceId = invoice?.InvoiceId,
                Reason = reason,
                TransactionType = TransactionTypeEnum.CreditNote,
                RmaReference = creditNoteReference,
                TransactionDate = DateTime.Now,
                PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                Amount = amount,
                RolePlayerId = rolePlayerId,
                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                InvoiceAllocations = new List<InvoiceAllocation>()
            };

            if (invoice != null)
            {
                var invoiceAllocation = new InvoiceAllocation
                {
                    InvoiceId = invoice?.InvoiceId,
                    Amount = amount
                };
                creditNoteTransaction.InvoiceAllocations.Add(invoiceAllocation);
            }

            var transaction = Mapper.Map<billing_Transaction>(creditNoteTransaction);
            using (var scope = _dbContextScopeFactory.Create())
            {
                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return transaction.TransactionId;
        }

        public async Task<bool> CreateBulkCreditNoteForInvoice(int policyId, int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddCreditNote);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResults = await _invoiceRepository.SqlQueryAsync<Invoice>(
                DatabaseConstants.CreateCreditNoteForInvoice,
                new SqlParameter("@policyId", policyId),
                new SqlParameter("@rolePlayerId", rolePlayerId));
                return true;
            }
        }

        public async Task<decimal> GetDebtorNetBalance(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactions = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId
                                          && t.TransactionType != TransactionTypeEnum.ClaimRecoveryInvoice && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment
                                          && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPaymentReversal).ToListAsync();

                var debitAmount = transactions.Where(s => s.TransactionTypeLinkId == 1).Sum(x => x.Amount);
                var creditAmount = transactions.Where(s => s.TransactionTypeLinkId == 2).Sum(x => x.Amount);

                return debitAmount - creditAmount;
            }
        }

        public async Task<decimal> GetTransactionBalance(int transactionId)
        {
            var balance = 0.00m;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transaction = await _transactionRepository.Where(t => t.TransactionId == transactionId).SingleAsync();

                await _transactionRepository.LoadAsync(transaction, t => t.InvoiceAllocations_TransactionId);

                if (transaction.TransactionType == TransactionTypeEnum.Invoice)
                {
                    var reversalTransaction = await _transactionRepository
                        .Where(t => t.LinkedTransactionId == transaction.TransactionId).FirstOrDefaultAsync();
                    if (reversalTransaction != null &&
                        (reversalTransaction.TransactionType == TransactionTypeEnum.InvoiceReversal))
                    {
                        return 0;
                    }

                    var invoiceAllocations = await _invoiceAllocationRepository
                        .Where(i => i.InvoiceId == transaction.InvoiceId).ToListAsync();
                    foreach (var allocation in invoiceAllocations)
                    {
                        var debitTransactions = await _transactionRepository
                            .Where(t => t.LinkedTransactionId == allocation.TransactionId).ToListAsync();
                        foreach (var debitTran in debitTransactions)
                        {
                            if (debitTran.TransactionType != TransactionTypeEnum.DebitReallocation && debitTran.TransactionType != TransactionTypeEnum.Refund && debitTran.TransactionType != TransactionTypeEnum.InterDebtorTransfer)
                            {
                                var creditTransaction = await _transactionRepository.SingleAsync(t => t.TransactionId == allocation.TransactionId);
                                if (creditTransaction.Amount == debitTran.Amount)
                                {
                                    allocation.Amount -= debitTran.Amount;
                                }
                            }
                        }
                    }

                    balance = transaction.Amount;

                    if (invoiceAllocations.Count > 0)
                    {
                        balance -= invoiceAllocations.Sum(i => i.Amount);
                    }

                    if (balance < 0)
                    {
                        balance = 0;
                    }

                    if (balance > transaction.Amount)
                    {
                        balance = transaction.Amount;
                    }

                    return balance;
                }
                else if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice)
                {
                    var invoiceAllocations = await _invoiceAllocationRepository
                        .Where(i => i.ClaimRecoveryId == transaction.ClaimRecoveryInvoiceId).ToListAsync();
                    foreach (var allocation in invoiceAllocations)
                    {
                        var debitTransactions = await _transactionRepository
                            .Where(t => t.LinkedTransactionId == allocation.TransactionId).ToListAsync();
                        foreach (var debitTran in debitTransactions)
                        {
                            allocation.Amount -= debitTran.Amount;
                        }
                    }

                    balance = transaction.Amount;

                    if (invoiceAllocations.Count > 0)
                    {
                        balance -= invoiceAllocations.Sum(i => i.Amount);
                    }

                    if (balance < 0)
                    {
                        balance = 0;
                    }

                    if (balance > transaction.Amount)
                    {
                        balance = transaction.Amount;
                    }

                    return balance;
                }

                if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                {
                    balance = transaction.Amount - transaction.InvoiceAllocations_TransactionId.Sum(i => i.Amount);
                    var debitAllocations = await _debitTransactionAllocationRepository.Where(d => d.CreditTransactionId == transaction.TransactionId).ToListAsync();
                    balance -= debitAllocations.Sum(i => i.Amount);
                    balance = decimal.Negate(balance);

                    List<billing_Transaction> debitTransactionsForCreditTransaction;

                    switch (transaction.TransactionType)
                    {
                        case TransactionTypeEnum.Payment:
                            debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                    t.LinkedTransactionId == transaction.TransactionId)
                                .ToListAsync();
                            if (debitTransactionsForCreditTransaction.Count > 0)
                            {
                                foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                {
                                    balance += debitTransaction.Amount;
                                }
                            }

                            if (balance > 0)
                            {
                                balance = 0;
                            }

                            return balance;
                        case TransactionTypeEnum.CreditNote:
                            debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                    t.LinkedTransactionId == transaction.TransactionId)
                                .ToListAsync();
                            if (debitTransactionsForCreditTransaction.Count > 0)
                            {
                                foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                {
                                    balance += debitTransaction.Amount;
                                }
                            }

                            if (balance > 0)
                            {
                                balance = 0;
                            }

                            return balance;
                        case TransactionTypeEnum.CreditReallocation:
                            debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                    t.LinkedTransactionId == transaction.TransactionId)
                                .ToListAsync();
                            if (debitTransactionsForCreditTransaction.Count > 0)
                            {
                                foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                {
                                    balance += debitTransaction.Amount;
                                }
                            }

                            if (balance > 0)
                            {
                                balance = 0;
                            }

                            return balance;
                        case TransactionTypeEnum.ClaimRecoveryPayment:
                            debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                    t.LinkedTransactionId == transaction.TransactionId &&
                                    (t.TransactionType == TransactionTypeEnum.ClaimRecoveryPaymentReversal))
                                .ToListAsync();
                            if (debitTransactionsForCreditTransaction.Count > 0)
                            {
                                foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                {
                                    balance += debitTransaction.Amount;
                                }
                            }

                            if (balance > 0)
                            {
                                balance = 0;
                            }

                            return balance;
                        case TransactionTypeEnum.InvoiceReversal:
                            balance = 0;
                            return balance;
                    }
                }
                else if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit && transaction.TransactionType != TransactionTypeEnum.Invoice)
                {
                    balance = transaction.LinkedTransactionId != null ? ((transaction.TransactionType == TransactionTypeEnum.DebitReallocation
                        || transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer) ? transaction.Balance ?? 0 : 0)
                        : (transaction.TransactionType == TransactionTypeEnum.DebitNote || transaction.TransactionType == TransactionTypeEnum.PaymentReversal) ? transaction.Amount : 0;
                    return balance;
                }

                return balance;
            }
        }

        public async Task<List<Transaction>> GetCreditTransactionsWithBalances(int roleplayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactions = await _transactionRepository.Where(s => (s.TransactionTypeLinkId == (int)TransactionActionType.Credit) && s.RolePlayerId == roleplayerId).ToListAsync();

                var transactionsToRemoveIds = new List<int>();

                foreach (var tran in transactions)
                {
                    var balance = await GetTransactionBalance(tran.TransactionId);
                    if (balance >= 0)
                    {
                        transactionsToRemoveIds.Add(tran.TransactionId);
                    }
                }

                transactions.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                return Mapper.Map<List<Transaction>>(transactions);
            }
        }

        public async Task<Invoice> GetRaisedInvoiceByPolicyYearMonth(int policyId, int year, int month)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _invoiceRepository
                    .Where(inv => inv.PolicyId == policyId && inv.InvoiceDate.Year == year && inv.InvoiceDate.Month == month)
                    .OrderByDescending(c => c.InvoiceDate)
                    .FirstOrDefaultAsync();
                return Mapper.Map<Invoice>(invoice);
            }
        }

        public async Task<DateTime> DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum periodStatus)
        {
            var currentPeriod = await _periodService.GetCurrentPeriod();
            var latestPeriod = await _periodService.GetLatestPeriod();

            var now = DateTimeHelper.SaNow;

            switch (periodStatus)
            {
                case PeriodStatusEnum.Current:
                    if (currentPeriod == null) return now;
                    if (now < currentPeriod.EndDate) return now;
                    return currentPeriod.EndDate;
                case PeriodStatusEnum.Latest:
                    if (latestPeriod == null) return now;
                    if (now < latestPeriod.EndDate) return now;
                    return latestPeriod.EndDate;
                default:
                    return now;
            }
        }

        private async Task<int> GetPeriodId(PeriodStatusEnum periodStatus)
        {
            var currentPeriod = new Period();
            switch (periodStatus)
            {
                case PeriodStatusEnum.Current:
                    currentPeriod = await _periodService.GetCurrentPeriod();
                    return currentPeriod.Id;
                case PeriodStatusEnum.Latest:
                    var latestPeriod = await _periodService.GetLatestPeriod();
                    return latestPeriod.Id;
                default:
                    currentPeriod = await _periodService.GetCurrentPeriod();
                    return currentPeriod.Id;
            }
        }

        public async Task<decimal> GetDebtorBalanceByRolePlayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.Create())
            {
                var debitNotes = await _transactionRepository.Where(x => x.RolePlayerId == rolePlayerId && x.TransactionType == TransactionTypeEnum.DebitNoteDebtAdjustment).ToListAsync();
                var creditNotes = await _transactionRepository.Where(x => x.RolePlayerId == rolePlayerId && x.TransactionType == TransactionTypeEnum.CreditNoteDebtAdjustment).ToListAsync();
                var balance = 0.00M;
                if (debitNotes.Any())
                {
                    foreach (var debitNote in debitNotes)
                    {
                        balance += debitNote.Amount;
                    }
                }
                if (creditNotes.Any())
                {
                    foreach (var creditNote in creditNotes)
                    {
                        balance -= creditNote.Amount;
                    }
                }

                return balance;
            }
        }

        public async Task<decimal> GetDebtorForPayOutBalanceByRolePlayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var debitNotes = await _transactionRepository.Where(x => x.RolePlayerId == rolePlayerId && x.TransactionTypeLinkId == (int)TransactionActionType.Debit
                && x.TransactionReason == TransactionReasonEnum.ClaimsPaymentReversal)
               .ToListAsync();

                var creditNotes = await _transactionRepository.Where(x => x.RolePlayerId == rolePlayerId && x.TransactionTypeLinkId == (int)TransactionActionType.Credit
                && x.TransactionReason == TransactionReasonEnum.ClaimsPaymentReversal).ToListAsync();
                var balance = 0.00M;
                if (debitNotes.Any())
                {
                    foreach (var debitNote in debitNotes)
                    {
                        balance += debitNote.Amount;
                    }
                }
                if (creditNotes.Any())
                {
                    foreach (var creditNote in creditNotes)
                    {
                        balance -= creditNote.Amount;
                    }
                }
                return balance;
            }
        }

        private async Task<int> GetPeriodIdBasedOnOpenPeriod()
        {
            var latestPeriod = await _periodService.GetLatestPeriod();
            if (latestPeriod != null)
                return latestPeriod.Id;
            else
                return await GetPeriodId(PeriodStatusEnum.Current);
        }

        public async Task<int> AddTransaction(Transaction transaction)
        {
            Contract.Requires(transaction != null);
            int periodId = 0;
            var transactionDate = DateTime.Now.ToSaDateTime();
            var latestPeriod = await _periodService.GetLatestPeriod();
            if (latestPeriod != null)
                periodId = latestPeriod.Id;
            else
                periodId = await GetPeriodId(PeriodStatusEnum.Current);
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    transaction.TransactionDate = transactionDate;
                    transaction.PeriodId = periodId;
                    var entity = Mapper.Map<billing_Transaction>(transaction);

                    _transactionRepository.Create(entity);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                    return entity.TransactionId;
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when creating transaction - > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> PostItemToGeneralLedger(int roleplayerId, int itemId, decimal amount, int bankAccountId, string incomeStatementChart, string balanceSheetChart, bool isAllocated, IndustryClassEnum industryClass, int? contraTransactionId)
        {
            await _abilityTransactionsAuditService.PostItemToGeneralLedger(roleplayerId, itemId, amount, bankAccountId, incomeStatementChart, balanceSheetChart, isAllocated, industryClass, contraTransactionId);
            return await Task.FromResult(true);
        }

        public async Task CreateAdjustmentCreditNote(UpdatePolicyPremiumMessage updatePolicyPremiumMessage)
        {
            if (updatePolicyPremiumMessage == null) return;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var systemUser = "AdjustmentCreditNoteProcess";
                var dateMonthFormat = "MMMM";
                var billingNotes = new List<BillingNote>();
                var transactionDescription = $"Credit Adjustment - {updatePolicyPremiumMessage.AdjustmentStartDate.Value.ToString(dateMonthFormat)}";
                var note = new Note
                {
                    ItemId = updatePolicyPremiumMessage.PolicyId,
                    ItemType = nameof(ItemTypeEnum.Policy),
                    Text = transactionDescription,
                    Reason = "Adjustment Credit Note",
                    CreatedBy = systemUser,
                    ModifiedBy = systemUser
                };

                var billingNote = Mapper.Map<BillingNote>(note);

                billingNote.IsActive = true;
                billingNotes.Add(billingNote);
                
                var transaction = new Transaction
                {
                    PolicyId = updatePolicyPremiumMessage.PolicyId,
                    Amount = updatePolicyPremiumMessage.AdjustmentPremium,
                    TransactionType = TransactionTypeEnum.CreditNote,
                    TransactionDate = DateTimeHelper.SaNow,
                    PeriodId = (int)PeriodStatusEnum.Current,
                    RolePlayerId = updatePolicyPremiumMessage.RolePlayerId,
                    Description = transactionDescription,
                    IsBackDated = true,
                    TransactionEffectiveDate = updatePolicyPremiumMessage.AdjustmentStartDate,
                    TransactionReason = TransactionReasonEnum.PremiumAdjustment,
                    BankReference = updatePolicyPremiumMessage.PolicyNumber,
                    InvoiceId = updatePolicyPremiumMessage.InvoiceId,
                    LinkedTransactionId = updatePolicyPremiumMessage.TransactionId,
                    CreatedBy = systemUser,
                    ModifiedBy = systemUser,
                    Reason = !string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.TransactionReason) ? updatePolicyPremiumMessage.TransactionReason : $"Adjustment Credit Note: {updatePolicyPremiumMessage.AdjustmentStartDate.Value.ToString("yyyy/MM/dd")}"
                };

                var transactions = new List<Transaction>
                {
                    transaction
                };

                var adjustmentCreditNote = new CreditNoteAccount
                {
                    PeriodStatus = PeriodStatusEnum.Current,
                    RolePlayerId = updatePolicyPremiumMessage.RolePlayerId,
                    Note = note,
                    Transactions = transactions,
                    PolicyIds = new List<int> { updatePolicyPremiumMessage.PolicyId }
                };

                var results = await _transactionService.AddAdjustmentCreditNote(adjustmentCreditNote);

                foreach (var transactionId in results)
                {
                    if (transactionId > 0)
                    {
                        var invoiceAllocation = new billing_InvoiceAllocation()
                        {
                            Amount = updatePolicyPremiumMessage.AdjustmentPremium,
                            InvoiceId = updatePolicyPremiumMessage.InvoiceId,
                            CreatedBy = systemUser,
                            ModifiedBy = systemUser,
                            LinkedTransactionId = updatePolicyPremiumMessage.TransactionId,
                            TransactionId = transactionId,
                            ProductCategoryType = ProductCategoryTypeEnum.Funeral,
                            BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation
                        };

                        _invoiceAllocationRepository.Create(invoiceAllocation);
                    }
                }

                await _billingService.AddBillingNotes(billingNotes);

                await scope.SaveChangesAsync(CancellationToken.None);
            }
        }
    }
}
