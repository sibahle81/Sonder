using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Exceptions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class ClaimRecoveryInvoiceFacade : RemotingStatelessService, IClaimRecoveryInvoiceService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private readonly IRepository<billing_ClaimRecoveryInvoice> _invoiceRepository;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<billing_InvoiceAllocation> _invoiceAllocationRepository;
        private readonly IConfigurationService _configurationService;

        public ClaimRecoveryInvoiceFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<billing_ClaimRecoveryInvoice> invoiceRepository,
            IRepository<billing_Transaction> transactionRepository,
            IRepository<billing_InvoiceAllocation> invoiceAllocationRepository,
            IRolePlayerService rolePlayerService,
            IConfigurationService configurationService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
            _transactionRepository = transactionRepository;
            _invoiceAllocationRepository = invoiceAllocationRepository;
            _rolePlayerService = rolePlayerService;
            _configurationService = configurationService;
        }

        public async Task<ClaimRecoveryInvoice> GetInvoice(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.Create())
            {
                var invoice = await _invoiceRepository
                    .FirstOrDefaultAsync(inv => inv.ClaimRecoveryInvoiceId == id);

                if (invoice == null)
                {
                    throw new BusinessException($"Could not find invoice with id {id}");
                }

                await _invoiceRepository.LoadAsync(invoice, x => x.Transactions);

                return Mapper.Map<ClaimRecoveryInvoice>(invoice);
            }
        }

        public async Task<int> AddInvoice(ClaimRecoveryInvoice invoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_ClaimRecoveryInvoice>(invoice);
                _invoiceRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.ClaimRecoveryInvoiceId;
            }
        }

        public async Task<List<InvoicePaymentAllocation>> GetUnPaidInvoices(int roleplayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoicePaymentAllocations = new List<InvoicePaymentAllocation>();

                var invoiceTransactions = await _transactionRepository.Where(s =>
                s.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice
                && s.RolePlayerId == roleplayerId).ToListAsync();

                var finPayeNumber = (await _rolePlayerService.GetFinPayee(roleplayerId)).FinPayeNumber;

                foreach (var invoiceTransaction in invoiceTransactions)
                {
                    var invoice = await _invoiceRepository.FirstOrDefaultAsync(s =>
                        s.ClaimRecoveryInvoiceId == invoiceTransaction.ClaimRecoveryInvoiceId);
                    if (invoice == null) continue;

                    var outstandingAmount = await GetInvoiceBalance(invoice.ClaimRecoveryInvoiceId);
                    if (outstandingAmount <= 0) continue;

                    var allocation = new InvoicePaymentAllocation()
                    {
                        InvoiceId = invoice.ClaimRecoveryInvoiceId,
                        InvoiceStatus = invoice.InvoiceStatus,
                        TotalInvoiceAmount = invoice.Amount,
                        AmountOutstanding = outstandingAmount,
                        DisplayName = finPayeNumber,
                        IsClaimRecoveryInvoice = true
                    };

                    invoicePaymentAllocations.Add(allocation);
                }

                return invoicePaymentAllocations;
            }
        }


        public async Task<List<ClaimRecoveryInvoice>> GetUnsettledInvoices(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<ClaimRecoveryInvoice>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await (from inv in _invoiceRepository
                                      join transactions in _transactionRepository on inv.ClaimRecoveryInvoiceId equals transactions.InvoiceId
                                      where transactions.RolePlayerId == rolePlayerId
                                            && (inv.InvoiceStatus == InvoiceStatusEnum.Pending || inv.InvoiceStatus == InvoiceStatusEnum.Partially
                                            || inv.InvoiceStatus == InvoiceStatusEnum.Unpaid) && transactions.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice
                                      select inv).ToListAsync();

                foreach (var invoice in invoices)
                {
                    var balance = await GetInvoiceBalance(invoice.ClaimRecoveryInvoiceId);
                    if (balance > 0)
                    {
                        results.Add(Mapper.Map<ClaimRecoveryInvoice>(invoice));
                    }
                }
            }

            return results;
        }

        public async Task<decimal> GetInvoiceBalance(int invoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _invoiceRepository.Where(i => i.ClaimRecoveryInvoiceId == invoiceId).SingleAsync();

                var invoiceTransaction = await _transactionRepository
                    .Where(t => t.ClaimRecoveryInvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice).SingleAsync();

                var invoiceAllocations = await _invoiceAllocationRepository
                    .Where(i => i.ClaimRecoveryId == invoiceId).ToListAsync();
                foreach (var allocation in invoiceAllocations)
                {
                    var reversalTransaction = await _transactionRepository
                        .Where(t => t.LinkedTransactionId == allocation.TransactionId).FirstOrDefaultAsync();
                    if (reversalTransaction != null &&
                        (reversalTransaction.TransactionType == TransactionTypeEnum.DebitNote ||
                         reversalTransaction.TransactionType == TransactionTypeEnum.ClaimRecoveryPaymentReversal))
                    {
                        allocation.Amount = 0;
                    }
                }

                var balance = invoice.Amount - invoiceAllocations.Sum(i => i.Amount);
                if (balance < 0)
                    balance = 0;

                return balance;
            }
        }
    }
}
