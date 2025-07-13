using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
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
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using InvoiceAllocation = RMA.Service.Billing.Contracts.Entities.InvoiceAllocation;
using Refund = RMA.Service.Billing.Contracts.Entities.Refund;
using RefundHeader = RMA.Service.Billing.Contracts.Entities.RefundHeader;
using Statement = RMA.Service.Billing.Contracts.Entities.Statement;
using Transaction = RMA.Service.Billing.Contracts.Entities.Transaction;

namespace RMA.Service.Billing.Services
{
    public class TransactionFacade : RemotingStatelessService, ITransactionService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const string ViewPayments = "View Payments";
        private const string SoftDeleteFilter = "SoftDeletes";
        private const string interestReversal = "Interest Reversal";
        private const string interestAdjustment = "Interest Adjustment";
        private const string suspenseName = "Suspense";

        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IPaymentAllocationService _paymentAllocationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<billing_InvoiceAllocation> _invoiceAllocationRepository;
        private readonly IRepository<billing_RefundHeader> _refundHeaderRepository;
        private readonly IRepository<billing_RefundHeaderDetail> _refundHeaderDetailRepository;
        private readonly IRepository<billing_UnallocatedPayment> _unallocatedPaymentRepository;
        private readonly IPeriodService _periodService;
        private readonly IRepository<billing_AdhocPaymentInstruction> _adhocPaymentInstructionRepository;
        private readonly IRepository<billing_DebitTransactionAllocation> _debitTransactionAllocationRepository;
        private readonly IRepository<finance_BankStatementEntry> _facsStatementRepository;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IRepository<billing_PremiumListingTransaction> _premiumListingTransactionsRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<Load_PremiumPaymentDueCreditNote> _premiumPaymentDueCreditNoteRepository;
        private readonly IInvoiceService _invoiceService;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly IProductOptionService _productOptionService;
        private readonly IDocumentNumberService _documentNumberService;
        private readonly IBillingService _billingService;
        private readonly IPolicyService _policyService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IRepository<Load_PremiumListingPaymentFile> _premiumListingPaymentFileRepository;
        private readonly IRepository<Load_PremiumListingPayment> _premiumListingPaymentRepository;
        private readonly IRepository<Load_PremiumPaymentFileValidation> _premiumPaymentFileValidationRepository;
        private readonly IRepository<billing_PremiumTransactionPaymentFile> _premiumTransactionPaymentFileRepository;
        private readonly ITransactionCreatorService _transactionCreatorService;
        private readonly IPaymentCreatorService _paymentCreatorService;
        private readonly IBankBranchService _bankBranchService;
        private readonly IProductService _productService;
        private readonly IBankAccountService _bankAccountService;
        private readonly IRepository<billing_SuspenseDebtorBankMapping> _suspenseDebtorBankMappingRepository;
        private readonly IRepository<billing_CompanyBranchBankAccount> _companyBranchBankAccountRepository;
        public TransactionFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<billing_Transaction> transactionRepository,
            IRepository<billing_Invoice> invoiceRepository,
            IDocumentGeneratorService documentGeneratorService,
            IPaymentAllocationService paymentAllocationService,
            IRolePlayerService rolePlayerService,
            IRepository<billing_InvoiceAllocation> invoiceAllocationRepository,
            IRepository<billing_RefundHeader> refundHeaderRepository,
            IRepository<billing_RefundHeaderDetail> refundHeaderDetailRepository,
            IRepository<billing_UnallocatedPayment> unallocatedPaymentRepository,
            IPeriodService periodService,
            IRepository<billing_AdhocPaymentInstruction> adhocPaymentInstructionRepository,
            IRepository<billing_DebitTransactionAllocation> debitTransactionAllocationRepository,
            IRepository<finance_BankStatementEntry> facsStatementRepository,
            IRepository<billing_PremiumListingTransaction> premiumListingTransactionsRepository,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IConfigurationService configurationService,
            IRepository<Load_PremiumPaymentDueCreditNote> premiumPaymentDueCreditNoteRepository,
            IRepository<client_FinPayee> finPayeeRepository,
            IProductOptionService productOptionService,
            IDocumentNumberService documentNumberService,
            IBillingService billingService,
            IPolicyService policyService,
            IDocumentIndexService documentIndexService,
            IRepository<Load_PremiumListingPaymentFile> premiumListingPaymentFileRepository,
            IRepository<Load_PremiumListingPayment> premiumListingPaymentRepository,
            ITransactionCreatorService transactionCreatorService,
            IPaymentCreatorService paymentCreatorService,
            IBankBranchService bankBranchService,
            IProductService productService,
            IBankAccountService bankAccountService,
            IRepository<billing_SuspenseDebtorBankMapping> suspenseDebtorBankMappingRepository,
            IRepository<billing_PremiumTransactionPaymentFile> premiumTransactionPaymentFileRepository,
            IRepository<Load_PremiumPaymentFileValidation> premiumPaymentFileValidationRepository,
            IInvoiceService invoiceService,
            IRepository<billing_CompanyBranchBankAccount> companyBranchBankAccountRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _transactionRepository = transactionRepository;
            _invoiceRepository = invoiceRepository;
            _documentGeneratorService = documentGeneratorService;
            _paymentAllocationService = paymentAllocationService;
            _rolePlayerService = rolePlayerService;
            _invoiceAllocationRepository = invoiceAllocationRepository;
            _refundHeaderRepository = refundHeaderRepository;
            _refundHeaderDetailRepository = refundHeaderDetailRepository;
            _unallocatedPaymentRepository = unallocatedPaymentRepository;
            _periodService = periodService;
            _adhocPaymentInstructionRepository = adhocPaymentInstructionRepository;
            _debitTransactionAllocationRepository = debitTransactionAllocationRepository;
            _facsStatementRepository = facsStatementRepository;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _premiumListingTransactionsRepository = premiumListingTransactionsRepository;
            _configurationService = configurationService;
            _premiumPaymentDueCreditNoteRepository = premiumPaymentDueCreditNoteRepository;
            _finPayeeRepository = finPayeeRepository;
            _productOptionService = productOptionService;
            _documentNumberService = documentNumberService;
            _billingService = billingService;
            _policyService = policyService;
            _documentIndexService = documentIndexService;
            _premiumListingPaymentFileRepository = premiumListingPaymentFileRepository;
            _premiumListingPaymentRepository = premiumListingPaymentRepository;
            _transactionCreatorService = transactionCreatorService;
            _paymentCreatorService = paymentCreatorService;
            _bankBranchService = bankBranchService;
            _productService = productService;
            _bankAccountService = bankAccountService;
            _invoiceService = invoiceService;
            _suspenseDebtorBankMappingRepository = suspenseDebtorBankMappingRepository;
            _premiumTransactionPaymentFileRepository = premiumTransactionPaymentFileRepository;
            _premiumPaymentFileValidationRepository = premiumPaymentFileValidationRepository;
            _companyBranchBankAccountRepository = companyBranchBankAccountRepository;
        }

        public async Task<List<Transaction>> GetTransactions()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactions = await _transactionRepository
                    .Where(tr => tr.TransactionId > 0)
                    .ToListAsync();
                await _transactionRepository.LoadAsync(transactions, x => x.Invoice);
                await _transactionRepository.LoadAsync(transactions, x => x.TransactionTypeLink);
                return Mapper.Map<List<Transaction>>(transactions);
            }
        }

        public async Task<Transaction> GetTransaction(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.Create())
            {
                var transaction = await _transactionRepository.SingleAsync(tr => tr.TransactionId == id, $"Could not find transaction with id {id}");

                return Mapper.Map<Transaction>(transaction);
            }
        }

        public async Task<int> AddTransaction(Transaction transaction)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            Contract.Requires(transaction != null);


            if (transaction.TransactionType == TransactionTypeEnum.CreditNoteDebtAdjustment)
            {
                var entity = Mapper.Map<billing_Transaction>(transaction);
                billing_Invoice invoice = new billing_Invoice();

                if (transaction.InvoiceId.HasValue)
                {
                    if (transaction.RolePlayerId == 0)
                    {
                        invoice = await _invoiceRepository.SingleAsync(i => i.InvoiceId == transaction.InvoiceId);
                        await _invoiceRepository.LoadAsync(invoice, x => x.Policy);
                        entity.RolePlayerId = invoice.Policy.PolicyOwnerId;
                    }
                }
                else if (transaction.AdhocPaymentInstructionId.HasValue)
                {
                    if (transaction.RolePlayerId == 0)
                    {
                        var adhocPaymentInstruction = await _adhocPaymentInstructionRepository.SingleAsync(i => i.AdhocPaymentInstructionId == transaction.AdhocPaymentInstructionId);
                        entity.RolePlayerId = adhocPaymentInstruction.RolePlayerId;
                    }
                }

                var period = await _periodService.GetPeriods();
                var inceptionDate = invoice?.Policy?.PolicyInceptionDate;
            }


            int periodId = 0;
            var transactionDate = DateTime.Now.ToSaDateTime();
            var latestPeriod = await _periodService.GetLatestPeriod();
            if (latestPeriod != null)
                periodId = latestPeriod.Id;
            else
                periodId = await GetPeriodId(PeriodStatusEnum.Current);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                transaction.TransactionDate = transactionDate;
                transaction.PeriodId = periodId;
                var entity = Mapper.Map<billing_Transaction>(transaction);
                if (transaction.InvoiceId.HasValue)
                {
                    if (transaction.RolePlayerId == 0)
                    {
                        var invoice = await _invoiceRepository.SingleAsync(i => i.InvoiceId == transaction.InvoiceId);
                        await _invoiceRepository.LoadAsync(invoice, x => x.Policy);
                        entity.RolePlayerId = invoice.Policy.PolicyOwnerId;
                    }
                }
                else if (transaction.AdhocPaymentInstructionId.HasValue)
                {
                    if (transaction.RolePlayerId == 0)
                    {
                        var adhocPaymentInstruction = await _adhocPaymentInstructionRepository.SingleAsync(i => i.AdhocPaymentInstructionId == transaction.AdhocPaymentInstructionId);
                        entity.RolePlayerId = adhocPaymentInstruction.RolePlayerId;
                    }
                }

                _transactionRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.TransactionId;
            }
        }

        public async Task<int> AddClaimRecoveryInvoiceTransaction(Transaction transaction)
        {
            Contract.Requires(transaction != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                transaction.TransactionDate = postingDate;
                transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                var entity = Mapper.Map<billing_Transaction>(transaction);

                _transactionRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.TransactionId;
            }
        }

        public async Task AddTransactions(List<Transaction> transactions)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            Contract.Requires(transactions != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                foreach (var transaction in transactions)
                {
                    transaction.TransactionDate = postingDate;
                    transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                    var entity = Mapper.Map<billing_Transaction>(transaction);
                    var invoice = await _invoiceRepository.SingleAsync(i => i.InvoiceId == transaction.InvoiceId);
                    await _invoiceRepository.LoadAsync(invoice, x => x.Policy);
                    entity.RolePlayerId = invoice.Policy.PolicyOwnerId;
                    _transactionRepository.Create(entity);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task EditTransaction(Transaction transaction)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            Contract.Requires(transaction != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataCrossRef = await _transactionRepository.Where(x => x.TransactionId == transaction.TransactionId).SingleAsync();

                _transactionRepository.Update(dataCrossRef);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task AddCreditNote(CreditNoteAccount creditNoteAccount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            Contract.Requires(creditNoteAccount != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                var reference = await _invoiceService.CreateCreditNoteReferenceNumber();

                foreach (var transaction in creditNoteAccount?.Transactions)
                {
                    transaction.TransactionType = TransactionTypeEnum.CreditNote;
                    var mapped = Mapper.Map<billing_Transaction>(transaction);
                    mapped.Reason = creditNoteAccount?.Note.Text;
                    mapped.BankReference = reference;
                    mapped.TransactionDate = postingDate;
                    mapped.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                    mapped.Invoice = null;
                    mapped.InvoiceId = transaction.InvoiceId;
                    mapped.TransactionTypeLinkId = 2;
                    mapped.RolePlayerId = creditNoteAccount == null ? 0 : creditNoteAccount.RolePlayerId;

                    _transactionRepository.Create(mapped);
                }

                await scope.SaveChangesAsync();
            }
        }

        public async Task EditCreditNote(CreditNoteAccount creditNoteAccount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            Contract.Requires(creditNoteAccount != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var transaction in creditNoteAccount?.Transactions)
                {
                    var mapped = Mapper.Map<billing_Transaction>(transaction);
                    mapped.Reason = creditNoteAccount?.Note.Text;
                    mapped.RolePlayerId = creditNoteAccount == null ? 0 : creditNoteAccount.RolePlayerId;
                    _transactionRepository.Update(mapped);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<Transaction> AddRefund(Refund refund)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            if (refund == null) return null;
            using (var scope = _dbContextScopeFactory.Create())
            {
                var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                var transaction = new billing_Transaction
                {
                    Reason = refund.Note.Text,
                    TransactionType = TransactionTypeEnum.Refund,
                    RmaReference = await CreateRefundReferenceNumber(),
                    TransactionDate = postingDate,
                    PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                    Amount = refund.RefundAmount,
                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                    RolePlayerId = refund.RolePlayerId
                };


                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<Transaction>(transaction);
            }
        }

        public async Task<decimal> GetPolicyPremiumBalance(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await (from inv in _invoiceRepository
                                      join transactions in _transactionRepository on inv.InvoiceId equals transactions.InvoiceId
                                      where inv.PolicyId == policyId && transactions.TransactionType == TransactionTypeEnum.Invoice
                                      select inv).ToListAsync();
                var invoices = Mapper.Map<List<Invoice>>(entities);
                var balance = 0.00M;
                foreach (var invoice in invoices)
                {
                    balance += invoice.Balance;
                }

                return balance;
            }
        }

        public async Task EditRefund(Refund transaction)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var checkTran = _transactionRepository.Where(a => a.Invoice.PolicyId == transaction.RolePlayerId).ToListAsync();

                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task AssignTransactionsToInvoice(List<int> transactionIds, int invoiceId)
        {
            if (transactionIds?.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    foreach (var transactionId in transactionIds)
                    {
                        var entity = await _transactionRepository.Where(x => x.TransactionId == transactionId)
                            .SingleAsync();
                        entity.InvoiceId = invoiceId;
                        _transactionRepository.Update(entity);
                    }

                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                }
            }
        }

        public async Task<List<Transaction>> GetInvoiceTransactions(int invoiceId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (from inv in _invoiceRepository
                                    join transactions in _transactionRepository on inv.InvoiceId equals transactions.InvoiceId
                                    where inv.InvoiceId == invoiceId
                                    select transactions).ToListAsync();
                return Mapper.Map<List<Transaction>>(result);
            }
        }

        public async Task<List<Transaction>> GetTransactionByRoleplayerId(int roleplayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.Where(t =>
                        t.RolePlayerId == roleplayerId && t.IsDeleted != true &&
                        (t.TransactionTypeLinkId == (int)TransactionActionType.Credit))
                    .ToListAsync();

                var transactions = Mapper.Map<List<Transaction>>(entities);

                var transactionsToRemoveIds = new List<int>();

                foreach (var tran in transactions)
                {
                    var balance = await GetTransactionBalance(tran);
                    tran.Balance = balance;
                    tran.OriginalUnallocatedAmount = balance;

                    if (balance <= 0)
                    {
                        transactionsToRemoveIds.Add(tran.TransactionId);
                    }
                }


                transactions.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                return transactions.ToList();
            }
        }

        private async Task<bool> TransactionInvoiceAllocationExistsForPolicy(int transactionId, int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceAllocationRepository.Where(x => x.TransactionId == transactionId).ToListAsync();

                if (entities == null)
                {
                    return false;
                }

                foreach (var entity in entities)
                {
                    await _invoiceAllocationRepository.LoadAsync(entity, t => t.Invoice);
                }

                return entities.FirstOrDefault(x => x.Invoice?.PolicyId == policyId) != null;
            }

        }

        public async Task<List<Transaction>> GetTransactionByPolicyIdAndTransactionType(int policyId, TransactionTypeEnum transactionType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            //get policy
            var policy = await _policyService.GetPolicy(policyId);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<Transaction> transactions = new List<Transaction>();
                var entities = await _transactionRepository.Where(t => t.RolePlayerId == policy.PolicyOwnerId && t.IsDeleted != true && t.TransactionType == transactionType).ToListAsync();

                foreach (var entity in entities)
                {
                    await _transactionRepository.LoadAsync(entity, t => t.Invoice);
                    await _transactionRepository.LoadAsync(entity, t => t.InvoiceAllocations_TransactionId);
                }

                if (transactionType == TransactionTypeEnum.Payment)
                {
                    var paymentTransactions = entities.FindAll(x => x.InvoiceAllocations_TransactionId.FirstOrDefault(y => TransactionInvoiceAllocationExistsForPolicy(y.TransactionId, policyId).Result) != null);
                    transactions.AddRange(Mapper.Map<List<Transaction>>(paymentTransactions));
                }
                else
                {
                    var otherTransactions = entities.FindAll(x => x.Invoice?.PolicyId == policyId);
                    transactions.AddRange(Mapper.Map<List<Transaction>>(otherTransactions));
                }

                foreach (var tran in transactions)
                {
                    var balance = await GetTransactionBalance(tran);
                    tran.Balance = balance;
                    tran.OriginalUnallocatedAmount = balance;
                }

                return transactions.ToList();
            }
        }

        public async Task<List<Transaction>> GetTransactionByRoleplayerIdAndTransactionType(int roleplayerId, TransactionTypeEnum transactionType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.Where(t => t.RolePlayerId == roleplayerId && t.IsDeleted != true && t.TransactionType == transactionType).ToListAsync();

                var transactions = Mapper.Map<List<Transaction>>(entities);

                foreach (var tran in transactions)
                {
                    var balance = await GetTransactionBalance(tran);
                    tran.Balance = balance;
                    tran.OriginalUnallocatedAmount = balance;
                }

                return transactions.ToList();
            }
        }

        public async Task<Transaction> ReverseTransaction(Transaction transaction)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var transactionToReverse = Mapper.Map<billing_Transaction>(transaction);
                await _transactionRepository.LoadAsync(transactionToReverse, x => x.Invoice);
                await _transactionRepository.LoadAsync(transactionToReverse, x => x.TransactionTypeLink);

                var reversalTransaction = new billing_Transaction();

                var transactionTypeLink = reversalTransaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? TransactionActionType.Credit : TransactionActionType.Debit;
                reversalTransaction = transactionToReverse;
                reversalTransaction.Reason = transactionToReverse.Reason;
                reversalTransaction.TransactionTypeLinkId = (int)transactionTypeLink;

                switch (transactionToReverse.TransactionType)
                {
                    case TransactionTypeEnum.CreditNote:
                        reversalTransaction.TransactionType = TransactionTypeEnum.DebitNote;
                        break;

                    case TransactionTypeEnum.DebitNote:
                        reversalTransaction.TransactionType = TransactionTypeEnum.CreditNote;
                        break;

                    case TransactionTypeEnum.Payment:
                        // TODO fix invoice status attached to payment
                        // TODO fix payment back to unllocated?
                        reversalTransaction.TransactionType = TransactionTypeEnum.PaymentReversal;
                        break;

                    case TransactionTypeEnum.PaymentReversal:
                        transactionToReverse.Invoice.InvoiceStatus = InvoiceStatusEnum.Pending;
                        //put in suspense account
                        await _paymentAllocationService.UnallocateReversal(transaction);

                        _invoiceRepository.Update(transactionToReverse.Invoice);
                        await scope.SaveChangesAsync();
                        break;

                    default:
                        break;
                }

                await AddTransaction(Mapper.Map<Contracts.Entities.Transaction>(reversalTransaction));

                return Mapper.Map<Contracts.Entities.Transaction>(reversalTransaction);
            }
        }

        public async Task<string> CreateRefundReferenceNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.RefundNumber, "Rf");
        }

        public async Task<bool> ReversePaymentTransactionsByIds(TransactionsReversalRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            if (request == null)
            {
                return false;
            }

            var transactionIds = request?.TransactionIds;
            List<Transaction> transactions;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _transactionRepository
                    .Where(c => transactionIds.Contains(c.TransactionId)).ToListAsync();
                transactions = Mapper.Map<List<Transaction>>(result);
            }

            if (transactions.Count > 0)
            {
                var periodId = await GetPeriodId(request.PeriodStatus);
                if (request.ToRoleplayerId <= 0)
                {
                    foreach (var transaction in transactions)
                    {
                        await ReverseTransactionAddingLinkId(transaction, periodId);
                        //put in suspense account
                        await PutRevesersedAmountBackInSuspenseAccount(transaction);
                    }
                }
                //allocate transaction to ToDebtor
                else
                {
                    var transactionDate = DateTime.Now.ToSaDateTime();
                    foreach (var transaction in transactions)
                    {
                        await ReverseTransactionAddingLinkId(transaction, periodId);
                        var newTransaction = new Transaction
                        {
                            Reason = "Debtor allocation due to reversal",
                            TransactionType = TransactionTypeEnum.Payment,
                            RmaReference = string.IsNullOrEmpty(transaction.BankReference) ? transaction.RmaReference : transaction.BankReference,
                            TransactionDate = transactionDate,
                            Amount = transaction.Amount,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            PeriodId = periodId,
                        };

                        if (transaction.BankStatementEntryId.HasValue)
                            newTransaction.BankStatementEntryId = transaction.BankStatementEntryId.Value;

                        await _paymentAllocationService.AllocateCreditTransaction(newTransaction, request.ToRoleplayerId, newTransaction.Amount, null, null, null);
                    }
                }
            }
            return await Task.FromResult(true);
        }

        public async Task<List<Transaction>> GetTransactionsForTransfer(string debtorNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var finPayee = await _rolePlayerService.GetFinPayeeByFinpayeNumber(debtorNumber);

                var entities = await _transactionRepository.
                    Where(t => t.RolePlayerId == finPayee.RolePlayerId
                               && (t.TransactionType == TransactionTypeEnum.CreditNote || t.TransactionType == TransactionTypeEnum.Payment || t.TransactionType == TransactionTypeEnum.CreditReallocation)).ToListAsync();

                foreach (var entity in entities)
                {
                    await _transactionRepository.LoadAsync(entity, t => t.InvoiceAllocations_TransactionId);
                }

                var transactions = Mapper.Map<List<Transaction>>(entities);

                var transactionsToRemove = await _transactionRepository.Where(s =>
                    (s.TransactionType == TransactionTypeEnum.PaymentReversal || s.TransactionType == TransactionTypeEnum.DebitNote) && s.RolePlayerId == finPayee.RolePlayerId).ToListAsync();

                var transactionsToRemoveIds = new List<int>();

                foreach (var debitTran in transactionsToRemove)
                {
                    var tran = transactions.FirstOrDefault(t => t.TransactionId == debitTran.LinkedTransactionId);
                    if (tran != null)
                    {
                        transactionsToRemoveIds.Add(tran.TransactionId);
                    }
                }


                transactions.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                transactionsToRemoveIds.Clear();

                foreach (var tran in transactions)
                {
                    var reallocationsOfTran = await _transactionRepository.Where(t =>
                        (t.TransactionType == TransactionTypeEnum.DebitReallocation || t.TransactionType == TransactionTypeEnum.InterDebtorTransfer) && t.LinkedTransactionId == tran.TransactionId && t.TransactionTypeLinkId == (int)TransactionActionType.Debit).ToListAsync();
                    if (reallocationsOfTran.Sum(t => t.Amount) >= tran.Amount)
                    {

                        transactionsToRemoveIds.Add(tran.TransactionId);
                    }
                    else
                    {
                        tran.UnallocatedAmount = tran.Amount - reallocationsOfTran.Sum(t => t.Amount);
                        tran.OriginalUnallocatedAmount = tran.UnallocatedAmount;
                        tran.Balance = tran.Amount - reallocationsOfTran.Sum(t => t.Amount);
                    }
                }

                transactions.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                return transactions.ToList();
            }
        }

        public async Task CreditNoteReversal(CreditNoteReversals creditNoteReversal)
        {

            Contract.Requires(creditNoteReversal != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            var transactions = new List<Contracts.Entities.Transaction>();

            foreach (Contracts.Entities.Transaction transaction in creditNoteReversal.Transactions)
            {
                if (transaction.TransactionType == TransactionTypeEnum.CreditNote)
                {
                    var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                    var transactionPrev = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                    var reference = await CreateDebitNoteReferenceNumber();
                    var reversalTransactionEntry = new Contracts.Entities.Transaction
                    {
                        Amount = transaction.Amount,
                        BankReference = reference,
                        BankStatementEntryId = transaction.BankStatementEntryId,
                        FinPayees = transaction.FinPayees,
                        Invoice = transaction.Invoice,
                        InvoiceId = transaction.InvoiceId,
                        Reason = transaction.Reason,
                        RmaReference = transaction.RmaReference,
                        RolePlayerId = transaction.RolePlayerId,
                        TransactionType = TransactionTypeEnum.DebitNote,
                        TransactionDate = postingDate,
                        PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                        LinkedTransactionId = transaction.TransactionId,
                        TransactionTypeLinkId = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? (int)TransactionActionType.Credit : (int)TransactionActionType.Debit
                    };

                    transactions.Add(reversalTransactionEntry);
                }
            }
            if (transactions != null)
                await AddDebitNoteTransactions(transactions);
        }

        private async Task<int> CreateRefundHeader(string reference, decimal headerAmount, int rolePlayerId, string reason, int periodId, RefundStatusEnum? refundStatus)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var header = new billing_RefundHeader() { Reference = reference, HeaderTotalAmount = headerAmount, RolePlayerId = rolePlayerId, Reason = reason, PeriodId = periodId };

                if (refundStatus.HasValue)
                    header.RefundStatus = refundStatus.Value;

                _refundHeaderRepository.Create(header);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return header.RefundHeaderId;
            }
        }

        private async Task CreateRefundHeaderDetail(int headerId, int? linkedTransactionId, decimal amount, string fromBankAccount, string toBankAccount,
            int? policyId, int? productId, ProductCategoryTypeEnum? productcategoryId, int companyNumber, int branchNumber)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var headerDetail = new billing_RefundHeaderDetail
                {
                    RefundHeaderId = headerId,
                    TotalAmount = amount,
                    FromAccountNumber = fromBankAccount,
                    ToAccountNumber = toBankAccount,
                    CompanyNumber = companyNumber,
                    BranchNumber = branchNumber
                };
                if (linkedTransactionId.HasValue)
                    headerDetail.TransactionId = linkedTransactionId.Value;
                if (policyId.HasValue)
                    headerDetail.PolicyId = policyId.Value;
                if (productcategoryId.HasValue)
                    headerDetail.ProductCategoryType = productcategoryId.Value;
                if (productId.HasValue)
                    headerDetail.ProductId = productId.Value;


                _refundHeaderDetailRepository.Create(headerDetail);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<string> CreateReversalReferenceNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.TransactionReversalNumber, "TRV");
        }

        private async Task ReverseTransactionAddingLinkId(Transaction transaction, int periodId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var tran = new billing_Transaction
                {
                    Reason = "transaction reversal",
                    TransactionType = TransactionTypeEnum.PaymentReversal,
                    RmaReference = string.IsNullOrEmpty(transaction.BankReference) ? transaction.RmaReference : transaction.BankReference,
                    TransactionDate = DateTime.Now.ToSaDateTime(),
                    PeriodId = periodId,
                    Amount = transaction.Amount,
                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                    RolePlayerId = transaction.RolePlayerId,
                    LinkedTransactionId = transaction.TransactionId,
                    BankStatementEntryId = transaction.BankStatementEntryId
                };

                await _paymentAllocationService.AllocateDebitTransaction(Mapper.Map<Transaction>(tran), transaction.RolePlayerId, transaction.Amount, transaction.TransactionId);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                var text = string.Empty;

                if (!string.IsNullOrEmpty(tran.RmaReference))
                    text = $"payment reversal for : {tran.RmaReference}";
                else
                    text = $"payment reversal";

                var note = new BillingNote
                {
                    ItemId = transaction.RolePlayerId,
                    ItemType = BillingNoteTypeEnum.PaymentReversal.GetDescription().SplitCamelCaseText(),
                    Text = text
                };
                await _billingService.AddBillingNote(note);
            }
        }

        public async Task AddDebitNoteTransactions(List<Contracts.Entities.Transaction> transactions)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            Contract.Requires(transactions != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

                foreach (var transaction in transactions)
                {
                    transaction.TransactionDate = postingDate;
                    transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                    var entity = Mapper.Map<billing_Transaction>(transaction);
                    _transactionRepository.Create(entity);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<decimal> GetBalance(billing_Transaction transaction)
        {
            Contract.Requires(transaction != null);

            decimal balance = 0m;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // INVOICE
                if (transaction.TransactionType == TransactionTypeEnum.Invoice)
                {
                    // reversed?
                    var rev = await System.Data.Entity.QueryableExtensions
                             .FirstOrDefaultAsync(
                                 _transactionRepository.Where(t =>
                                     t.LinkedTransactionId == transaction.TransactionId &&
                                     t.TransactionType == TransactionTypeEnum.InvoiceReversal));

                    if (rev != null) return 0m;

                    // load every allocation on this invoice
                    var allocs = await System.Data.Entity.QueryableExtensions
                               .ToListAsync(
                                   _invoiceAllocationRepository.Where(a =>
                                       a.InvoiceId == transaction.InvoiceId && !a.IsDeleted));

                    if (allocs.Count > 0)
                    {
                        var allocIds = allocs.Select(a => a.TransactionId).ToList();

                        // one read for all credits
                        var credits = await System.Data.Entity.QueryableExtensions
                                    .ToDictionaryAsync(
                                        _transactionRepository.Where(t => allocIds.Contains(t.TransactionId)),
                                        t => t.TransactionId,
                                        t => t.Amount);

                        // one read for all debits
                        var debits = await System.Data.Entity.QueryableExtensions
                                   .ToListAsync(
                                       _transactionRepository.Where(d =>
                                           allocIds.Contains(d.LinkedTransactionId ?? 0)));


                        var debitLookup = debits
                            .Where(d => d.TransactionType != TransactionTypeEnum.DebitReallocation &&
                                        d.TransactionType != TransactionTypeEnum.Refund &&
                                        d.TransactionType != TransactionTypeEnum.InterDebtorTransfer)
                            .GroupBy(d => d.LinkedTransactionId ?? 0)
                            .ToDictionary(g => g.Key, g => g.ToList());


                        foreach (var a in allocs)
                        {
                            List<billing_Transaction> list;
                            if (debitLookup.TryGetValue(a.TransactionId, out list))
                            {
                                foreach (var d in list)
                                {
                                    decimal creditAmt;
                                    if (credits.TryGetValue(a.TransactionId, out creditAmt) &&
                                        creditAmt == d.Amount)
                                    {
                                        a.Amount -= d.Amount;
                                    }
                                }
                            }
                        }
                    }

                    balance = transaction.Amount - allocs.Sum(a => a.Amount);
                    if (balance > transaction.Amount) balance = transaction.Amount;
                    if (balance < 0) balance = 0m;
                    return balance;
                }

                // CLAIM-RECOVERY INVOICE 
                if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice)
                {
                    var allocs = await System.Data.Entity.QueryableExtensions
                               .ToListAsync(
                                   _invoiceAllocationRepository.Where(a =>
                                       a.ClaimRecoveryId == transaction.ClaimRecoveryInvoiceId && !a.IsDeleted));

                    if (allocs.Count > 0)
                    {
                        var allocIds = allocs.Select(a => a.TransactionId).ToList();

                        var debitSumLookup = (await System.Data.Entity.QueryableExtensions
                                .ToListAsync(
                                    _transactionRepository.Where(d =>
                                        allocIds.Contains(d.LinkedTransactionId ?? 0))))
                            .GroupBy(d => d.LinkedTransactionId ?? 0)
                            .ToDictionary(g => g.Key, g => g.Sum(d => d.Amount));

                        foreach (var a in allocs)
                        {
                            decimal s;
                            if (debitSumLookup.TryGetValue(a.TransactionId, out s))
                                a.Amount -= s;
                        }
                    }

                    balance = transaction.Amount - allocs.Sum(a => a.Amount);
                    if (balance > transaction.Amount) balance = transaction.Amount;
                    if (balance < 0) balance = 0m;
                    return balance;
                }

                // CREDIT-SIDE TRANSACTIONS
                if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                {
                    // base balance
                    balance = transaction.Amount -
                              transaction.InvoiceAllocations_TransactionId
                                         .Where(a => !a.IsDeleted)
                                         .Sum(a => a.Amount);

                    // debit-allocations
                    var debitAlloc = await System.Data.Entity.QueryableExtensions
                                     .ToListAsync(
                                         _debitTransactionAllocationRepository.Where(d =>
                                             d.CreditTransactionId == transaction.TransactionId));

                    balance -= debitAlloc.Sum(a => a.Amount);
                    balance = decimal.Negate(balance);

                    // linked debits
                    var linkedDebits = await System.Data.Entity.QueryableExtensions
                                      .ToListAsync(
                                          _transactionRepository.Where(d =>
                                              d.LinkedTransactionId == transaction.TransactionId));

                    switch (transaction.TransactionType)
                    {
                        case TransactionTypeEnum.Payment:
                        case TransactionTypeEnum.CreditNote:
                        case TransactionTypeEnum.CreditReallocation:
                            balance += linkedDebits.Sum(d => d.Amount);
                            break;

                        case TransactionTypeEnum.ClaimRecoveryPayment:
                            balance += linkedDebits
                                       .Where(d => d.TransactionType == TransactionTypeEnum.ClaimRecoveryPaymentReversal)
                                       .Sum(d => d.Amount);
                            break;

                        case TransactionTypeEnum.InvoiceReversal:
                        case TransactionTypeEnum.EuropAssistPremium:
                            return 0m;
                    }

                    if (balance > 0) balance = 0m;
                    return balance;
                }

                // DEBIT-SIDE  (NON-INVOICE)
                if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit &&
                    transaction.TransactionType != TransactionTypeEnum.Invoice)
                {
                    if (transaction.TransactionType == TransactionTypeEnum.Interest)
                    {
                        var allocated = (await System.Data.Entity.QueryableExtensions
                                .ToListAsync(
                                    _invoiceAllocationRepository.Where(a =>
                                        a.LinkedTransactionId == transaction.TransactionId && !a.IsDeleted)))
                            .Sum(a => a.Amount);

                        balance = transaction.Amount - allocated;
                        return balance < 0 ? 0m : balance;
                    }

                    if (transaction.LinkedTransactionId != null)
                    {
                        bool carry =
                               transaction.TransactionType == TransactionTypeEnum.DebitReallocation ||
                               transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer;

                        return carry ? (transaction.Balance ?? 0m) : 0m;
                    }

                    if (transaction.TransactionType == TransactionTypeEnum.DebitNote ||
                        transaction.TransactionType == TransactionTypeEnum.PaymentReversal)
                        return transaction.Amount;
                }

                return balance;   // remains 0 unless set above
            }
        }

        public async Task<decimal> GetCurrentPeriodDebtorBalance(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var currrentPeriod = await _periodService.GetCurrentPeriod();
                var transactions = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId && t.IsDeleted != true
                                                                           && t.TransactionDate >= currrentPeriod.StartDate
                                                                           && t.TransactionDate <= currrentPeriod.EndDate
                                                                           && t.TransactionType != TransactionTypeEnum.ClaimRecoveryInvoice
                                                                           && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment
                                                                           && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPaymentReversal).ToListAsync();

                var debitAmount = transactions.Where(s => s.TransactionTypeLinkId == 1).Sum(x => x.Amount);
                var creditAmount = transactions.Where(s => s.TransactionTypeLinkId == 2).Sum(x => x.Amount);

                return debitAmount - creditAmount >= 0 ? debitAmount - creditAmount : 0;
            }
        }

        private async Task<int> PutRevesersedAmountBackInSuspenseAccount(Transaction transaction)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var originalEntries = await _unallocatedPaymentRepository
                    .Where(c => c.BankStatementEntryId == (int)transaction.BankStatementEntryId)
                    .ToListAsync();
                var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                var suspenseBSChart = await _configurationService.GetModuleSetting(SystemSettings.SuspenseBSChart);
                var suspenseDebtor = new billing_SuspenseDebtorBankMapping();
                var bankentry = await _facsStatementRepository.FirstOrDefaultAsync(b => b.BankStatementEntryId == (int)transaction.BankStatementEntryId);
                if (bankentry != null)
                    suspenseDebtor = await GetSuspenseAccountDebtorDetailsByBankAccount(bankentry.BankAccountNumber.TrimStart(new char[] { '0' }));

                var originalEntry = new billing_UnallocatedPayment();
                if (originalEntries.Count > 0)
                {
                    originalEntry = originalEntries.FirstOrDefault();
                    originalEntry.AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated;
                    originalEntry.UnallocatedAmount += transaction.Amount;
                    if (suspenseDebtor != null && suspenseDebtor.RoleplayerId > 0)
                        originalEntry.RoleplayerId = suspenseDebtor.RoleplayerId;

                    _unallocatedPaymentRepository.Update(originalEntry);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);

                    if (suspenseDebtor != null && suspenseDebtor.RoleplayerId > 0)
                        _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, originalEntry.UnallocatedPaymentId, transaction.Amount, suspenseDebtor.BankAccountId, bankChart, bankChart, false, suspenseDebtor.IndustryClass.Value, null);

                    return originalEntry.UnallocatedPaymentId;
                }
                else
                {
                    var newEntity = new billing_UnallocatedPayment()
                    {
                        AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                        UnallocatedAmount = transaction.Amount,
                        BankStatementEntryId = (int)transaction.BankStatementEntryId,
                    };
                    if (suspenseDebtor != null && suspenseDebtor.RoleplayerId > 0)
                        newEntity.RoleplayerId = suspenseDebtor.RoleplayerId;

                    _unallocatedPaymentRepository.Create(newEntity);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);

                    if (suspenseDebtor != null && suspenseDebtor.RoleplayerId > 0)
                        _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, newEntity.UnallocatedPaymentId, transaction.Amount, suspenseDebtor.BankAccountId, bankChart, bankChart, false, suspenseDebtor.IndustryClass.Value, null);

                    return newEntity.UnallocatedPaymentId;
                }
            }
        }

        public async Task<List<Transaction>> GetUnloggedTransactions()
        {
            var abilityTransactionTypes = new List<TransactionTypeEnum>() {
                TransactionTypeEnum.Invoice,
                TransactionTypeEnum.CreditNote,
                TransactionTypeEnum.DebitNote,
                TransactionTypeEnum.Payment,
                TransactionTypeEnum.ClaimRecoveryInvoice,
                TransactionTypeEnum.ClaimRecoveryPayment,
                TransactionTypeEnum.PaymentReversal,
                TransactionTypeEnum.CreditReallocation,
                TransactionTypeEnum.DebitReallocation,
                TransactionTypeEnum.EuropAssistPremium,
                TransactionTypeEnum.InterDebtorTransfer,
                TransactionTypeEnum.Refund,
                TransactionTypeEnum.RefundReversal,
                TransactionTypeEnum.CreditNoteReversal
            };
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                abilityTransactionTypes.Add(TransactionTypeEnum.Interest);
                abilityTransactionTypes.Add(TransactionTypeEnum.InterestReversal);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var value = await _configurationService.GetModuleSetting(SystemSettings.UnloggedTransactionCount);
                if (!int.TryParse(value, out int recordCount))
                {
                    recordCount = 200;
                }
                var transactions = await _transactionRepository
                  .Where(tr => (tr.IsLogged == null || tr.IsLogged == false)
                            && abilityTransactionTypes.Contains(tr.TransactionType))
                  .OrderBy(t => t.TransactionId)
                  .Take(recordCount)
                  .ToListAsync();
                return Mapper.Map<List<Transaction>>(transactions);
            }
        }

        public async Task UpdateTransaction(List<Transaction> transactions)
        {
            Contract.Requires(transactions != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var transaction in transactions)
                {
                    var tran = _transactionRepository.Where(x => x.TransactionId == transaction.TransactionId).FirstOrDefault();
                    tran.IsLogged = true;
                    _transactionRepository.Update(tran);
                }

                await scope.SaveChangesAsync()
                  .ConfigureAwait(false);
            }
        }

        public async Task<decimal> GetDebtorNetBalance(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactions = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId && t.IsDeleted != true
                                          && t.TransactionType != TransactionTypeEnum.ClaimRecoveryInvoice && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment
                                          && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPaymentReversal && t.TransactionType != TransactionTypeEnum.EuropAssistPremium).ToListAsync();

                var debitAmount = transactions.Where(s => s.TransactionTypeLinkId == 1).Sum(x => x.Amount);
                var creditAmount = transactions.Where(s => s.TransactionTypeLinkId == 2).Sum(x => x.Amount);

                return debitAmount - creditAmount;
            }
        }

        public async Task<Transaction> CreateRefundDetailTransaction(int policyOwnerId, decimal amount, string reason, int linkingId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                var transaction = new billing_Transaction();
                transaction.Reason = reason;
                transaction.TransactionType = TransactionTypeEnum.Refund;
                transaction.RmaReference = await CreateRefundReferenceNumber();
                transaction.TransactionDate = postingDate;
                transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                transaction.Amount = amount;
                transaction.TransactionTypeLinkId = (int)TransactionActionType.Debit;
                transaction.RolePlayerId = policyOwnerId;
                transaction.LinkedTransactionId = linkingId;

                _transactionRepository.Create(transaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<Transaction>(transaction);
            }
        }

        public async Task LinkRefundToCreditNote(int refundTransactionId, int creditNoteId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _transactionRepository.FirstOrDefault(c => c.TransactionId == refundTransactionId);
                entity.LinkedTransactionId = creditNoteId;

                _transactionRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<decimal> GetTransactionBalance(Transaction transaction)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = Mapper.Map<billing_Transaction>(transaction);
                return await GetBalance(entity);
            }
        }

        public async Task<List<Transaction>> GetTransactionsForReAllocationByPolicy(int policyId, TransactionTypeEnum transactionType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);


            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var currentPeriod = await _periodService.GetCurrentPeriod();


                var transactions = await GetTransactionByPolicyIdAndTransactionType(policyId, transactionType);
                transactions = transactions.Where(t => t.TransactionDate < currentPeriod.StartDate).ToList();


                var transactionsToRemoveIds = new List<int>();

                foreach (var tran in transactions)
                {
                    var reallocationsOfTran = await _transactionRepository.Where(t =>
                        (t.TransactionType == TransactionTypeEnum.DebitReallocation || t.TransactionType == TransactionTypeEnum.InterDebtorTransfer) && t.LinkedTransactionId == tran.TransactionId).ToListAsync();
                    if (reallocationsOfTran.Sum(t => t.Amount) >= tran.Amount)
                    {
                        transactionsToRemoveIds.Add(tran.TransactionId);
                    }
                    else
                    {
                        tran.UnallocatedAmount = tran.Amount - reallocationsOfTran.Sum(t => t.Amount);
                        tran.OriginalUnallocatedAmount = tran.UnallocatedAmount;
                        tran.Balance = await GetTransactionBalance(tran);
                    }
                }

                transactions.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                return transactions;
            }

        }

        public async Task<List<Transaction>> GetTransactionsForReAllocation(int roleplayerId, TransactionTypeEnum transactionType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var currentPeriod = await _periodService.GetCurrentPeriod();

                var transactions = await GetTransactionByRoleplayerIdAndTransactionType(roleplayerId, transactionType);
                transactions = transactions.Where(t => t.TransactionDate < currentPeriod.StartDate).ToList();

                var transactionsToRemoveIds = new List<int>();

                foreach (var tran in transactions)
                {
                    var reallocationsOfTran = await _transactionRepository.Where(t =>
                        (t.TransactionType == TransactionTypeEnum.DebitReallocation || t.TransactionType == TransactionTypeEnum.InterDebtorTransfer) && t.LinkedTransactionId == tran.TransactionId).ToListAsync();
                    if (reallocationsOfTran.Count > 0 && reallocationsOfTran.Sum(t => t.Amount) >= tran.Amount)
                    {
                        transactionsToRemoveIds.Add(tran.TransactionId);
                    }
                    else
                    {
                        tran.UnallocatedAmount = tran.Amount - reallocationsOfTran.Sum(t => t.Amount);
                        tran.OriginalUnallocatedAmount = tran.UnallocatedAmount;
                        tran.Balance = await GetTransactionBalance(tran);
                    }
                }

                transactions.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                return transactions;
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

        public async Task<List<RefundHeader>> GetDebtorRefunds(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _refundHeaderRepository.Where(r => r.RolePlayerId == rolePlayerId).ToListAsync();
                foreach (var entity in entities)
                {
                    await _refundHeaderRepository.LoadAsync(entity, r => r.RefundHeaderDetails);
                }
                return Mapper.Map<List<RefundHeader>>(entities);
            }
        }

        public async Task<List<Transaction>> GetTransactionsForReversal(int roleplayerId, TransactionTypeEnum transactionType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var currentPeriod = await _periodService.GetCurrentPeriod();

                var transactions = await GetTransactionByRoleplayerIdAndTransactionType(roleplayerId, transactionType);

                var transactionsToRemoveIds = transactions.Where(s => (s.TransactionType == TransactionTypeEnum.Refund || s.TransactionType == TransactionTypeEnum.InterDebtorTransfer || s.TransactionType == TransactionTypeEnum.DebitReallocation) && s.RolePlayerId == roleplayerId).Select(s => s.LinkedTransactionId).ToList();

                transactions.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                transactions = transactions.Where(t => t.TransactionDate >= currentPeriod.StartDate).ToList();
                foreach (var transaction in transactions)
                {
                    transaction.UnallocatedAmount = await GetBalance(Mapper.Map<billing_Transaction>(transaction));
                    transaction.UnallocatedAmount = Math.Abs(transaction.UnallocatedAmount);
                    transaction.OriginalUnallocatedAmount = transaction.UnallocatedAmount;
                }
                return transactions;
            }
        }

        public async Task<List<Transaction>> GetDebitTransactionsForAllocation(int rolePlayerId, decimal amount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId &&
                t.TransactionTypeLinkId == (int)TransactionActionType.Debit && ((t.TransactionType == TransactionTypeEnum.PaymentReversal && t.LinkedTransactionId == null && t.Amount == amount)
                                        || t.TransactionType == TransactionTypeEnum.Interest || t.TransactionType == TransactionTypeEnum.DebitReallocation ||
                                        t.TransactionType == TransactionTypeEnum.InterDebtorTransfer)).ToListAsync();
                foreach (var transaction in entities)
                {
                    var balance = await GetBalance(transaction);
                    transaction.Balance = balance;
                }

                var transactions = Mapper.Map<List<Transaction>>(entities.Where(t => t.Balance != 0));
                return transactions.ToList();
            }
        }

        public async Task<PagedRequestResult<Transaction>> GetPagedDebtorTransactionHistory(int rolePlyerId, DateTime startDate, DateTime endDate, TransactionTypeEnum transactionType, PagedRequest request)
        {
            Contract.Requires(request != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            string originalRequestOrdering = string.Empty;
            if (request != null && !string.IsNullOrEmpty(request.OrderBy))
            {
                switch (request.OrderBy.ToLower())
                {

                    case "documentnumber":
                        request.OrderBy = "RmaReference";
                        break;
                    case "creditamount":
                    case "debitamount":
                        originalRequestOrdering = request.OrderBy;
                        request.OrderBy = "TransactionId";
                        break;
                }
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var _startDate = startDate.StartOfTheDay();
                var _endDate = endDate.EndOfTheDay();
                var transactionsWithDeletedInvoice = new List<Transaction>();
                var transactions = new PagedRequestResult<Transaction>();
                if (_endDate.Year == 2999)
                {// random search
                    transactions = await _transactionRepository
       .Where(t => t.RolePlayerId == rolePlyerId
                && t.IsDeleted != true
                && (
                   transactionType == TransactionTypeEnum.All
                   || t.TransactionType == transactionType
                )
                && (
                   t.TransactionType != TransactionTypeEnum.ClaimRecoveryInvoice
                   && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment
                   && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPaymentReversal
                   && t.TransactionType != TransactionTypeEnum.EuropAssistPremium
                )
                && (
                   request.SearchCriteria == string.Empty
                   || request.SearchCriteria == null
                   || t.BankReference.Contains(request.SearchCriteria)
                   || t.RmaReference.Contains(request.SearchCriteria)
                   || t.Invoice.InvoiceNumber.Contains(request.SearchCriteria))
                )
       .OrderBy(t => t.TransactionDate).ToPagedResult<billing_Transaction, Transaction>(request);
                }
                else
                {
                    transactions = await _transactionRepository
                        .Where(t => t.RolePlayerId == rolePlyerId
                                 && t.IsDeleted == false
                                 && t.TransactionDate >= _startDate
                                 && t.TransactionDate <= _endDate
                                 && (transactionType == TransactionTypeEnum.All || t.TransactionType == transactionType)
                                 && (
                                    t.TransactionType != TransactionTypeEnum.ClaimRecoveryInvoice
                                    && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment
                                    && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPaymentReversal
                                    && t.TransactionType != TransactionTypeEnum.EuropAssistPremium
                                 )
                                 && (
                                    string.IsNullOrEmpty(request.SearchCriteria)
                                    || t.BankReference.Contains(request.SearchCriteria)
                                    || t.RmaReference.Contains(request.SearchCriteria)
                                    || t.Invoice.InvoiceNumber.Contains(request.SearchCriteria))
                                 )
                        .OrderBy(t => t.TransactionDate).ToPagedResult<billing_Transaction, Transaction>(request);
                }


                foreach (var transaction in transactions.Data)
                {
                    if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                    {
                        var entity = Mapper.Map<billing_Transaction>(transaction);
                        await _transactionRepository.LoadAsync(entity, t => t.InvoiceAllocations_TransactionId);
                        transaction.InvoiceAllocations = Mapper.Map<List<InvoiceAllocation>>(entity.InvoiceAllocations_TransactionId);
                    }
                }

                foreach (var transaction in transactions.Data)
                {
                    transaction.CreditAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0;
                    transaction.DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0;
                    transaction.PolicyId = 0;
                    transaction.RunningBalance = 0; // no concept of a running balance in the system

                    if (transaction.TransactionType != TransactionTypeEnum.Refund)
                    {
                        transaction.Balance = await GetTransactionBalance(transaction);
                    }
                    else
                    {
                        transaction.Balance = 0;
                    }

                    var beginningOfTheMonth = new DateTime(transaction.TransactionDate.Year, transaction.TransactionDate.Month, 1);
                    var transactionPeriod = await _periodService.GetPeriod(beginningOfTheMonth);
                    var invoice = await _invoiceRepository.Where(i => i.InvoiceId == transaction.InvoiceId && !i.IsDeleted).SingleOrDefaultAsync();

                    switch (transaction.TransactionType)
                    {
                        case TransactionTypeEnum.Invoice:
                            if (invoice != null)
                            {
                                transaction.TransactionDate = invoice.InvoiceDate;

                                var transactionDescription = transaction.TransactionReason == TransactionReasonEnum.PremiumAdjustment ? "Premium Adj" : "Premium";

                                transaction.Description = $"{transactionDescription} - " + invoice.InvoiceDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                    invoice.InvoiceDate.ToString("yyyy", CultureInfo.InvariantCulture);

                                if (transaction.TransactionReason == TransactionReasonEnum.PremiumAdjustment && transaction.PeriodId.HasValue)
                                {
                                    var period = await _periodService.GetPeriodById(transaction.PeriodId.Value);
                                    transaction.TransactionDate = period.StartDate;
                                }
                            }
                            break;
                        case TransactionTypeEnum.DebitNote:
                            if (transaction.Reason.IndexOf("payback", StringComparison.OrdinalIgnoreCase) >= 0)
                            {
                                transaction.Description = transaction.Reason;
                            }
                            else
                            {
                                transaction.Description = transactionPeriod != null
                                    ? transaction.TransactionType.GetDescription() + " - " +
                                      transactionPeriod.StartDate.ToString("MMMM", CultureInfo.InvariantCulture)
                                    : transaction.TransactionType.GetDescription() + " - " +
                                      transaction.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture);
                            }
                            break;
                        case TransactionTypeEnum.CreditNote:
                            var creditNoteText = String.Empty;
                            if (!string.IsNullOrEmpty(invoice?.InvoiceNumber))
                            {
                                creditNoteText = invoice.InvoiceNumber;
                            }
                            else
                            {
                                var allocatedInvoice = new billing_Invoice();

                                if (transaction.TransactionReason != TransactionReasonEnum.DebtWriteOff)
                                {
                                    var invoiceAllocation = await _invoiceAllocationRepository.Where(i => i.TransactionId == transaction.TransactionId).FirstOrDefaultAsync();
                                    if (invoiceAllocation != null)
                                        allocatedInvoice = await _invoiceRepository.Where(i => i.InvoiceId == invoiceAllocation.InvoiceId).FirstOrDefaultAsync();

                                    creditNoteText = (string.IsNullOrEmpty(allocatedInvoice.InvoiceNumber)) ? "Adjustment/Correction" : allocatedInvoice?.InvoiceNumber;
                                }
                                else
                                {
                                    creditNoteText = (string.IsNullOrEmpty(transaction.RmaReference)) ? "Adjustment/Correction" : transaction.RmaReference;
                                }
                            }

                            if (transaction.TransactionReason == TransactionReasonEnum.PremiumAdjustment && transaction.PeriodId.HasValue)
                            {
                                var period = await _periodService.GetPeriodById(transaction.PeriodId.Value);
                                transaction.TransactionDate = period.StartDate;
                            }

                            if (transaction.Reason?.IndexOf("payback", StringComparison.OrdinalIgnoreCase) >= 0)
                            {
                                transaction.Description = transaction.Reason;
                            }
                            else
                            {
                                var isWriteOff = (transaction.TransactionReason == TransactionReasonEnum.PremiumWriteOff || transaction.TransactionReason == TransactionReasonEnum.InterestWriteOff || transaction.TransactionReason == TransactionReasonEnum.DebtWriteOff);
                                string writeOffNarration = isWriteOff ? transaction.TransactionReason.GetDescription() + " - " : String.Empty;

                                if (transactionPeriod != null)
                                {
                                    var transactionStartMonth = transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture);
                                    var transactionStartYear = transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture);

                                    if (transaction.TransactionReason == TransactionReasonEnum.PremiumAdjustment)
                                    {
                                        if (transaction.TransactionEffectiveDate.HasValue)
                                        {
                                            var adjustmentEffectiveMonth = string.Empty;
                                            var adjustmentEffectiveYear = string.Empty;

                                            adjustmentEffectiveMonth = transaction.TransactionEffectiveDate.Value.ToString("MMM", CultureInfo.InvariantCulture);
                                            adjustmentEffectiveYear = transaction.TransactionEffectiveDate.Value.ToString("yyyy");
                                            transaction.Description = $"Premium Adj - {adjustmentEffectiveMonth} - {adjustmentEffectiveYear}";
                                        }
                                    }
                                    else
                                    {
                                        transaction.Description = $"Credit Note - {writeOffNarration} {transactionStartMonth} - {transactionStartYear}";
                                    }
                                }
                                else
                                {
                                    transaction.Description = $"Credit Note - {writeOffNarration}" + creditNoteText;
                                }
                            }

                            break;
                        case TransactionTypeEnum.Payment:

                            if (transactionPeriod != null)
                            {
                                transaction.Description = "Payment - " +
                                                              transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                                          transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }
                            else
                            {
                                if (invoice != null)
                                {
                                    transaction.Description = "Payment - " +
                                                                 invoice.InvoiceDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                                            invoice.InvoiceDate.ToString("yyyy", CultureInfo.InvariantCulture);
                                }
                                else
                                {
                                    var bankStatementEntry = await _facsStatementRepository.Where(s => s.BankStatementEntryId == transaction.BankStatementEntryId).FirstOrDefaultAsync();
                                    if (bankStatementEntry != null)
                                        transaction.Description = "Payment - " +
                                                             bankStatementEntry?.StatementDate?.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                                         bankStatementEntry?.StatementDate?.ToString("yyyy", CultureInfo.InvariantCulture);
                                    else
                                        transaction.Description = "Payment - " +
                                                            transaction?.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                                        transaction?.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                                }
                            }
                            break;
                        case TransactionTypeEnum.PaymentReversal:
                            var wasDebitOrderReversal = false;
                            if (transaction.BankStatementEntryId.HasValue)
                            {
                                var bankStatementEntry = await _facsStatementRepository.Where(s => s.BankStatementEntryId == transaction.BankStatementEntryId).FirstOrDefaultAsync();
                                if (bankStatementEntry != null)
                                    wasDebitOrderReversal = bankStatementEntry.DocumentType == "DO";
                            }

                            if (transactionPeriod != null)
                            {
                                transaction.Description = wasDebitOrderReversal ?
                                    "Return - " + transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                   transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture) :
                                    "Payment Reversal - " + transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                   transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }
                            else
                            {
                                transaction.Description = wasDebitOrderReversal ?
                                    "Return - " + transaction.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                              transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture) :
                                    "Payment Reversal - " + transaction.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                    transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }

                            break;
                        case TransactionTypeEnum.Interest:

                            if (transaction.TransactionEffectiveDate != null)
                            {
                                transaction.Description = transaction.TransactionType.GetDescription() + " - " +
                                  transaction.TransactionEffectiveDate?.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                   transaction.TransactionEffectiveDate?.ToString("yyyy", CultureInfo.InvariantCulture);
                            }
                            else
                            {
                                transaction.Description = transactionPeriod != null
                                ? transaction.TransactionType.GetDescription() + " - " +
                                  transactionPeriod.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                              transactionPeriod.StartDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : transaction.TransactionType.GetDescription() + " - " +
                                  transaction.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                              transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }
                            break;
                        default:
                            transaction.Description = transactionPeriod != null
                                ? transaction.TransactionType.GetDescription() + " - " +
                                  transactionPeriod.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                              transactionPeriod.StartDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : transaction.TransactionType.GetDescription() + " - " +
                                  transaction.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                              transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            break;
                    }

                    if (transaction.TransactionType != TransactionTypeEnum.Invoice)
                    {
                        transaction.DocumentNumber = string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                    }
                    else
                    {
                        if (transaction.InvoiceId.HasValue)
                        {
                            var invoices = await _invoiceRepository.Where(i => i.InvoiceId == transaction.InvoiceId.Value && !i.IsDeleted).ToListAsync();
                            if (invoices.Count == 1)
                            {
                                transaction.DocumentNumber = invoices.FirstOrDefault()?.InvoiceNumber;
                            }
                            else if (invoices.Count == 0)
                            {
                                transactionsWithDeletedInvoice.Add(transaction);
                                continue;
                            }
                        }
                    }

                    transaction.Reference = transaction.TransactionType == TransactionTypeEnum.Invoice
                        ? string.IsNullOrEmpty(transaction.BankReference) ? transaction.RmaReference : transaction.BankReference :
                          string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;

                    transaction.LinkedTransactions = new List<Transaction>();
                    transaction.InvoiceAllocations = new List<InvoiceAllocation>();

                    if (transaction.TransactionType == TransactionTypeEnum.Invoice)
                    {
                        var reversalTransaction = await _transactionRepository.Where(t => t.LinkedTransactionId == transaction.TransactionId).FirstOrDefaultAsync();
                        if (reversalTransaction != null && (reversalTransaction.TransactionType == TransactionTypeEnum.InvoiceReversal))
                        {
                            transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(reversalTransaction));
                        }
                        else
                        {
                            _invoiceAllocationRepository.DisableFilter(SoftDeleteFilter);
                            var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.InvoiceId == transaction.InvoiceId).ToListAsync();
                            _invoiceAllocationRepository.EnableFilter(SoftDeleteFilter);
                            foreach (var allocation in invoiceAllocations)
                            {
                                var creditTransaction = await _transactionRepository.SingleAsync(t => t.TransactionId == allocation.TransactionId);
                                var debitTransactions = await _transactionRepository.Where(t => t.LinkedTransactionId == allocation.TransactionId).ToListAsync();
                                foreach (var debitTran in debitTransactions)
                                {
                                    if (debitTran.TransactionType != TransactionTypeEnum.DebitReallocation && debitTran.TransactionType != TransactionTypeEnum.Refund && debitTran.TransactionType != TransactionTypeEnum.InterDebtorTransfer)
                                    {
                                        if (creditTransaction.Amount == debitTran.Amount)
                                        {
                                            allocation.Amount -= debitTran.Amount;
                                        }
                                    }
                                }
                                transaction.InvoiceAllocations.Add(Mapper.Map<InvoiceAllocation>(allocation));
                            }
                        }
                    }

                    if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                    {
                        List<billing_Transaction> debitTransactionsForCreditTransaction;
                        billing_Transaction fullReversal;

                        switch (transaction.TransactionType)
                        {
                            case TransactionTypeEnum.Payment:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t => t.LinkedTransactionId == transaction.TransactionId).ToListAsync();

                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == transaction.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == transaction.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (transaction.LinkedTransactions.FirstOrDefault(
                                                t => t.InvoiceId == allocation.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice) != null) continue;
                                        if (allocation.InvoiceId.HasValue)
                                        {
                                            var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.InvoiceId == allocation.InvoiceId.Value);
                                            if (linkedInvoiceTran != null)
                                            {
                                                var linkedInvoice = await _invoiceRepository.FirstAsync(i => i.InvoiceId == allocation.InvoiceId);
                                                linkedInvoiceTran.BankReference = linkedInvoice.InvoiceNumber;
                                                linkedInvoiceTran.Amount = allocation.Amount;
                                                linkedInvoice.InvoiceId = allocation.InvoiceId.Value;
                                                transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                            }
                                        }
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == transaction.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (transaction.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.CreditNote:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                        t.LinkedTransactionId == transaction.TransactionId)
                                    .ToListAsync();
                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == transaction.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == transaction.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (transaction.LinkedTransactions.FirstOrDefault(t => t.InvoiceId == allocation.InvoiceId
                                            && t.TransactionType == TransactionTypeEnum.Invoice) != null)
                                        {
                                            continue;
                                        }

                                        if (allocation.InvoiceId.HasValue)
                                        {
                                            var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.TransactionId == allocation.LinkedTransactionId);
                                            if (linkedInvoiceTran != null)
                                            {
                                                var linkedInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == allocation.InvoiceId);
                                                linkedInvoiceTran.BankReference = linkedInvoice?.InvoiceNumber;
                                                linkedInvoiceTran.Amount = allocation.Amount;
                                                linkedInvoice.InvoiceId = allocation.InvoiceId.Value;
                                                transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                            }
                                        }
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == transaction.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (transaction.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.CreditReallocation:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                        t.LinkedTransactionId == transaction.TransactionId)
                                    .ToListAsync();
                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == transaction.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == transaction.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (transaction.LinkedTransactions.FirstOrDefault(
                                                t => t.InvoiceId == allocation.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice) != null) continue;
                                        if (allocation.InvoiceId.HasValue)
                                        {
                                            var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.TransactionId == allocation.LinkedTransactionId);
                                            if (linkedInvoiceTran != null)
                                            {
                                                var linkedInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == linkedInvoiceTran.InvoiceId);
                                                linkedInvoiceTran.BankReference = linkedInvoice?.InvoiceNumber;
                                                linkedInvoiceTran.Amount = allocation.Amount;
                                                transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                            }
                                        }
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == transaction.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (transaction.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.InvoiceReversal:
                                var invoiceTran = await _transactionRepository.Where(t => t.TransactionId == transaction.LinkedTransactionId).FirstOrDefaultAsync();
                                if (invoiceTran != null)
                                {
                                    transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(invoiceTran));
                                }
                                break;
                        }
                    }
                    else if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit && transaction.TransactionType != TransactionTypeEnum.Invoice)
                    {
                        var linkedTran = await _transactionRepository.Where(t => t.TransactionId == transaction.LinkedTransactionId).FirstOrDefaultAsync();
                        if (linkedTran != null)
                        {
                            transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedTran));
                        }

                        var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.DebitTransactionId == transaction.TransactionId).ToListAsync();
                        foreach (var allocation in debitAllocations)
                        {
                            if (transaction.LinkedTransactions.FirstOrDefault(t => t.TransactionId == allocation.CreditTransactionId) != null) continue;
                            if (transaction.TransactionType == TransactionTypeEnum.Interest)
                            {
                                var debitTransactions = allocation.DebitTransaction.DebitTransactionAllocations_DebitTransactionId;
                                foreach (var debitTransaction in debitTransactions)
                                {
                                    var debitAllocation = Mapper.Map<DebitTransactionAllocation>(debitTransaction);
                                    if (!transaction.DebitTransactionAllocations.Any(c => c.DebitTransactionAllocationId == debitAllocation.DebitTransactionAllocationId))
                                        transaction.DebitTransactionAllocations.Add(debitAllocation);
                                }
                                continue;
                            }

                            var linkedCreditTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.CreditTransactionId);
                            transaction.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedCreditTran));
                        }
                    }
                }

                transactions.Data = transactions.Data.Except(transactionsWithDeletedInvoice).ToList();

                transactions.PageCount = transactions.Data.Count;

                var startIndex = (request.Page - 1) * request.PageSize;
                var count = startIndex + request.PageSize > transactions.Data.Count
                    ? transactions.Data.Count % request.PageSize
                    : request.PageSize;

                if (request.IsAscending)
                {
                    switch (request.OrderBy.ToLower())
                    {
                        case "documentnumber":
                            transactions.Data = transactions.Data.OrderBy(s => s.RmaReference).ToList();
                            break;
                        case "transactiontype":
                            transactions.Data = transactions.Data.OrderBy(s => s.TransactionType).ToList();
                            break;
                        case "transactiondate":
                            transactions.Data = transactions.Data.OrderBy(s => s.TransactionDate).ToList();
                            break;
                        case "balance":
                            transactions.Data = transactions.Data.OrderBy(s => s.Balance).ToList();
                            break;
                        case "transactionid":
                            if (string.Equals(originalRequestOrdering, "creditamount", StringComparison.OrdinalIgnoreCase))
                                transactions.Data = transactions.Data.OrderBy(s => s.CreditAmount).ToList();
                            else if (string.Equals(originalRequestOrdering, "debitamount", StringComparison.OrdinalIgnoreCase))
                                transactions.Data = transactions.Data.OrderBy(s => s.DebitAmount).ToList();
                            break;
                    }
                }
                else
                {
                    switch (request.OrderBy.ToLower())
                    {
                        case "documentnumber":
                            transactions.Data = transactions.Data.OrderByDescending(s => s.RmaReference).ToList();
                            break;
                        case "transactiontype":
                            transactions.Data = transactions.Data.OrderByDescending(s => s.TransactionType).ToList();
                            break;
                        case "transactiondate":
                            transactions.Data = transactions.Data.OrderByDescending(s => s.TransactionDate).ToList();
                            break;
                        case "balance":
                            transactions.Data = transactions.Data.OrderByDescending(s => s.Balance).ToList();
                            break;
                        case "transactionid":
                            if (string.Equals(originalRequestOrdering, "creditamount", StringComparison.OrdinalIgnoreCase))
                                transactions.Data = transactions.Data.OrderByDescending(s => s.CreditAmount).ToList();
                            else if (string.Equals(originalRequestOrdering, "debitamount", StringComparison.OrdinalIgnoreCase))
                                transactions.Data = transactions.Data.OrderByDescending(s => s.DebitAmount).ToList();
                            break;
                    }
                }

                return transactions;
            }
        }

        public async Task<List<Statement>> GetDebtorTransactionHistory(int policyPayeeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            var tranHistory = new List<Statement>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.Where(t => t.RolePlayerId == policyPayeeId && t.IsDeleted != true && t.TransactionType != TransactionTypeEnum.Refund).OrderBy(t => t.TransactionDate).ToListAsync();

                foreach (var entity in entities)
                {
                    if (entity.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                    {
                        await _transactionRepository.LoadAsync(entity, t => t.InvoiceAllocations_TransactionId);
                    }
                }

                var refundEntities = await _transactionRepository.Where(t => t.RolePlayerId == policyPayeeId && t.TransactionType == TransactionTypeEnum.Refund).ToListAsync();

                var refundTransactions = new List<Transaction>();

                foreach (var refundEntity in refundEntities)
                {
                    var refundHeaderDetailList = await _refundHeaderDetailRepository.Where(r => r.TransactionId == refundEntity.LinkedTransactionId).ToListAsync();
                    if (refundHeaderDetailList.Count > 0)
                    {
                        foreach (var detail in refundHeaderDetailList)
                        {
                            var refundHeader = await _refundHeaderRepository
                                .Where(r => r.RefundHeaderId == detail.RefundHeaderId).FirstOrDefaultAsync();
                            if (refundHeader != null)
                            {
                                var refundHeaderDetailList2 = await _refundHeaderDetailRepository.Where(r => r.RefundHeaderId == refundHeader.RefundHeaderId).ToListAsync();

                                if (refundTransactions.FirstOrDefault(t => t.TransactionId == refundHeader.RefundHeaderId) == null)
                                {
                                    var linkedTransactionIds = refundEntities
                                        .Where(t => refundHeaderDetailList2.Any(r => t.LinkedTransactionId == r.TransactionId)).ToList().Select(t => t.LinkedTransactionId).ToList();
                                    var linkedTransactions = entities.Where(t => linkedTransactionIds.Any(id => t.TransactionId == id)).ToList();
                                    if (linkedTransactions.Count > 0)
                                    {
                                        var mappedLinkedTransactions = Mapper.Map<List<Transaction>>(linkedTransactions);
                                        foreach (var linkedTran in mappedLinkedTransactions)
                                        {
                                            var refundDetail = await _refundHeaderDetailRepository.Where(r => r.TransactionId == linkedTran.TransactionId && r.RefundHeaderId == refundHeader.RefundHeaderId).FirstOrDefaultAsync();
                                            if (refundDetail != null)
                                            {
                                                linkedTran.Amount = refundDetail.TotalAmount;
                                            }
                                        }

                                        refundTransactions.Add(new Transaction
                                        {
                                            Amount = refundHeader.HeaderTotalAmount,
                                            TransactionId = refundHeader.RefundHeaderId,
                                            TransactionType = TransactionTypeEnum.Refund,
                                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                            BankStatementEntryId = refundEntity.BankStatementEntryId,
                                            RmaReference = refundEntity.RmaReference,
                                            BankReference = refundEntity.BankReference,
                                            TransactionDate = refundEntity.TransactionDate,
                                            LinkedTransactions = mappedLinkedTransactions
                                        });
                                    }
                                }
                            }
                        }
                    }
                }

                var transactions = Mapper.Map<List<Transaction>>(entities);

                foreach (var refundTransaction in refundTransactions)
                {
                    transactions.Add(refundTransaction);
                }

                foreach (var tran in transactions)
                {
                    if (tran.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice ||
                        tran.TransactionType == TransactionTypeEnum.ClaimRecoveryPayment ||
                        tran.TransactionType == TransactionTypeEnum.ClaimRecoveryPaymentReversal ||
                        tran.TransactionType == TransactionTypeEnum.EuropAssistPremium)
                    {
                        continue;
                    }

                    var statementEntry = new Statement
                    {
                        Amount = tran.Amount,
                        CreditAmount =
                            tran.TransactionTypeLinkId == (int)TransactionActionType.Credit ? tran.Amount : 0,
                        DebitAmount = tran.TransactionTypeLinkId == (int)TransactionActionType.Debit ? tran.Amount : 0,
                        PolicyId = 0,
                        RunningBalance = 0, // no concept of a running balance in the system
                        InvoiceId = null,
                        TransactionDate = tran.TransactionDate,
                        TransactionId = tran.TransactionId,
                        TransactionType = tran.TransactionType.GetDescription()
                    };

                    if (tran.TransactionType != TransactionTypeEnum.Refund)
                    {
                        statementEntry.Balance = await GetTransactionBalance(tran);
                    }
                    else
                    {
                        statementEntry.Balance = 0;
                    }

                    var transactionPeriod = await _periodService.GetPeriod(tran.TransactionDate);

                    switch (tran.TransactionType)
                    {
                        case TransactionTypeEnum.Invoice:
                            var invoice = await _invoiceRepository.Where(i => i.InvoiceId == tran.InvoiceId).SingleOrDefaultAsync();
                            if (invoice != null)
                            {
                                statementEntry.TransactionDate = invoice.InvoiceDate;
                                var transactionDescription = tran.TransactionReason == TransactionReasonEnum.PremiumAdjustment ? "Premium Adj" : "Premium";
                                statementEntry.Description = $"{transactionDescription} - " + invoice.InvoiceDate.ToString("MMMM", CultureInfo.InvariantCulture);
                            }
                            break;
                        case TransactionTypeEnum.CreditNote:
                            statementEntry.Description = transactionPeriod != null
                                ? "Credit Note - " +
                                  transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : "Credit Note - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " + tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            break;
                        case TransactionTypeEnum.Payment:
                            statementEntry.Description = transactionPeriod != null
                                ? "Payment - " +
                                  transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : "Payment - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " + tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            break;
                        case TransactionTypeEnum.PaymentReversal:
                            var wasDebitOrderReversal = false;
                            if (tran.BankStatementEntryId.HasValue)
                            {
                                var bankStatementEntry = await _facsStatementRepository.Where(s => s.BankStatementEntryId == tran.BankStatementEntryId).SingleAsync();
                                wasDebitOrderReversal = bankStatementEntry.DocumentType == "DO";
                            }

                            if (transactionPeriod != null)
                            {
                                statementEntry.Description = wasDebitOrderReversal ?
                                    "Return - " + transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture) :
                                    "Payment Reversal - " + transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }
                            else
                            {
                                statementEntry.Description = wasDebitOrderReversal ?
                                    "Return - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " + tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture) :
                                    "Payment Reversal - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " + tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }

                            break;
                        default:
                            statementEntry.Description = transactionPeriod != null
                                ? tran.TransactionType.GetDescription() + " - " +
                                  transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : tran.TransactionType.GetDescription() + " - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " + tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            break;
                    }

                    if (tran.TransactionType != TransactionTypeEnum.Invoice)
                    {
                        statementEntry.DocumentNumber = string.IsNullOrEmpty(tran.RmaReference) ? tran.BankReference : tran.RmaReference;
                    }
                    else
                    {
                        if (tran.InvoiceId.HasValue)
                        {
                            var invoice = await _invoiceRepository.Where(i => i.InvoiceId == tran.InvoiceId.Value)
                                .SingleAsync();
                            statementEntry.DocumentNumber = invoice.InvoiceNumber;
                        }
                    }

                    statementEntry.Reference = tran.TransactionType == TransactionTypeEnum.Invoice
                        ? string.IsNullOrEmpty(tran.BankReference) ? tran.RmaReference : tran.BankReference :
                          string.IsNullOrEmpty(tran.RmaReference) ? tran.BankReference : tran.RmaReference;

                    statementEntry.LinkedTransactions = new List<Transaction>();
                    statementEntry.InvoiceAllocations = new List<InvoiceAllocation>();

                    if (tran.TransactionType == TransactionTypeEnum.Invoice)
                    {
                        var reversalTransaction = await _transactionRepository.Where(t => t.LinkedTransactionId == tran.TransactionId).FirstOrDefaultAsync();
                        if (reversalTransaction != null && (reversalTransaction.TransactionType == TransactionTypeEnum.InvoiceReversal))
                        {
                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(reversalTransaction));
                        }
                        else
                        {
                            _invoiceAllocationRepository.DisableFilter(SoftDeleteFilter);
                            var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.InvoiceId == tran.InvoiceId).ToListAsync();
                            _invoiceAllocationRepository.EnableFilter(SoftDeleteFilter);
                            foreach (var allocation in invoiceAllocations)
                            {
                                var creditTransaction = await _transactionRepository.SingleAsync(t => t.TransactionId == allocation.TransactionId);
                                var debitTransactions = await _transactionRepository.Where(t => t.LinkedTransactionId == allocation.TransactionId).ToListAsync();
                                foreach (var debitTran in debitTransactions)
                                {
                                    if (debitTran.TransactionType != TransactionTypeEnum.DebitReallocation && debitTran.TransactionType != TransactionTypeEnum.Refund && debitTran.TransactionType != TransactionTypeEnum.InterDebtorTransfer)
                                    {
                                        if (creditTransaction.Amount == debitTran.Amount)
                                        {
                                            allocation.Amount -= debitTran.Amount;
                                        }
                                    }
                                }
                                statementEntry.InvoiceAllocations.Add(Mapper.Map<InvoiceAllocation>(allocation));
                            }
                        }
                    }

                    if (tran.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                    {
                        List<billing_Transaction> debitTransactionsForCreditTransaction;
                        billing_Transaction fullReversal;

                        switch (tran.TransactionType)
                        {
                            case TransactionTypeEnum.Payment:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t => t.LinkedTransactionId == tran.TransactionId).ToListAsync();

                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == tran.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.InvoiceId == allocation.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice) != null) continue;
                                        var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.InvoiceId == allocation.InvoiceId);

                                        if (linkedInvoiceTran != null && linkedInvoiceTran.Invoice != null)
                                        {
                                            var linkedInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == linkedInvoiceTran.InvoiceId);
                                            linkedInvoiceTran.BankReference = linkedInvoice.InvoiceNumber;
                                            linkedInvoiceTran.Amount = allocation.Amount;
                                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                        }
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.CreditNote:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                        t.LinkedTransactionId == tran.TransactionId)
                                    .ToListAsync();
                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == tran.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.InvoiceId == allocation.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice) != null) continue;
                                        var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.InvoiceId == allocation.InvoiceId);
                                        if (linkedInvoiceTran != null)
                                        {
                                            var linkedInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == linkedInvoiceTran.InvoiceId);
                                            linkedInvoiceTran.BankReference = linkedInvoice?.InvoiceNumber;
                                            linkedInvoiceTran.Amount = allocation.Amount;
                                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                        }
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.CreditReallocation:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                        t.LinkedTransactionId == tran.TransactionId)
                                    .ToListAsync();
                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == tran.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.InvoiceId == allocation.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice) != null) continue;
                                        var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.InvoiceId == allocation.InvoiceId);
                                        if (linkedInvoiceTran != null)
                                        {
                                            var linkedInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == linkedInvoiceTran.InvoiceId);
                                            linkedInvoiceTran.BankReference = linkedInvoice?.InvoiceNumber;
                                            linkedInvoiceTran.Amount = allocation.Amount;
                                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                        }
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.InvoiceReversal:
                                var invoiceTran = await _transactionRepository.Where(t => t.TransactionId == tran.LinkedTransactionId).FirstOrDefaultAsync();
                                if (invoiceTran != null)
                                {
                                    statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(invoiceTran));
                                }
                                break;
                        }
                    }
                    else if (tran.TransactionTypeLinkId == (int)TransactionActionType.Debit && tran.TransactionType != TransactionTypeEnum.Invoice && tran.TransactionType != TransactionTypeEnum.Refund)
                    {
                        var linkedTran = await _transactionRepository.Where(t => t.TransactionId == tran.LinkedTransactionId).FirstOrDefaultAsync();
                        if (linkedTran != null)
                        {
                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedTran));
                        }

                        var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.DebitTransactionId == tran.TransactionId).ToListAsync();
                        foreach (var allocation in debitAllocations)
                        {
                            if (statementEntry.LinkedTransactions.FirstOrDefault(t => t.TransactionId == allocation.CreditTransactionId) != null) continue;
                            var linkedCreditTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.CreditTransactionId);
                            if (linkedCreditTran != null)
                                statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedCreditTran));
                        }
                    }
                    else if (tran.TransactionType == TransactionTypeEnum.Refund)
                    {
                        statementEntry.LinkedTransactions = tran.LinkedTransactions;
                    }

                    tranHistory.Add(statementEntry);
                }

                return tranHistory;
            }
        }

        public async Task<PagedRequestResult<Statement>> GetDebtorTransactionHistoryPaged(int policyPayeeId, PagedRequest request)
        {
            Contract.Requires(request != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            var tranHistory = new PagedRequestResult<Statement>();
            tranHistory.Data = new List<Statement>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.
                   Where(t => t.RolePlayerId == policyPayeeId && t.IsDeleted != true &&
                       (t.TransactionType != TransactionTypeEnum.ClaimRecoveryInvoice ||
                        t.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment ||
                        t.TransactionType != TransactionTypeEnum.ClaimRecoveryPaymentReversal ||
                        t.TransactionType != TransactionTypeEnum.EuropAssistPremium ||
                        t.TransactionType != TransactionTypeEnum.Refund))
                   .OrderBy(t => t.TransactionId)
                  .Skip((request.Page - 1) * request.PageSize)
                  .Take(request.PageSize).ToListAsync();


                var transactionEntities = await _transactionRepository.
                   Where(t => t.RolePlayerId == policyPayeeId && t.IsDeleted != true &&
                   (t.TransactionType != TransactionTypeEnum.ClaimRecoveryInvoice ||
                    t.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment ||
                    t.TransactionType != TransactionTypeEnum.ClaimRecoveryPaymentReversal ||
                    t.TransactionType != TransactionTypeEnum.EuropAssistPremium ||
                    t.TransactionType != TransactionTypeEnum.Refund))
                   .Select(t => t.TransactionId)
                   .ToListAsync();

                var rowCount = transactionEntities.Count;

                foreach (var entity in entities)
                {
                    if (entity.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                    {
                        await _transactionRepository.LoadAsync(entity, t => t.InvoiceAllocations_TransactionId);
                    }
                }

                var refundEntities = await _transactionRepository.Where(t => t.RolePlayerId == policyPayeeId && t.TransactionType == TransactionTypeEnum.Refund).ToListAsync();

                var refundTransactions = new List<Transaction>();

                foreach (var refundEntity in refundEntities)
                {
                    var refundHeaderDetailList = await _refundHeaderDetailRepository.Where(r => r.TransactionId == refundEntity.LinkedTransactionId).ToListAsync();
                    if (refundHeaderDetailList.Count > 0)
                    {
                        foreach (var detail in refundHeaderDetailList)
                        {
                            var refundHeader = await _refundHeaderRepository
                                .Where(r => r.RefundHeaderId == detail.RefundHeaderId).FirstOrDefaultAsync();
                            if (refundHeader != null)
                            {
                                var refundHeaderDetailList2 = await _refundHeaderDetailRepository.Where(r => r.RefundHeaderId == refundHeader.RefundHeaderId).ToListAsync();

                                if (refundTransactions.FirstOrDefault(t => t.TransactionId == refundHeader.RefundHeaderId) == null)
                                {
                                    var linkedTransactionIds = refundEntities
                                        .Where(t => refundHeaderDetailList2.Any(r => t.LinkedTransactionId == r.TransactionId)).ToList().Select(t => t.LinkedTransactionId).ToList();
                                    var linkedTransactions = entities.Where(t => linkedTransactionIds.Any(id => t.TransactionId == id)).ToList();
                                    if (linkedTransactions.Count > 0)
                                    {
                                        var mappedLinkedTransactions = Mapper.Map<List<Transaction>>(linkedTransactions);
                                        foreach (var linkedTran in mappedLinkedTransactions)
                                        {
                                            var refundDetail = await _refundHeaderDetailRepository.Where(r => r.TransactionId == linkedTran.TransactionId && r.RefundHeaderId == refundHeader.RefundHeaderId).FirstOrDefaultAsync();
                                            if (refundDetail != null)
                                            {
                                                linkedTran.Amount = refundDetail.TotalAmount;
                                            }
                                        }

                                        refundTransactions.Add(new Transaction
                                        {
                                            Amount = refundHeader.HeaderTotalAmount,
                                            TransactionId = refundHeader.RefundHeaderId,
                                            TransactionType = TransactionTypeEnum.Refund,
                                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                            BankStatementEntryId = refundEntity.BankStatementEntryId,
                                            RmaReference = refundEntity.RmaReference,
                                            BankReference = refundEntity.BankReference,
                                            TransactionDate = refundEntity.TransactionDate,
                                            LinkedTransactions = mappedLinkedTransactions
                                        });
                                    }
                                }
                            }
                        }
                    }
                }

                var transactions = Mapper.Map<List<Transaction>>(entities);

                foreach (var refundTransaction in refundTransactions)
                {
                    transactions.Add(refundTransaction);
                }

                foreach (var tran in transactions)
                {
                    var statementEntry = new Statement
                    {
                        Amount = tran.Amount,
                        CreditAmount =
                            tran.TransactionTypeLinkId == (int)TransactionActionType.Credit ? tran.Amount : 0,
                        DebitAmount = tran.TransactionTypeLinkId == (int)TransactionActionType.Debit ? tran.Amount : 0,
                        PolicyId = 0,
                        RunningBalance = 0, // no concept of a running balance in the system
                        InvoiceId = null,
                        TransactionDate = tran.TransactionDate,
                        TransactionId = tran.TransactionId,
                        TransactionType = tran.TransactionType.GetDescription()
                    };

                    if (tran.TransactionType != TransactionTypeEnum.Refund)
                    {
                        statementEntry.Balance = await GetTransactionBalance(tran);
                    }
                    else
                    {
                        statementEntry.Balance = 0;
                    }

                    var transactionPeriod = await _periodService.GetPeriod(tran.TransactionDate);

                    switch (tran.TransactionType)
                    {
                        case TransactionTypeEnum.Invoice:
                            var invoice = await _invoiceRepository.Where(i => i.InvoiceId == tran.InvoiceId).SingleOrDefaultAsync();
                            if (invoice != null)
                            {
                                statementEntry.TransactionDate = invoice.InvoiceDate;
                                var transactionDescription = tran.TransactionReason == TransactionReasonEnum.PremiumAdjustment ? "Premium Adj" : "Premium";
                                statementEntry.Description = $"{transactionDescription} - " + invoice.InvoiceDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }
                            break;
                        case TransactionTypeEnum.CreditNote:
                            statementEntry.Description = transactionPeriod != null
                                ? "Credit Note - " +
                                  transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : "Credit Note - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            break;
                        case TransactionTypeEnum.Payment:
                            statementEntry.Description = transactionPeriod != null
                                ? "Payment - " +
                                  transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : "Payment - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            break;
                        case TransactionTypeEnum.PaymentReversal:
                            var wasDebitOrderReversal = false;
                            if (tran.BankStatementEntryId.HasValue)
                            {
                                var bankStatementEntry = await _facsStatementRepository.Where(s => s.BankStatementEntryId == tran.BankStatementEntryId).SingleAsync();
                                wasDebitOrderReversal = bankStatementEntry.DocumentType == "DO";
                            }

                            if (transactionPeriod != null)
                            {
                                statementEntry.Description = wasDebitOrderReversal ?
                                    "Return - " + transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture) :
                                    "Payment Reversal - " + transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }
                            else
                            {
                                statementEntry.Description = wasDebitOrderReversal ?
                                    "Return - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture) :
                                    "Payment Reversal - " + tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }

                            break;
                        default:
                            statementEntry.Description = transactionPeriod != null
                                ? tran.TransactionType.GetDescription() + " - " +
                                  transactionPeriod?.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                              transactionPeriod?.StartDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : tran.TransactionType.GetDescription() + " - " +
                                  tran.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               tran.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            break;
                    }

                    if (tran.TransactionType != TransactionTypeEnum.Invoice)
                    {
                        statementEntry.DocumentNumber = string.IsNullOrEmpty(tran.RmaReference) ? tran.BankReference : tran.RmaReference;
                    }
                    else
                    {
                        if (tran.InvoiceId.HasValue)
                        {
                            var invoice = await _invoiceRepository.Where(i => i.InvoiceId == tran.InvoiceId.Value)
                                .SingleAsync();
                            statementEntry.DocumentNumber = invoice.InvoiceNumber;
                        }
                    }

                    statementEntry.Reference = tran.TransactionType == TransactionTypeEnum.Invoice
                        ? string.IsNullOrEmpty(tran.BankReference) ? tran.RmaReference : tran.BankReference :
                          string.IsNullOrEmpty(tran.RmaReference) ? tran.BankReference : tran.RmaReference;

                    statementEntry.LinkedTransactions = new List<Transaction>();
                    statementEntry.InvoiceAllocations = new List<InvoiceAllocation>();

                    if (tran.TransactionType == TransactionTypeEnum.Invoice)
                    {
                        var reversalTransaction = await _transactionRepository.Where(t => t.LinkedTransactionId == tran.TransactionId).FirstOrDefaultAsync();
                        if (reversalTransaction != null && (reversalTransaction.TransactionType == TransactionTypeEnum.InvoiceReversal))
                        {
                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(reversalTransaction));
                        }
                        else
                        {
                            _invoiceAllocationRepository.DisableFilter(SoftDeleteFilter);
                            var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.InvoiceId == tran.InvoiceId).ToListAsync();
                            _invoiceAllocationRepository.EnableFilter(SoftDeleteFilter);
                            foreach (var allocation in invoiceAllocations)
                            {
                                var creditTransaction = await _transactionRepository.SingleAsync(t => t.TransactionId == allocation.TransactionId);
                                var debitTransactions = await _transactionRepository.Where(t => t.LinkedTransactionId == allocation.TransactionId).ToListAsync();
                                foreach (var debitTran in debitTransactions)
                                {
                                    if (debitTran.TransactionType != TransactionTypeEnum.DebitReallocation && debitTran.TransactionType != TransactionTypeEnum.Refund && debitTran.TransactionType != TransactionTypeEnum.InterDebtorTransfer)
                                    {
                                        if (creditTransaction.Amount == debitTran.Amount)
                                        {
                                            allocation.Amount -= debitTran.Amount;
                                        }
                                    }
                                }
                                statementEntry.InvoiceAllocations.Add(Mapper.Map<InvoiceAllocation>(allocation));
                            }
                        }
                    }

                    if (tran.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                    {
                        List<billing_Transaction> debitTransactionsForCreditTransaction;
                        billing_Transaction fullReversal;

                        switch (tran.TransactionType)
                        {
                            case TransactionTypeEnum.Payment:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t => t.LinkedTransactionId == tran.TransactionId).ToListAsync();

                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == tran.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.InvoiceId == allocation.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice) != null) continue;
                                        var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.InvoiceId == allocation.InvoiceId);
                                        var linkedInvoice = await _invoiceRepository.FirstAsync(i => i.InvoiceId == linkedInvoiceTran.InvoiceId);

                                        linkedInvoiceTran.BankReference = linkedInvoice.InvoiceNumber;
                                        linkedInvoiceTran.Amount = allocation.Amount;
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.CreditNote:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                        t.LinkedTransactionId == tran.TransactionId)
                                    .ToListAsync();
                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == tran.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.InvoiceId == allocation.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice) != null) continue;
                                        var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.InvoiceId == allocation.InvoiceId);
                                        if (linkedInvoiceTran != null)
                                        {
                                            var linkedInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == linkedInvoiceTran.InvoiceId);
                                            linkedInvoiceTran.BankReference = linkedInvoice?.InvoiceNumber;
                                            linkedInvoiceTran.Amount = allocation.Amount;
                                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                        }
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.CreditReallocation:
                                debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                        t.LinkedTransactionId == tran.TransactionId)
                                    .ToListAsync();
                                if (debitTransactionsForCreditTransaction.Count > 0)
                                {
                                    foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                    {
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(debitTransaction));
                                    }
                                }

                                fullReversal = debitTransactionsForCreditTransaction.FirstOrDefault(t =>
                                    t.TransactionType == TransactionTypeEnum.PaymentReversal || t.TransactionType == TransactionTypeEnum.DebitNote && t.Amount == tran.Amount);

                                if (fullReversal == null)
                                {
                                    var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in invoiceAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.InvoiceId == allocation.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice) != null) continue;
                                        var linkedInvoiceTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionType == TransactionTypeEnum.Invoice && t.InvoiceId == allocation.InvoiceId);

                                        var linkedInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == linkedInvoiceTran.InvoiceId);
                                        linkedInvoiceTran.BankReference = linkedInvoice?.InvoiceNumber;
                                        linkedInvoiceTran.Amount = allocation.Amount;
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedInvoiceTran));
                                    }

                                    var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.CreditTransactionId == tran.TransactionId).ToListAsync();
                                    foreach (var allocation in debitAllocations)
                                    {
                                        if (statementEntry.LinkedTransactions.FirstOrDefault(
                                                t => t.TransactionId == allocation.DebitTransactionId) != null) continue;
                                        var linkedDebitTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.DebitTransactionId);
                                        linkedDebitTran.Amount = allocation.Amount;
                                        statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedDebitTran));
                                    }
                                }

                                break;
                            case TransactionTypeEnum.InvoiceReversal:
                                var invoiceTran = await _transactionRepository.Where(t => t.TransactionId == tran.LinkedTransactionId).FirstOrDefaultAsync();
                                if (invoiceTran != null)
                                {
                                    statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(invoiceTran));
                                }
                                break;
                        }
                    }
                    else if (tran.TransactionTypeLinkId == (int)TransactionActionType.Debit && tran.TransactionType != TransactionTypeEnum.Invoice && tran.TransactionType != TransactionTypeEnum.Refund)
                    {
                        var linkedTran = await _transactionRepository.Where(t => t.TransactionId == tran.LinkedTransactionId).FirstOrDefaultAsync();
                        if (linkedTran != null)
                        {
                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedTran));
                        }

                        var debitAllocations = await _debitTransactionAllocationRepository.Where(a => a.DebitTransactionId == tran.TransactionId).ToListAsync();
                        foreach (var allocation in debitAllocations)
                        {
                            if (statementEntry.LinkedTransactions.FirstOrDefault(t => t.TransactionId == allocation.CreditTransactionId) != null) continue;
                            var linkedCreditTran = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == allocation.CreditTransactionId);
                            statementEntry.LinkedTransactions.Add(Mapper.Map<Transaction>(linkedCreditTran));
                        }
                    }
                    else if (tran.TransactionType == TransactionTypeEnum.Refund)
                    {
                        statementEntry.LinkedTransactions = tran.LinkedTransactions;
                    }

                    tranHistory.Data.Add(statementEntry);
                }

                return new PagedRequestResult<Statement>
                {
                    Data = tranHistory.Data,
                    RowCount = tranHistory.RowCount,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    PageCount = (int)Math.Ceiling(tranHistory.RowCount / (double)request.PageSize)
                };
            }
        }

        public async Task<PagedRequestResult<Transaction>> GetStatement(int policyId, DateTime startDate, DateTime endDate, TransactionTypeEnum transactionType, PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);
            var policyOwnerId = policy.PolicyOwnerId;
            return await GetPagedDebtorTransactionHistory(policyOwnerId, startDate, endDate, transactionType, request);
        }

        public async Task<List<Statement>> GetStatementByRolePlayer(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await GetDebtorTransactionHistory(rolePlayerId);
            }
        }

        public async Task<List<Statement>> GetStatementByPolicy(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);
                return await GetDebtorTransactionHistory(policy.PolicyPayeeId);
            }
        }

        public async Task<PagedRequestResult<Statement>> GetStatementByPolicyPaged(int policyId, PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);
                var policyPayeeId = policy.PolicyPayeeId;
                return await GetDebtorTransactionHistoryPaged(policyPayeeId, request);
            }
        }

        public async Task<List<Statement>> GetStatementsForRefunds(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            var statements = await GetDebtorTransactionHistory(rolePlayerId);
            var transactionTypes = new List<string> { "Payment", "CreditNote" };
            var results = FilterStatementsByTransactionTypes(statements, transactionTypes);
            return results;
        }

        private List<Statement> FilterStatementsByTransactionTypes(List<Statement> statements, List<string> transactionTypes)
        {
            return statements.Where(c => transactionTypes.Contains(c.TransactionType)).ToList();
        }

        public async Task<List<Statement>> GetStatementsForReversals(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            var currentPeriod = await _periodService.GetCurrentPeriod();
            var latestPeriod = await _periodService.GetLatestPeriod();
            var paymentsThatCanBeReversed = new List<billing_Transaction>();
            var paymentThatCanBeReversedIds = new List<int>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<billing_Transaction> paymentsForRecentPeriods = new List<billing_Transaction>();

                if (latestPeriod != null)
                {
                    var paymentsForPeriodLatest = await _transactionRepository.Where(c => c.RolePlayerId == rolePlayerId && !c.IsDeleted
                                                                                && c.TransactionType ==
                                                                                TransactionTypeEnum.Payment
                                                                                && (c.PeriodId == latestPeriod.Id || c.PeriodId == currentPeriod.Id)).ToListAsync();
                    paymentsForRecentPeriods.AddRange(paymentsForPeriodLatest);
                }
                else
                {
                    var paymentsForPeriodCurrent = await _transactionRepository.Where(c => c.RolePlayerId == rolePlayerId && !c.IsDeleted
                                                                                && c.TransactionType ==
                                                                                TransactionTypeEnum.Payment
                                                                                && c.PeriodId == currentPeriod.Id).ToListAsync();
                    paymentsForRecentPeriods.AddRange(paymentsForPeriodCurrent);
                }

                var paymentTransactionIds = paymentsForRecentPeriods.Select(c => c.TransactionId).ToList();

                var revesalsForPayments = await _transactionRepository
                    .Where(c => c.TransactionType == TransactionTypeEnum.PaymentReversal
                     && paymentTransactionIds.Contains((int)c.LinkedTransactionId))
                    .ToListAsync();
                var reversePaymentLinkIds = revesalsForPayments
                    .Select(c => c.LinkedTransactionId)
                    .Distinct()
                    .ToList();
                paymentsThatCanBeReversed = paymentsForRecentPeriods
                    .Where(c => !reversePaymentLinkIds.Contains(c.TransactionId))
                    .ToList();
                paymentThatCanBeReversedIds = paymentsThatCanBeReversed
                    .Select(c => c.TransactionId)
                    .ToList();
            }

            var statements = new List<Statement>();

            foreach (var transaction in paymentsThatCanBeReversed)
            {
                var statementEntry = new Statement
                {
                    Amount = transaction.Amount,
                    CreditAmount =
                    transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                    DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                    PolicyId = 0,
                    RunningBalance = 0,
                    InvoiceId = null,
                    TransactionDate = transaction.TransactionDate,
                    TransactionId = transaction.TransactionId,
                    TransactionType = TransactionTypeEnum.Payment.GetDescription(),
                    Description = transaction.Reason,
                    PeriodId = transaction.PeriodId,
                };

                statementEntry.Balance = await GetBalance(transaction);

                var transactionPeriod = await _periodService.GetPeriod(transaction.TransactionDate);

                statementEntry.Description = transactionPeriod != null
                    ? transaction.TransactionType.GetDescription() + " - " +
                      transactionPeriod.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                      transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture)
                    : transaction.TransactionType.GetDescription() + " - " +
                      transaction.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                      transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);

                statementEntry.DocumentNumber = string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                statements.Add(statementEntry);

            }

            foreach (var statement in statements)
            {
                if (statement.TransactionDate >= currentPeriod.StartDate
                    && statement.TransactionDate <= currentPeriod.EndDate)
                {
                    statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                }
                else if (statement.TransactionDate > currentPeriod.EndDate)
                {
                    statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                }
                else if (statement.TransactionDate < currentPeriod.StartDate)
                {
                    statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                }
            }

            return statements.ToList();
        }

        public async Task<List<CreditTransaction>> GetTransactionsForRefund(RefundTransactionsRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _transactionRepository.SqlQueryAsync<CreditTransaction>(
                    DatabaseConstants.GetCreditTransactionsToRefund,
                    new SqlParameter("@roleplayerId", request?.RoleplayerId));
                return results;
            }
        }

        public async Task<List<Transaction>> GetCreditTransactionsWithBalances(int roleplayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactions = await _transactionRepository.Where(s => (s.TransactionTypeLinkId == (int)TransactionActionType.Credit) && s.RolePlayerId == roleplayerId && s.IsDeleted != true).ToListAsync();

                var transactionsToRemoveIds = new List<int>();

                foreach (var tran in transactions)
                {
                    var balance = await GetBalance(tran);
                    if (balance >= 0)
                    {
                        transactionsToRemoveIds.Add(tran.TransactionId);
                    }
                    else
                    {
                        tran.Balance = balance;
                    }
                }

                transactions.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                return Mapper.Map<List<Transaction>>(transactions);
            }
        }

        public async Task<List<PremiumListingTransaction>> GetPremiumListingTransactions(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _premiumListingTransactionsRepository.Where(s => s.PolicyId == policyId).ToListAsync();
                return results == null ? new List<PremiumListingTransaction>() : Mapper.Map<List<PremiumListingTransaction>>(results);
            }
        }

        public async Task<PagedRequestResult<PremiumListingTransaction>> GetPremiumListingTransactionsForPolicy(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyId = int.Parse(request.SearchCriteria);
                var results = await _premiumListingTransactionsRepository
                    .Where(s => s.PolicyId == policyId)
                    .ToPagedResult<billing_PremiumListingTransaction, PremiumListingTransaction>(request);
                return results;
            }
        }

        public async Task<double> GetPremiumListingTransactionsTotal(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _premiumListingTransactionsRepository
                    .Where(s => s.PolicyId == policyId)
                    .ToListAsync();
                var invoices = results.Sum(p => p.InvoiceAmount);
                var payments = results.Sum(p => p.PaymentAmount);
                var result = payments - invoices;
                return Math.Round(result, 2);
            }
        }

        public async Task<List<Transaction>> GetPaymentsForReturnAllocation(int roleplayerId, decimal paymentReturnAmount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository
                    .Where(t => t.RolePlayerId == roleplayerId && t.IsDeleted != true
                             && t.TransactionType == TransactionTypeEnum.Payment
                             && t.Amount == paymentReturnAmount)
                    .ToListAsync();

                var transactions = Mapper.Map<List<Transaction>>(entities);

                foreach (var tran in transactions)
                {
                    var balance = await GetTransactionBalance(tran);
                    tran.Balance = balance;
                    tran.OriginalUnallocatedAmount = balance;
                }

                return transactions.ToList();
            }
        }

        public async Task<List<Transaction>> GetTransactionByRoleplayerIdAndDate(int roleplayerId, TransactionTypeEnum transactionType, DateTime startDate, DateTime endDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);
            var _startDate = startDate.StartOfTheDay();
            var _endDate = endDate.EndOfTheDay();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.Where(t => t.RolePlayerId == roleplayerId && t.IsDeleted != true && t.TransactionType == transactionType && t.TransactionDate >= _startDate && t.TransactionDate <= _endDate).ToListAsync();

                var transactions = Mapper.Map<List<Transaction>>(entities);

                var transactionsToRemoveIds = new List<int>();

                foreach (var tran in transactions)
                {
                    var balance = await GetTotalAmountPaidToPremiumListingByTransactionId(tran.TransactionId);
                    tran.Balance = (decimal?)balance;
                    tran.OriginalUnallocatedAmount = (decimal)balance;
                }
                return transactions.ToList();
            }
        }

        public async Task<List<Statement>> GetStatementsForInterestReversals(int rolePlayerId)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                var results = new List<Statement>();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var interestTransactions = await _transactionRepository
                           .Where(c => c.RolePlayerId == rolePlayerId && c.IsDeleted != true
                            && c.TransactionType == TransactionTypeEnum.Interest)
                            .ToListAsync();

                    if (interestTransactions.Count > 0)
                    {
                        var currentPeriod = await _periodService.GetCurrentPeriod();
                        var transactionsThatCanBeReversed = new List<billing_Transaction>();
                        var transactionsThatCanBeReversedIds = new List<int>();

                        var interestTransactionIds = interestTransactions
                            .Select(c => c.TransactionId)
                            .ToList();
                        var revesalsForInterest = await _transactionRepository
                            .Where(c => c.TransactionType == TransactionTypeEnum.InterestReversal
                             && interestTransactionIds.Contains((int)c.LinkedTransactionId))
                            .ToListAsync();
                        var reversalLinkIds = revesalsForInterest
                            .Select(c => c.LinkedTransactionId)
                            .Distinct()
                            .ToList();
                        transactionsThatCanBeReversed = interestTransactions
                            .Where(c => !reversalLinkIds.Contains(c.TransactionId))
                            .ToList();
                        transactionsThatCanBeReversedIds = transactionsThatCanBeReversed
                            .Select(c => c.TransactionId)
                            .ToList();

                        var statements = await GetDebtorTransactionHistory(rolePlayerId);
                        var itemsWithPositiveBalances = statements.Where(s => s.Balance != 0 && transactionsThatCanBeReversedIds.Contains((int)s.TransactionId));

                        foreach (var statement in itemsWithPositiveBalances)
                        {
                            if (statement.TransactionDate >= currentPeriod.StartDate
                                && statement.TransactionDate <= currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate > currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate < currentPeriod.StartDate)
                            {
                                statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                            }
                        }

                        results = itemsWithPositiveBalances.ToList();
                    }
                }
                return results;
            }
            return null;
        }

        public async Task<bool> ReverseDebitTransactionsForOpenPeriodByIds(List<int> transactionIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            if (transactionIds == null)
                return false;

            List<Transaction> transactions;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _transactionRepository
                    .Where(c => transactionIds.Contains(c.TransactionId)).ToListAsync();
                transactions = Mapper.Map<List<Transaction>>(result);
            }

            if (transactions.Count > 0)
            {
                foreach (var transaction in transactions)
                {
                    await ReverseDebitTransactionAddingLinkId(transaction);
                }
            }
            return await Task.FromResult(true);
        }

        private async Task ReverseDebitTransactionAddingLinkId(Transaction transaction, string reason = null)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                var reversalTransaction = new billing_Transaction
                {
                    Reason = reason,
                    TransactionType = MapTransactionTypeToReversalType(transaction.TransactionType),
                    RmaReference = string.IsNullOrEmpty(transaction.BankReference) ? transaction.RmaReference : transaction.BankReference,
                    TransactionDate = postingDate,
                    PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                    Amount = transaction.Amount,
                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                    RolePlayerId = transaction.RolePlayerId,
                    LinkedTransactionId = transaction.TransactionId,
                    TransactionEffectiveDate = DateTime.Now
                };
                _transactionRepository.Create(reversalTransaction);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private TransactionTypeEnum MapTransactionTypeToReversalType(TransactionTypeEnum type)
        {
            switch (type)
            {
                case TransactionTypeEnum.Interest:
                    return TransactionTypeEnum.InterestReversal;
                default:
                    return TransactionTypeEnum.All;
            }
        }

        public async Task<bool> BackDateTransactions(TransactionsBackDatingRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);

            List<int> transactionIds;
            DateTime backdatedTransactionDate;

            Contract.Requires(request != null);

            if (request.BackDatedDate == default)
                return false;
            backdatedTransactionDate = request.BackDatedDate;

            if (request.TransactionIds == null)
                return false;
            transactionIds = request.TransactionIds;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var transactions = await _transactionRepository
                         .Where(c => transactionIds.Contains(c.TransactionId)).ToListAsync();

                if (transactions.Count > 0)
                {
                    foreach (var transaction in transactions)
                    {
                        transaction.TransactionDate = backdatedTransactionDate.ToSaDateTime();
                    }
                }
                _transactionRepository.Update(transactions);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return await Task.FromResult(true);
        }

        public async Task AddPremiumListingAdjustment()
        {
            try
            {

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var dueAdjustments = await _premiumPaymentDueCreditNoteRepository
                             .Where(c => c.IsProcessed != true).ToListAsync();

                    if (dueAdjustments.Count > 0)
                    {
                        foreach (var dueAdjustment in dueAdjustments)
                        {
                            var invoice = await _invoiceRepository.FirstOrDefaultAsync(c => c.InvoiceDate == dueAdjustment.InvoiceDate
                            && c.PolicyId == dueAdjustment.PolicyId
                            && !c.IsDeleted);
                            if (invoice.TotalInvoiceAmount > dueAdjustment.FileTotal)
                            {
                                await AdjustUsingCreditNote(invoice, dueAdjustment);
                            }
                            else if (invoice.TotalInvoiceAmount < dueAdjustment.FileTotal)
                            {
                                await AdjustUsingDebitNote(invoice, dueAdjustment);
                            }

                            dueAdjustment.IsProcessed = true;
                            dueAdjustment.ProccessingDate = DateTime.Now;
                            _premiumPaymentDueCreditNoteRepository.Update(dueAdjustment);
                        }
                        await scope.SaveChangesAsync()
                            .ConfigureAwait(false);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Adding Premium Listing Adjustment - Error Message {ex.Message}");
            }
        }

        private async Task AdjustUsingCreditNote(billing_Invoice invoice, Load_PremiumPaymentDueCreditNote dueAdjustment)
        {
            var difference = invoice.TotalInvoiceAmount - dueAdjustment.FileTotal;
            var transaction = new Transaction() { InvoiceId = invoice.InvoiceId, Amount = difference };
            var transactions = new List<Transaction>() { transaction };
            var note = new Note();
            note.Text = $"Adjustment: {invoice.InvoiceNumber}";
            var creditNoteAccount = new CreditNoteAccount()
            {
                AuthorisedBy = "system@randmutual.co.za",
                AuthorisedDate = DateTime.Now,
                RolePlayerId = dueAdjustment.RoleplayerId,
                IsCreditNoteReAllocation = false,
                IsPaymentReAllocation = false,
                Transactions = transactions,
                Note = note
            };
            await _paymentAllocationService.AllocateCreditNotes(creditNoteAccount);
        }

        private async Task AdjustUsingDebitNote(billing_Invoice invoice, Load_PremiumPaymentDueCreditNote dueAdjustment)
        {
            var difference = dueAdjustment.FileTotal - invoice.TotalInvoiceAmount;
            var linkedTransaction = await _transactionRepository.FirstOrDefaultAsync(c => c.InvoiceId == invoice.InvoiceId);
            var transactionPrev = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
            var reference = await CreateDebitNoteReferenceNumber();

            var transaction = new Transaction
            {
                Amount = difference,
                TransactionDate = DateTime.Now,
                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                TransactionType = TransactionTypeEnum.DebitNote,
                RolePlayerId = dueAdjustment.RoleplayerId,
                LinkedTransactionId = linkedTransaction.TransactionId,
                RmaReference = reference,
                Reason = $"Adjustment: {invoice.InvoiceNumber}"
            };
            await _paymentAllocationService.AllocateDebitTransaction(transaction, dueAdjustment.RoleplayerId, transaction.Amount, linkedTransaction.TransactionId);
        }

        public async Task<List<Transaction>> GetDebtorsActiveDebitTransactions(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var debitTransactions = new List<TransactionTypeEnum> { TransactionTypeEnum.Invoice, TransactionTypeEnum.Interest };
                var entities = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId
                && t.IsDeleted != true
                && debitTransactions.Contains(t.TransactionType)).ToListAsync();
                foreach (var transaction in entities)
                {
                    var balance = await GetBalance(transaction);
                    transaction.Balance = balance;
                }
                var transactions = Mapper.Map<List<Transaction>>(entities);
                return transactions.ToList();
            }
        }

        public async Task<List<Transaction>> GetTransactionsByIds(List<int> transactionIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditPayments);
            if (transactionIds == null)
                return null;
            List<Transaction> transactions;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _transactionRepository
                    .Where(c => transactionIds.Contains(c.TransactionId)).ToListAsync();
                transactions = Mapper.Map<List<Transaction>>(result);
                return transactions;
            }
        }

        public async Task AdjustInterestForBudgetedDeclarations()
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                try
                {
                    using (_dbContextScopeFactory.Create())
                    {
                        await _invoiceRepository.ExecuteSqlCommandAsync(DatabaseConstants.AdjustInterestForBudgetedDeclarations);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error occured Adjusting Interest For Budgeted Declarations  - Error Message {ex.Message}");
                }
            }
        }

        public async Task<List<Statement>> GetDebtorInterestTransactionHistory(int rolePlayerId)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                var results = new List<Statement>();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var interestTransactions = await _transactionRepository
                           .Where(c => c.RolePlayerId == rolePlayerId && !c.IsDeleted
                            && c.TransactionType == TransactionTypeEnum.Interest)
                            .ToListAsync();
                    var currentPeriod = await _periodService.GetCurrentPeriod();
                    if (interestTransactions.Count > 0)
                    {
                        var statements = new List<Statement>();

                        var interestTransactionIds = interestTransactions
                            .Select(c => c.TransactionId)
                            .ToList();
                        var revesalsForInterest = await _transactionRepository
                            .Where(c => c.TransactionType == TransactionTypeEnum.InterestReversal
                             && interestTransactionIds.Contains((int)c.LinkedTransactionId))
                            .ToListAsync();
                        var reversalLinkIds = revesalsForInterest
                            .Select(c => c.LinkedTransactionId)
                            .Distinct()
                            .ToList();
                        var transactionsRaised = interestTransactions
                              .Where(c => !reversalLinkIds.Contains(c.TransactionId))
                              .ToList();

                        foreach (var transaction in transactionsRaised)
                        {
                            var debitAllocations = await _debitTransactionAllocationRepository
                                .Where(t => t.DebitTransactionId == transaction.TransactionId)
                                .ToListAsync();
                            var balance = transaction.Amount;
                            if (debitAllocations.Count > 0)
                            {
                                foreach (var allocation in debitAllocations)
                                {
                                    balance -= allocation.Amount;
                                }
                                if (balance < 0)
                                {
                                    balance = 0;
                                }
                            }
                            if (balance == 0)
                                continue;

                            var statementEntry = new Statement
                            {
                                Amount = transaction.Amount,
                                CreditAmount =
                                transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                                DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                                PolicyId = 0,
                                RunningBalance = 0, // no concept of a running balance in the system
                                InvoiceId = null,
                                TransactionDate = transaction.TransactionDate,
                                TransactionId = transaction.TransactionId,
                                TransactionType = transaction.TransactionType.GetDescription(),
                                PeriodId = transaction.PeriodId
                            };

                            statementEntry.Balance = balance;

                            statementEntry.Description = string.Empty;
                            if (transaction.TransactionEffectiveDate != null)
                            {
                                statementEntry.Description = transaction.TransactionType.GetDescription() + " - " +
                                  transaction.TransactionEffectiveDate?.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                   transaction.TransactionEffectiveDate?.ToString("yyyy", CultureInfo.InvariantCulture);
                            }

                            statementEntry.DocumentNumber = string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                            statements.Add(statementEntry);
                        }

                        foreach (var statement in statements)
                        {
                            if (statement.PeriodId < currentPeriod.Id)
                            {
                                statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                            }
                            else if (statement.PeriodId > currentPeriod.Id)
                            {
                                statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                            }
                            else if (statement.PeriodId == currentPeriod.Id)
                            {
                                statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                            }
                        }
                        results = statements.ToList();
                    }
                }
                return results;
            }
            return null;
        }

        public async Task<bool> DoDownwardTransactionAdjustment(TransactionAdjustment request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                Contract.Requires(request != null);
                using (var scope = _dbContextScopeFactory.Create())
                {
                    try
                    {
                        var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                        var linkedTransactionId = 0;
                        if (request?.TransactionId != null)
                        {
                            var originalInterestTransaction = await _transactionRepository.FirstOrDefaultAsync(c => c.TransactionId == request.TransactionId);
                            linkedTransactionId = request.TransactionId;
                            var reference = await CreateCreditNoteReferenceNumber();
                            var transaction = new billing_Transaction();
                            transaction.RolePlayerId = request.RoleplayerId;
                            transaction.TransactionType = TransactionTypeEnum.CreditNote;
                            transaction.Reason = $"{interestAdjustment}: {originalInterestTransaction.RmaReference}";
                            transaction.RmaReference = reference;
                            transaction.TransactionDate = postingDate;
                            transaction.PeriodId = await GetPeriodIdBasedOnOpenPeriod();
                            transaction.TransactionReason = TransactionReasonEnum.InterestAdjustment;
                            transaction.TransactionTypeLinkId = 2;
                            transaction.LinkedTransactionId = linkedTransactionId;
                            transaction.Amount = request.AdjustmentAmount;
                            transaction.Balance = originalInterestTransaction.Balance;
                            if (originalInterestTransaction.InvoiceId.HasValue)
                                transaction.InvoiceId = originalInterestTransaction.InvoiceId.Value;

                            _transactionRepository.Create(transaction);

                            var allocation = new billing_InvoiceAllocation { TransactionId = transaction.TransactionId, Amount = request.AdjustmentAmount, TransactionTypeLinkId = (int)TransactionActionType.Credit, BillingAllocationType = BillingAllocationTypeEnum.InterestAllocation, LinkedTransactionId = linkedTransactionId };
                            _invoiceAllocationRepository.Create(allocation);

                            await scope.SaveChangesAsync()
                                    .ConfigureAwait(false);
                            var text = string.Empty;

                            if (!string.IsNullOrEmpty(originalInterestTransaction.RmaReference))
                                text = $"Downward Interest adjustment from {originalInterestTransaction.Amount} to {request.AdjustmentAmount} for document : {originalInterestTransaction.RmaReference}";
                            else
                                text = $"Downward Interest adjustment from {originalInterestTransaction.Amount} to {request.AdjustmentAmount}";

                            var note = new BillingNote
                            {
                                ItemId = request.RoleplayerId,
                                ItemType = BillingNoteTypeEnum.InterestAdjustment.GetDescription().SplitCamelCaseText(),
                                Text = text
                            };
                            await _billingService.AddBillingNote(note);
                            return await Task.FromResult(true);
                        }
                        return await Task.FromResult(false);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException($"Error occured doing downward adjustment - Error Message {ex.Message}");
                        return await Task.FromResult(false);
                    }
                }
            }
            return await Task.FromResult(false);
        }

        public async Task<bool> DoUpwardTransactionAdjustment(TransactionAdjustment request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                Contract.Requires(request != null);
                try
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {

                        var linkedTransactionId = 0;
                        if (request?.TransactionId != null)
                        {
                            var originalInterestTransaction = await _transactionRepository.FirstOrDefaultAsync(c => c.TransactionId == request.TransactionId);
                            linkedTransactionId = request.TransactionId;
                            var reference = await CreateDebitNoteReferenceNumber();
                            var transaction = new billing_Transaction();
                            transaction.RolePlayerId = request.RoleplayerId;
                            transaction.TransactionType = TransactionTypeEnum.DebitNote;
                            transaction.Reason = $"{interestAdjustment}: {originalInterestTransaction.RmaReference}";
                            transaction.RmaReference = reference;
                            transaction.TransactionDate = DateTime.Now.ToSaDateTime();
                            transaction.PeriodId = await GetPeriodIdBasedOnOpenPeriod();
                            transaction.TransactionReason = TransactionReasonEnum.InterestAdjustment;
                            transaction.TransactionTypeLinkId = 1;
                            transaction.LinkedTransactionId = linkedTransactionId;
                            transaction.Amount = request.AdjustmentAmount;
                            transaction.Balance = originalInterestTransaction.Balance;
                            if (originalInterestTransaction.InvoiceId.HasValue)
                                transaction.InvoiceId = originalInterestTransaction.InvoiceId.Value;

                            _transactionRepository.Create(transaction);

                            await scope.SaveChangesAsync()
                               .ConfigureAwait(false);

                            var text = string.Empty;
                            if (!string.IsNullOrEmpty(originalInterestTransaction.RmaReference))
                                text = $"Upward Interest adjustment from {originalInterestTransaction.Amount} to {request.AdjustmentAmount} for document : {originalInterestTransaction.RmaReference}";
                            else
                                text = $"Upward Interest adjustment from {originalInterestTransaction.Amount} to {request.AdjustmentAmount}";

                            var note = new BillingNote
                            {
                                ItemId = request.RoleplayerId,
                                ItemType = BillingNoteTypeEnum.InterestAdjustment.GetDescription().SplitCamelCaseText(),
                                Text = text
                            };
                            await _billingService.AddBillingNote(note);
                            return await Task.FromResult(true);
                        }
                        return await Task.FromResult(false);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error occured doing upward adjustment - Error Message {ex.Message}");
                    return await Task.FromResult(false);
                }
            }
            return await Task.FromResult(false);
        }

        private async Task<string> CreateDebitNoteReferenceNumber()
        {
            return await _documentNumberService.GenerateDebitNoteDocumentNumber();
        }

        private async Task<string> CreateCreditNoteReferenceNumber()
        {
            return await _documentNumberService.GenerateCreditNoteDocumentNumber();
        }

        public async Task<bool> DoOpenPeriodInterestAdjustment(TransactionAdjustment request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                Contract.Requires(request != null);
                try
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var linkedTransactionId = 0;
                        if (request?.TransactionId != null)
                        {
                            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                            //start of by reversing the interest transaction
                            var originalAmount = 0m;
                            var originalInterestTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == request.TransactionId);
                            var origalLinkedTransactionId = originalInterestTransaction.LinkedTransactionId;

                            int invoiceId = 0;
                            int invoiceTransactionId = 0;

                            if (origalLinkedTransactionId != null)
                            {
                                var originalInvoiceForInterst = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == origalLinkedTransactionId && t.TransactionType == TransactionTypeEnum.Invoice);
                                if (originalInvoiceForInterst != null)
                                {
                                    if (originalInvoiceForInterst.InvoiceId.HasValue)
                                    {
                                        invoiceId = originalInvoiceForInterst.InvoiceId.Value;
                                    }

                                    invoiceTransactionId = originalInvoiceForInterst.TransactionId;
                                }
                            }


                            linkedTransactionId = request.TransactionId;

                            var transaction = new billing_Transaction();
                            if (originalInterestTransaction != null)
                            {
                                originalAmount = originalInterestTransaction.Amount;
                            }
                            transaction.RolePlayerId = request.RoleplayerId;
                            transaction.TransactionType = TransactionTypeEnum.InterestReversal;
                            transaction.Reason = $"{interestAdjustment}: {originalInterestTransaction?.RmaReference}";
                            transaction.TransactionDate = postingDate;
                            transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                            transaction.TransactionTypeLinkId = (int)TransactionActionType.Credit;
                            transaction.LinkedTransactionId = linkedTransactionId;
                            transaction.Amount = originalAmount;
                            _transactionRepository.Create(transaction);

                            var newAmount = 0m;
                            if (!request.IsUpwardAdjustment)
                            {
                                newAmount = originalAmount - request.AdjustmentAmount;
                            }
                            else
                            {
                                newAmount = originalAmount + request.AdjustmentAmount;
                            }

                            var newTransaction = new billing_Transaction();
                            if (originalInterestTransaction != null)
                            {
                                if (originalInterestTransaction.TransactionEffectiveDate != null)
                                    newTransaction.TransactionEffectiveDate = originalInterestTransaction.TransactionEffectiveDate;
                                if (originalInterestTransaction.InvoiceId.HasValue)
                                {
                                    newTransaction.InvoiceId = originalInterestTransaction.InvoiceId.Value;
                                    var originalInvoice = await _invoiceRepository.FirstOrDefaultAsync(c => c.InvoiceId == originalInterestTransaction.InvoiceId.Value);
                                    if (originalInvoice.Policy != null && !string.IsNullOrEmpty(originalInvoice.Policy.PolicyNumber))
                                        newTransaction.BankReference = originalInvoice.Policy.PolicyNumber;
                                }
                            }
                            newTransaction.RolePlayerId = request.RoleplayerId;
                            newTransaction.TransactionType = TransactionTypeEnum.Interest;
                            newTransaction.Reason = $"{interestAdjustment}: {originalInterestTransaction?.RmaReference}";
                            newTransaction.TransactionDate = postingDate;
                            newTransaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                            newTransaction.TransactionReason = TransactionReasonEnum.InterestAdjustment;
                            newTransaction.TransactionTypeLinkId = (int)TransactionActionType.Debit;
                            newTransaction.Amount = newAmount;
                            newTransaction.LinkedTransactionId = origalLinkedTransactionId;
                            newTransaction.Balance = originalInterestTransaction.Balance;
                            newTransaction.RmaReference = await CreateInterestReferenceNumber();
                            if (invoiceTransactionId > 0)
                            {
                                newTransaction.LinkedTransactionId = invoiceTransactionId;
                                if (invoiceId > 0)
                                {
                                    newTransaction.InvoiceId = invoiceId;
                                }
                            }

                            _transactionRepository.Create(newTransaction);
                            //detach any previous allocations to the old interest transaction

                            var debitAllocations = await _debitTransactionAllocationRepository.Where(c => c.DebitTransactionId == request.TransactionId && c.Amount > 0).ToListAsync();
                            if (debitAllocations != null && debitAllocations.Count > 0)
                            {
                                foreach (var allocation in debitAllocations)
                                {
                                    var reveserAmount = decimal.Negate(allocation.Amount);
                                    var creditTransactionId = allocation.CreditTransactionId;

                                    var reverseAllocation = new billing_DebitTransactionAllocation { CreditTransactionId = creditTransactionId, DebitTransactionId = request.TransactionId, Amount = reveserAmount };
                                    _debitTransactionAllocationRepository.Create(reverseAllocation);
                                }
                            }

                            await scope.SaveChangesAsync()
                               .ConfigureAwait(false);

                            var text = string.Empty;
                            var direction = (request.IsUpwardAdjustment) ? "Upward" : "Downward";
                            if (!string.IsNullOrEmpty(originalInterestTransaction.RmaReference))
                                text = $"{direction} Interest adjustment from {originalInterestTransaction.Amount} to {request.AdjustmentAmount} for document : {originalInterestTransaction.RmaReference}";
                            else
                                text = $"{direction} Interest adjustment from {originalInterestTransaction.Amount} to {request.AdjustmentAmount}";

                            var note = new BillingNote
                            {
                                ItemId = request.RoleplayerId,
                                ItemType = BillingNoteTypeEnum.InterestAdjustment.GetDescription().SplitCamelCaseText(),
                                Text = text
                            };
                            await _billingService.AddBillingNote(note);

                            return await Task.FromResult(true);
                        }
                        return await Task.FromResult(false);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error occured Adjusting Interest - Error Message {ex.Message}");
                    return await Task.FromResult(false);
                }
            }
            return await Task.FromResult(false);
        }

        public async Task<List<Statement>> GetDebtorInvoiceTransactionHistory(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            var results = new List<Statement>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceTransactions = await _transactionRepository
                       .Where(c => c.RolePlayerId == rolePlayerId && !c.IsDeleted
                        && c.TransactionType == TransactionTypeEnum.Invoice && c.InvoiceId != null)
                        .ToListAsync();

                if (invoiceTransactions.Count > 0)
                {
                    var currentPeriod = await _periodService.GetCurrentPeriod();
                    var transactionInvoiceIds = new List<int>();
                    var statements = new List<Statement>();

                    var invoiceTransactionIds = invoiceTransactions
                        .Select(c => c.TransactionId)
                        .ToList();
                    var revesalsForInvoices = await _transactionRepository
                        .Where(c => c.TransactionType == TransactionTypeEnum.InvoiceReversal
                         && invoiceTransactionIds.Contains((int)c.LinkedTransactionId))
                        .ToListAsync();
                    var reversalLinkIds = revesalsForInvoices
                        .Select(c => c.LinkedTransactionId)
                        .Distinct()
                        .ToList();
                    var transactionsRaised = invoiceTransactions
                        .Where(c => !reversalLinkIds.Contains(c.TransactionId))
                        .ToList();
                    transactionInvoiceIds = transactionsRaised
                        .Where(c => c.InvoiceId.HasValue)
                        .Select(c => (int)c.InvoiceId)
                        .ToList();

                    var invoices = await _invoiceRepository.Where(i => transactionInvoiceIds.Contains(i.InvoiceId)).ToListAsync();

                    foreach (var transaction in transactionsRaised)
                    {
                        var invoice = new billing_Invoice();
                        var balance = transaction.Amount;
                        if (transaction.InvoiceId.HasValue)
                        {
                            var debitAllocations = await _invoiceAllocationRepository.Where(t =>
                       t.InvoiceId == transaction.InvoiceId)
                         .ToListAsync();

                            if (debitAllocations.Count > 0)
                            {
                                foreach (var allocation in debitAllocations)
                                {
                                    balance -= allocation.Amount;
                                }
                                if (balance < 0)
                                {
                                    balance = 0;
                                }
                            }
                            invoice = invoices.FirstOrDefault(i => i.InvoiceId == transaction.InvoiceId);
                        }
                        if (balance == 0)
                            continue;

                        var statementEntry = new Statement
                        {
                            Amount = transaction.Amount,
                            CreditAmount =
                            transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                            DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                            PolicyId = 0,
                            RunningBalance = 0, // no concept of a running balance in the system
                            InvoiceId = null,
                            TransactionDate = transaction.TransactionDate,
                            TransactionId = transaction.TransactionId,
                            TransactionType = transaction.TransactionType.GetDescription()
                        };
                        if (invoice != null)
                        {
                            statementEntry.InvoiceId = invoice.InvoiceId;
                            if (invoice.PolicyId.HasValue)
                            {
                                statementEntry.PolicyId = invoice.PolicyId.Value;
                                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId.Value);
                                statementEntry.PolicyNumber = policy.PolicyNumber;
                            }
                        }


                        statementEntry.Balance = balance;

                        statementEntry.Reference = transaction.TransactionType == TransactionTypeEnum.Invoice
                          ? string.IsNullOrEmpty(transaction.BankReference) ? transaction.RmaReference : transaction.BankReference :
                            string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                        if (invoice != null && !string.IsNullOrEmpty(invoice.InvoiceNumber))
                        {
                            statementEntry.DocumentNumber = invoice.InvoiceNumber;
                        }

                        statements.Add(statementEntry);
                    }

                    foreach (var statement in statements)
                    {
                        if (statement.TransactionDate >= currentPeriod.StartDate
                            && statement.TransactionDate <= currentPeriod.EndDate)
                        {
                            statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                        }
                        else if (statement.TransactionDate > currentPeriod.EndDate)
                        {
                            statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                        }
                        else if (statement.TransactionDate < currentPeriod.StartDate)
                        {
                            statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                        }
                    }

                    results = statements.ToList();
                }
            }


            return results;
        }

        public async Task<List<PendingInterestDate>> GetInvoiceMonthsPendingInterest(int invoiceTransactionId)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                var pendingMonths = new List<PendingInterestDate>();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var invoiceTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == invoiceTransactionId);
                    if (invoiceTransaction != null)
                    {
                        var interestTransactions = await _transactionRepository
                            .Where(c => c.LinkedTransactionId == invoiceTransactionId && !c.IsDeleted
                             && c.TransactionType == TransactionTypeEnum.Interest)
                             .ToListAsync();

                        var interestDates = new List<DateTime>();

                        if (interestTransactions.Count > 0)
                        {
                            var interestTransactionIds = interestTransactions
                                .Select(c => c.TransactionId)
                                .ToList();
                            var revesalsForInterest = await _transactionRepository
                                .Where(c => c.TransactionType == TransactionTypeEnum.InterestReversal
                                 && interestTransactionIds.Contains((int)c.LinkedTransactionId))
                                .ToListAsync();
                            var reversalLinkIds = revesalsForInterest
                                .Select(c => c.LinkedTransactionId)
                                .Distinct()
                                .ToList();
                            var transactionsRaised = interestTransactions
                                  .Where(c => !reversalLinkIds.Contains(c.TransactionId))
                                  .ToList();
                            interestDates = transactionsRaised.Where(c => c.TransactionEffectiveDate != null).Select(c => (DateTime)c.TransactionEffectiveDate).Distinct().ToList();
                        }

                        var invoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == invoiceTransaction.InvoiceId);
                        if (invoice != null)
                        {
                            var invoiceDate = new DateTime(invoiceTransaction.CreatedDate.Year, invoiceTransaction.CreatedDate.Month, invoiceTransaction.CreatedDate.Day);
                            var afterThirtyDaysOverdue = invoiceDate.AddMonths(1);
                            while (afterThirtyDaysOverdue < DateTime.Now)
                            {
                                //dont generate interest for current month
                                if (afterThirtyDaysOverdue.Month == DateTime.Now.Month)
                                    break;
                                if (!interestDates.Exists(c => c.Month == afterThirtyDaysOverdue.Month && c.Year == afterThirtyDaysOverdue.Year))
                                {
                                    pendingMonths.Add(new PendingInterestDate { PendingDate = afterThirtyDaysOverdue.GetLastDayOfMonth() });
                                }
                                afterThirtyDaysOverdue = afterThirtyDaysOverdue.AddMonths(1);

                            }
                        }
                    }
                }
                return pendingMonths;
            }
            return null;
        }

        public async Task<bool> CreateAdhocInterestForSpecifiedDates(AdhocInterestRequest request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                Contract.Requires(request != null);
                try
                {
                    using (_dbContextScopeFactory.Create())
                    {
                        if (request?.TransactionId != null)
                        {
                            int invoiceId = 0;
                            var transaction = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == request.TransactionId && t.TransactionType == TransactionTypeEnum.Invoice);
                            if (transaction != null)
                            {
                                if (transaction.InvoiceId.HasValue)
                                {
                                    invoiceId = transaction.InvoiceId.Value;
                                }
                                if (request.InterestDates != null && request.InterestDates.Count > 0)
                                {//complex calculation for calculating interest
                                 //opted for stored proc that does its own auditing
                                    var sbInterestDates = new StringBuilder();
                                    request.InterestDates.ForEach(d => sbInterestDates.Append($";{d}"));
                                    var interestDates = sbInterestDates.ToString().Substring(1);
                                    var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                                    var parameters = new List<SqlParameter>();
                                    parameters.Add(new SqlParameter
                                    {
                                        ParameterName = "@invoiceId",
                                        SqlDbType = SqlDbType.Int,
                                        Value = invoiceId
                                    });

                                    parameters.Add(new SqlParameter
                                    {
                                        ParameterName = "@interestDates",
                                        SqlDbType = SqlDbType.VarChar,
                                        Value = interestDates
                                    });

                                    parameters.Add(new SqlParameter
                                    {
                                        ParameterName = "@currentPeriodPostingDate",
                                        SqlDbType = SqlDbType.Date,
                                        Value = postingDate
                                    });

                                    parameters.Add(new SqlParameter
                                    {
                                        ParameterName = "@user",
                                        SqlDbType = SqlDbType.VarChar,
                                        Value = RmaIdentity.Email
                                    });
                                    await _transactionRepository.ExecuteSqlCommandAsync(
                                    DatabaseConstants.CreateAdhocInterest,
                                    parameters.ToArray()
                                   );
                                }
                            }

                            return await Task.FromResult(true);
                        }
                        return await Task.FromResult(false);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error occured Creating Adhoc Interest - Error Message {ex.Message}");
                    return await Task.FromResult(false);
                }
            }
            return await Task.FromResult(false);
        }

        public async Task<bool> WriteOffBadDebt(BadDebtWriteOffRequest request)
        {
            Contract.Requires(request != null);
            try
            {
                if (request != null)
                {
                    var roleplayer = await _rolePlayerService.GetFinPayeeByRolePlayerId(request.RoleplayerId);
                    var roleplayerId = request.RoleplayerId;
                    var reason = request.Reason;
                    var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(request.Period);

                    List<int?> productIds = new List<int?>();

                    using (var scope = _dbContextScopeFactory.CreateReadOnly())
                    {
                        productIds = request.BadDebtWriteOffs.Select(x => x.ProductId).Distinct().ToList();
                    }

                    if (productIds.Contains(null))
                    {
                        throw new Exception("Product Id Not Found");
                    }

                    foreach (var productId in productIds)
                    {

                        using (var scope = _dbContextScopeFactory.Create())
                        {

                            var reference = await CreateCreditNoteReferenceNumber();

                            var groupedProducts = request.BadDebtWriteOffs.Where(x => x.ProductId == productId.Value).ToList();
                            var bankaccounts = await _productService.GetProductBankAccountsByProductId(productId.Value);
                            BankAccount productBankAccount = null;

                            if (bankaccounts.Count > 0)
                            {
                                productBankAccount = await _bankAccountService.GetBankAccountById((int)bankaccounts.FirstOrDefault()?.BankAccountId);
                            }

                            var transaction = new billing_Transaction();
                            transaction.RolePlayerId = roleplayerId;
                            transaction.TransactionType = TransactionTypeEnum.CreditNote;
                            transaction.RmaReference = reference;
                            transaction.TransactionDate = postingDate;
                            transaction.TransactionTypeLinkId = (int)TransactionActionType.Credit;
                            transaction.Amount = groupedProducts.Sum(x => x.Amount);
                            transaction.PeriodId = await GetPeriodId(request.Period);
                            transaction.TransactionReason = TransactionReasonEnum.DebtWriteOff;
                            transaction.Reason = $"{reason}";
                            transaction.BankReference = productBankAccount.AccountNumber;

                            var group = groupedProducts.GroupBy(c => c.TransactionType).FirstOrDefault(c => c.Key == TransactionTypeEnum.Interest);
                            if (group != null)
                            {
                                foreach (var badDebt in group)
                                {
                                    var allocationAmount = badDebt.Amount;
                                    var creditTransactionId = transaction.TransactionId;
                                    var originalInterestTransaction = await _transactionRepository.FirstOrDefaultAsync(c => c.TransactionId == badDebt.TransactionId && c.TransactionType == TransactionTypeEnum.Interest);
                                    var originalInvoice = await GetInvoiceDetails(badDebt.InvoiceId.Value);

                                    var allocation = new billing_InvoiceAllocation { TransactionId = creditTransactionId, Amount = allocationAmount, TransactionTypeLinkId = (int)TransactionActionType.Credit, BillingAllocationType = BillingAllocationTypeEnum.InterestAllocation, LinkedTransactionId = badDebt.TransactionId };
                                    if (originalInvoice.PolicyId.HasValue)
                                    {
                                        var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(originalInvoice.PolicyId.Value);
                                        if (policy != null)
                                            allocation.ProductCategoryType = policy.ProductCategoryType;
                                    }
                                    transaction.InvoiceAllocations_TransactionId.Add(allocation);
                                }
                            }

                            var groupByInvoices = groupedProducts.GroupBy(c => c.TransactionType).FirstOrDefault(c => c.Key == TransactionTypeEnum.Invoice);
                            if (groupByInvoices != null)
                            {
                                foreach (var badDebt in groupByInvoices)
                                {
                                    var originalTransaction = await _transactionRepository.FirstOrDefaultAsync(x => x.TransactionId == badDebt.TransactionId && x.TransactionType == TransactionTypeEnum.Invoice);
                                    var originalInvoice = new billing_Invoice();
                                    var allocationAmount = badDebt.Amount;
                                    var creditTransactionId = transaction.TransactionId;

                                    if (originalTransaction != null && originalTransaction.InvoiceId.HasValue)
                                    {
                                        originalInvoice = await _invoiceRepository.FirstOrDefaultAsync(c => c.InvoiceId == originalTransaction.InvoiceId);
                                        originalInvoice.InvoiceStatus = InvoiceStatusEnum.WrittenOff;
                                        _invoiceRepository.Update(originalInvoice);
                                    }
                                    var allocation = new billing_InvoiceAllocation { InvoiceId = originalInvoice.InvoiceId, TransactionId = creditTransactionId, Amount = allocationAmount, TransactionTypeLinkId = (int)TransactionActionType.Credit, BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation, LinkedTransactionId = badDebt.TransactionId };
                                    if (originalInvoice.PolicyId.HasValue)
                                    {
                                        var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(originalInvoice.PolicyId.Value);
                                        if (policy != null)
                                            allocation.ProductCategoryType = policy.ProductCategoryType;
                                    }
                                    transaction.InvoiceAllocations_TransactionId.Add(allocation);
                                }
                            }
                            _transactionRepository.Create(transaction);
                            await scope.SaveChangesAsync()
                                .ConfigureAwait(false);

                            var text = $"Bad Debt write off to the amount of {request.Amount} doc: {reference}";
                            var note = new BillingNote
                            {
                                ItemId = roleplayerId,
                                ItemType = BillingNoteTypeEnum.BadDebtWriteOff.GetDescription().SplitCamelCaseText(),
                                Text = text
                            };
                            await _billingService.AddBillingNote(note);
                        }

                    }

                    roleplayer.DebtorStatus = !string.IsNullOrEmpty(reason) && reason.IndexOf("legal", StringComparison.InvariantCultureIgnoreCase) != -1
                    ? DebtorStatusEnum.LegalWriteOff
                    : DebtorStatusEnum.WriteOff;

                    UpdateDebtorStatusRequest updateDebtorStatusRequest = new UpdateDebtorStatusRequest();
                    if (roleplayer.DebtorStatus.HasValue)
                        updateDebtorStatusRequest.DebtorStatus = roleplayer.DebtorStatus.Value;
                    updateDebtorStatusRequest.RolePlayerId = roleplayerId;

                    await _billingService.UpdateTheDebtorStatus(updateDebtorStatusRequest);

                    return await Task.FromResult(true);

                }
                return await Task.FromResult(false);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured Writting Off Bad Debt - Error Message {ex.Message}");
                throw;
            }

            return await Task.FromResult(false);
        }

        public async Task<List<Statement>> GetDebtorInvoiceTransactionHistoryByPolicy(DebtorStatementRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);
            Contract.Requires(request != null);
            var results = new List<Statement>();
            var policyIds = new List<int>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceTransactions = await _transactionRepository
                       .Where(c => c.RolePlayerId == request.RoleplayerId && !c.IsDeleted
                        && c.TransactionType == TransactionTypeEnum.Invoice && c.InvoiceId != null)
                        .ToListAsync();
                if (request.PolicyIds != null && request.PolicyIds.Count > 0)
                    policyIds = request.PolicyIds;

                if (invoiceTransactions.Count > 0)
                {
                    var currentPeriod = await _periodService.GetCurrentPeriod();
                    var transactionInvoiceIds = new List<int>();
                    var statements = new List<Statement>();

                    var invoiceTransactionIds = invoiceTransactions
                        .Select(c => c.TransactionId)
                        .ToList();
                    var revesalsForInvoices = await _transactionRepository
                        .Where(c => c.TransactionType == TransactionTypeEnum.InvoiceReversal
                         && invoiceTransactionIds.Contains((int)c.LinkedTransactionId))
                        .ToListAsync();
                    var reversalLinkIds = revesalsForInvoices
                        .Select(c => c.LinkedTransactionId)
                        .Distinct()
                        .ToList();
                    var transactionsRaised = invoiceTransactions
                        .Where(c => !reversalLinkIds.Contains(c.TransactionId))
                        .ToList();
                    transactionInvoiceIds = transactionsRaised
                        .Where(c => c.InvoiceId.HasValue)
                        .Select(c => (int)c.InvoiceId)
                        .ToList();

                    var invoices = await _invoiceRepository.Where(i => transactionInvoiceIds.Contains(i.InvoiceId)).ToListAsync();

                    foreach (var transaction in transactionsRaised.Where(c => policyIds.Contains(c.Invoice.PolicyId.Value)))
                    {
                        var invoice = new billing_Invoice();
                        var balance = transaction.Amount;
                        if (transaction.InvoiceId.HasValue)
                        {
                            var debitAllocations = await _invoiceAllocationRepository.Where(t =>
                               t.InvoiceId == transaction.InvoiceId && t.Transaction.TransactionType == TransactionTypeEnum.Payment)
                                 .ToListAsync();

                            if (debitAllocations.Count > 0)
                            {
                                foreach (var allocation in debitAllocations)
                                {
                                    balance -= allocation.Amount;
                                }
                            }
                            invoice = invoices.FirstOrDefault(i => i.InvoiceId == transaction.InvoiceId);
                        }

                        //deduct premium write offs and  other linked credit transactions      
                        var linkedCreditTransactions = await _invoiceAllocationRepository.Where(x => x.LinkedTransactionId == transaction.TransactionId && x.TransactionTypeLinkId == (int)TransactionActionType.Credit && x.Transaction.TransactionType != TransactionTypeEnum.Payment).ToListAsync();

                        if (linkedCreditTransactions.Count > 0)
                        {
                            foreach (var linkedCreditTransaction in linkedCreditTransactions)
                            {
                                balance -= linkedCreditTransaction.Amount;
                            }
                        }

                        //add back linked debits and reinstates
                        var linkedDebitTransactions = await _invoiceAllocationRepository.Where(x => x.LinkedTransactionId == transaction.TransactionId && x.TransactionTypeLinkId == (int)TransactionActionType.Debit && x.Transaction.TransactionType != TransactionTypeEnum.Payment).ToListAsync();

                        if (linkedDebitTransactions.Count > 0)
                        {
                            foreach (var linkedCreditTransaction in linkedDebitTransactions)
                            {
                                balance += linkedCreditTransaction.Amount;
                            }
                        }

                        var statementEntry = new Statement
                        {
                            Amount = transaction.Amount,
                            CreditAmount =
                            transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                            DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                            PolicyId = 0,
                            RunningBalance = 0,
                            InvoiceId = null,
                            TransactionDate = transaction.TransactionDate,
                            TransactionId = transaction.TransactionId,
                            TransactionType = transaction.TransactionType.GetDescription()
                        };
                        if (invoice != null)
                        {
                            statementEntry.InvoiceId = invoice.InvoiceId;
                            if (invoice.PolicyId.HasValue)
                            {
                                statementEntry.PolicyId = invoice.PolicyId.Value;
                                var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(statementEntry.PolicyId);
                                statementEntry.PolicyNumber = policy.PolicyNumber;
                                if (policy != null)
                                    statementEntry.ProductId = policy.ProductOption.ProductId;
                            }
                        }

                        statementEntry.Balance = balance;

                        statementEntry.Reference = transaction.TransactionType == TransactionTypeEnum.Invoice
                          ? string.IsNullOrEmpty(transaction.BankReference) ? transaction.RmaReference : transaction.BankReference :
                            string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                        if (invoice != null && !string.IsNullOrEmpty(invoice.InvoiceNumber))
                        {
                            statementEntry.DocumentNumber = invoice.InvoiceNumber;
                        }

                        statements.Add(statementEntry);
                    }

                    foreach (var statement in statements)
                    {
                        if (statement.TransactionDate >= currentPeriod.StartDate
                            && statement.TransactionDate <= currentPeriod.EndDate)
                        {
                            statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                        }
                        else if (statement.TransactionDate > currentPeriod.EndDate)
                        {
                            statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                        }
                        else if (statement.TransactionDate < currentPeriod.StartDate)
                        {
                            statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                        }
                    }
                    results = statements.ToList();
                }
            }
            return results;
        }

        public async Task<List<Statement>> GetDebtorInterestTransactionHistoryByPolicy(DebtorStatementRequest request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                Contract.Requires(request != null);
                var results = new List<Statement>();
                var policyIds = new List<int>();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var interestTransactions = await _transactionRepository
                           .Where(c => c.RolePlayerId == request.RoleplayerId && !c.IsDeleted
                            && c.TransactionType == TransactionTypeEnum.Interest)
                            .ToListAsync();
                    if (request.PolicyIds != null && request.PolicyIds.Count > 0)
                        policyIds = request.PolicyIds;

                    if (interestTransactions.Count > 0)
                    {
                        var currentPeriod = await _periodService.GetCurrentPeriod();
                        var statements = new List<Statement>();

                        var interestTransactionIds = interestTransactions
                            .Select(c => c.TransactionId)
                            .ToList();
                        var revesalsForInterest = await _transactionRepository
                            .Where(c => c.TransactionType == TransactionTypeEnum.InterestReversal
                             && interestTransactionIds.Contains((int)c.LinkedTransactionId))
                            .ToListAsync();
                        var reversalLinkIds = revesalsForInterest
                            .Select(c => c.LinkedTransactionId)
                            .Distinct()
                            .ToList();
                        var transactionsRaised = interestTransactions
                              .Where(c => !reversalLinkIds.Contains(c.TransactionId))
                              .ToList();

                        foreach (var transaction in transactionsRaised)
                        {

                            var balance = transaction.Amount;

                            //deduct interest write offs and other linked credit transactions
                            var linkedCreditTransactions = await _invoiceAllocationRepository.Where(x => x.LinkedTransactionId == transaction.TransactionId && x.TransactionTypeLinkId == (int)TransactionActionType.Credit).ToListAsync();

                            if (linkedCreditTransactions.Count > 0)
                            {
                                foreach (var linkedCreditTransaction in linkedCreditTransactions)
                                {
                                    balance -= linkedCreditTransaction.Amount;
                                }
                            }

                            //add back reinstated interest transaction and other linked debit transactions
                            var linkedDebitTransactions = await _invoiceAllocationRepository.Where(x => x.LinkedTransactionId == transaction.TransactionId && x.TransactionTypeLinkId == (int)TransactionActionType.Debit).ToListAsync();

                            if (linkedCreditTransactions.Count > 0)
                            {
                                foreach (var linkedCreditTransaction in linkedCreditTransactions)
                                {
                                    balance += linkedCreditTransaction.Amount;
                                }
                            }

                            var statementEntry = new Statement
                            {
                                Amount = transaction.Amount,
                                CreditAmount =
                                transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                                DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                                PolicyId = 0,
                                RunningBalance = 0,
                                InvoiceId = null,
                                TransactionDate = transaction.TransactionDate,
                                TransactionId = transaction.TransactionId,
                                TransactionType = transaction.TransactionType.GetDescription()
                            };

                            if (transaction.InvoiceId.HasValue)
                            {
                                var originalInvoiceTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == transaction.InvoiceId.Value && t.TransactionType == TransactionTypeEnum.Invoice);
                                if (originalInvoiceTransaction != null)
                                {
                                    var originalInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == originalInvoiceTransaction.InvoiceId);
                                    if (originalInvoice.PolicyId.HasValue)
                                    {
                                        statementEntry.PolicyId = originalInvoice.PolicyId.Value;
                                        var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(statementEntry.PolicyId);
                                        if (policy != null)
                                            statementEntry.ProductId = policy.ProductOption.ProductId;
                                    }

                                    statementEntry.InvoiceId = originalInvoice.InvoiceId;
                                    await _invoiceRepository.LoadAsync(originalInvoice, x => x.Policy);
                                    if (originalInvoice != null && originalInvoice.Policy != null && !string.IsNullOrEmpty(originalInvoice.Policy.PolicyNumber))
                                    {
                                        statementEntry.PolicyNumber = originalInvoice.Policy.PolicyNumber;
                                    }

                                }
                            }
                            else
                            {
                                //get linked transaction invoice in case transaction.invoiceId is not provided
                                if (transaction.LinkedTransactionId.HasValue)
                                {
                                    var originalInvoiceTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == transaction.LinkedTransactionId.Value && t.TransactionType == TransactionTypeEnum.Invoice);
                                    if (originalInvoiceTransaction != null)
                                    {
                                        var originalInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == originalInvoiceTransaction.InvoiceId);
                                        if (originalInvoice.PolicyId.HasValue)
                                        {
                                            statementEntry.PolicyId = originalInvoice.PolicyId.Value;
                                            var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(statementEntry.PolicyId);
                                            if (policy != null)
                                                statementEntry.ProductId = policy.ProductOption.ProductId;
                                        }
                                        statementEntry.InvoiceId = originalInvoice.InvoiceId;
                                        await _invoiceRepository.LoadAsync(originalInvoice, x => x.Policy);
                                        if (originalInvoice != null && originalInvoice.Policy != null && !string.IsNullOrEmpty(originalInvoice.Policy.PolicyNumber))
                                        {
                                            statementEntry.PolicyNumber = originalInvoice.Policy.PolicyNumber;
                                        }
                                    }
                                }
                            }

                            statementEntry.Balance = balance;

                            statementEntry.Description = string.Empty;
                            if (transaction.TransactionEffectiveDate != null)
                            {
                                statementEntry.Description = transaction.TransactionType.GetDescription() + " - " +
                                  transaction.TransactionEffectiveDate?.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                  transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);
                            }

                            statementEntry.DocumentNumber = string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                            statements.Add(statementEntry);
                        }

                        foreach (var statement in statements.Where(c => policyIds.Contains(c.PolicyId)))
                        {
                            if (statement.TransactionDate >= currentPeriod.StartDate
                                && statement.TransactionDate <= currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate > currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate < currentPeriod.StartDate)
                            {
                                statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                            }
                        }
                        results = statements.ToList();
                    }
                }
                return results;
            }
            return null;
        }

        public async Task<List<Statement>> GetInterestTransactionsWrittenOffByPolicy(DebtorStatementRequest request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                Contract.Requires(request != null);
                var results = new List<Statement>();
                var policyIds = new List<int>();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var creditNotesTransactions = await _transactionRepository
                           .Where(c => c.RolePlayerId == request.RoleplayerId && !c.IsDeleted
                            && c.TransactionType == TransactionTypeEnum.CreditNote && c.TransactionReason == TransactionReasonEnum.InterestWriteOff)
                            .ToListAsync();
                    if (request.PolicyIds != null && request.PolicyIds.Count > 0)
                        policyIds = request.PolicyIds;

                    if (creditNotesTransactions.Count > 0)
                    {
                        var currentPeriod = await _periodService.GetCurrentPeriod();
                        var statements = new List<Statement>();

                        var creditnoteTransactionIds = creditNotesTransactions
                            .Select(c => c.TransactionId)
                            .ToList();
                        var reinstatementsForCreditnotes = await _transactionRepository
                            .Where(c => c.TransactionReason == TransactionReasonEnum.InterestReinstate
                             && creditnoteTransactionIds.Contains((int)c.LinkedTransactionId))
                            .ToListAsync();
                        var reinstatementsLinkIds = reinstatementsForCreditnotes
                            .Select(c => c.LinkedTransactionId)
                            .Distinct()
                            .ToList();
                        var pendingReinstateTransactions = creditNotesTransactions
                              .Where(c => !reinstatementsLinkIds.Contains(c.TransactionId))
                              .ToList();

                        foreach (var transaction in pendingReinstateTransactions)
                        {
                            var debitAllocations = await _debitTransactionAllocationRepository
                                .Where(t => t.DebitTransactionId == transaction.TransactionId)
                                .ToListAsync();
                            var balance = transaction.Amount;
                            if (debitAllocations.Count > 0)
                            {
                                foreach (var allocation in debitAllocations)
                                {
                                    balance -= allocation.Amount;
                                }
                            }

                            var statementEntry = new Statement
                            {
                                Amount = transaction.Amount,
                                CreditAmount =
                                transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                                DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                                PolicyId = 0,
                                RunningBalance = 0,
                                InvoiceId = null,
                                TransactionDate = transaction.TransactionDate,
                                TransactionId = transaction.TransactionId,
                                TransactionType = TransactionTypeEnum.Interest.GetDescription(),
                                Description = transaction.Reason
                            };

                            if (transaction.LinkedTransactionId.HasValue)
                            {
                                var originalTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == transaction.LinkedTransactionId.Value && t.TransactionType == TransactionTypeEnum.Interest);
                                if (originalTransaction != null && originalTransaction.InvoiceId.HasValue)
                                {
                                    var originalInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == originalTransaction.InvoiceId.Value);
                                    statementEntry.InvoiceId = originalInvoice.InvoiceId;
                                    if (originalInvoice.PolicyId.HasValue)
                                    {
                                        statementEntry.PolicyId = originalInvoice.PolicyId.Value;
                                        var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(originalInvoice.PolicyId.Value);
                                        statementEntry.PolicyNumber = policy.PolicyNumber;
                                    }
                                }
                            }

                            statementEntry.Balance = balance;

                            var transactionPeriod = await _periodService.GetPeriod(transaction.TransactionDate);

                            statementEntry.Description = transactionPeriod != null
                                ? transaction.TransactionType.GetDescription() + " - " +
                                  transactionPeriod.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                  transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : transaction.TransactionType.GetDescription() + " - " +
                                  transaction.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                  transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);

                            statementEntry.DocumentNumber = string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                            //filter statments by policy
                            if (policyIds.Contains(statementEntry.PolicyId))
                            {
                                statements.Add(statementEntry);
                            }
                        }

                        foreach (var statement in statements.Where(c => policyIds.Contains(c.PolicyId)))
                        {
                            if (statement.TransactionDate >= currentPeriod.StartDate
                                && statement.TransactionDate <= currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate > currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate < currentPeriod.StartDate)
                            {
                                statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                            }
                        }
                        results = statements.ToList();
                    }
                }
                return results;
            }
            return null;
        }

        public async Task<List<Statement>> GetTransactionsWrittenOffByRolePlayer(DebtorStatementRequest request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                var results = new List<Statement>();
                var policyIds = new List<int>();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var creditNotesTransactions = await _transactionRepository
                   .Where(c => c.RolePlayerId == request.RoleplayerId && !c.IsDeleted
                    && c.TransactionType == TransactionTypeEnum.CreditNote &&
                    c.TransactionReason == TransactionReasonEnum.DebtWriteOff)
                    .ToListAsync();

                    if (creditNotesTransactions.Count > 0)
                    {
                        var currentPeriod = await _periodService.GetCurrentPeriod();
                        var statements = new List<Statement>();

                        var creditnoteTransactionIds = creditNotesTransactions.Select(c => c.TransactionId).ToList();
                        var reinstatementsForCreditnotes = await _transactionRepository
                            .Where(c => c.TransactionReason == TransactionReasonEnum.PremiumReinstate
                             && creditnoteTransactionIds.Contains((int)c.LinkedTransactionId))
                            .ToListAsync();
                        var reinstatementsLinkIds = reinstatementsForCreditnotes
                            .Select(c => c.LinkedTransactionId)
                            .Distinct()
                            .ToList();
                        var pendingReinstateTransactions = creditNotesTransactions
                              .Where(c => !reinstatementsLinkIds.Contains(c.TransactionId))
                              .ToList();

                        foreach (var transaction in pendingReinstateTransactions)
                        {
                            //exclude transactions linked to other transactions
                            var linkedTransactions = _transactionRepository.Where(x => x.LinkedTransactionId == transaction.TransactionId);

                            if (linkedTransactions.Any()) { continue; }

                            var allocations = await _invoiceAllocationRepository
                                .Where(t => t.TransactionId == transaction.TransactionId)
                                .ToListAsync();
                            var balance = transaction.Amount;
                            if (allocations.Count > 0)
                            {
                                foreach (var allocation in allocations)
                                {
                                    balance -= allocation.Amount;
                                }
                            }

                            var statementEntry = new Statement
                            {
                                Amount = transaction.Amount,
                                CreditAmount =
                                transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                                DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                                PolicyId = 0,
                                RunningBalance = 0,
                                InvoiceId = null,
                                TransactionDate = transaction.TransactionDate,
                                TransactionId = transaction.TransactionId,
                                TransactionType = TransactionTypeEnum.Interest.GetDescription(),
                                Description = transaction.Reason
                            };

                            statementEntry.Balance = balance;

                            var transactionPeriod = await _periodService.GetPeriod(transaction.TransactionDate);

                            statementEntry.Description = transactionPeriod != null
                                ? transaction.TransactionType.GetDescription() + " - " +
                                  transactionPeriod.StartDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                  transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture)
                                : transaction.TransactionType.GetDescription() + " - " +
                                  transaction.TransactionDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                  transaction.TransactionDate.ToString("yyyy", CultureInfo.InvariantCulture);

                            statementEntry.DocumentNumber = string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                            statements.Add(statementEntry);

                        }

                        foreach (var statement in statements.Where(c => policyIds.Contains(c.PolicyId)))
                        {
                            if (statement.TransactionDate >= currentPeriod.StartDate
                                && statement.TransactionDate <= currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate > currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate < currentPeriod.StartDate)
                            {
                                statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                            }
                        }
                        results = statements.ToList();

                    }
                }
                return results;
            }
            return null;
        }

        public async Task<List<Statement>> GetInvoiceTransactionsWrittenOffByPolicy(DebtorStatementRequest request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                Contract.Requires(request != null);
                var results = new List<Statement>();
                var policyIds = new List<int>();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var creditNotesTransactions = await _transactionRepository
                           .Where(c => c.RolePlayerId == request.RoleplayerId && !c.IsDeleted
                            && c.TransactionType == TransactionTypeEnum.CreditNote && c.TransactionReason == TransactionReasonEnum.PremiumWriteOff)
                            .ToListAsync();
                    if (request.PolicyIds != null && request.PolicyIds.Count > 0)
                        policyIds = request.PolicyIds;

                    if (creditNotesTransactions.Count > 0)
                    {
                        var currentPeriod = await _periodService.GetCurrentPeriod();
                        var statements = new List<Statement>();

                        var creditnoteTransactionIds = creditNotesTransactions
                            .Select(c => c.TransactionId)
                            .ToList();
                        var reinstatementsForCreditnotes = await _transactionRepository
                            .Where(c => c.TransactionReason == TransactionReasonEnum.PremiumReinstate
                             && creditnoteTransactionIds.Contains((int)c.LinkedTransactionId))
                            .ToListAsync();
                        var reinstatementsLinkIds = reinstatementsForCreditnotes
                            .Select(c => c.LinkedTransactionId)
                            .Distinct()
                            .ToList();
                        var pendingReinstateTransactions = creditNotesTransactions
                              .Where(c => !reinstatementsLinkIds.Contains(c.TransactionId))
                              .ToList();


                        foreach (var transaction in pendingReinstateTransactions)
                        {
                            var invoice = new billing_Invoice();
                            var balance = transaction.Amount;
                            if (transaction.InvoiceId.HasValue)
                            {
                                var debitAllocations = await _invoiceAllocationRepository.Where(t =>
                           t.InvoiceId == transaction.InvoiceId)
                             .ToListAsync();

                                if (debitAllocations.Count > 0)
                                {
                                    foreach (var allocation in debitAllocations)
                                    {
                                        balance -= allocation.Amount;
                                    }
                                    if (balance < 0)
                                    {
                                        balance = 0;
                                    }
                                }
                            }

                            var statementEntry = new Statement
                            {
                                Amount = transaction.Amount,
                                CreditAmount =
                                transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                                DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                                PolicyId = 0,
                                RunningBalance = 0,
                                InvoiceId = null,
                                TransactionDate = transaction.TransactionDate,
                                TransactionId = transaction.TransactionId,
                                TransactionType = TransactionTypeEnum.Invoice.GetDescription(),
                                Description = transaction.Reason
                            };
                            if (transaction.InvoiceId.HasValue)
                            {
                                var originalInvoiceTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionId == transaction.LinkedTransactionId.Value && t.TransactionType == TransactionTypeEnum.Invoice);
                                if (originalInvoiceTransaction != null)
                                {
                                    var originalInvoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == originalInvoiceTransaction.InvoiceId);
                                    statementEntry.InvoiceId = originalInvoice.InvoiceId;
                                    if (originalInvoice.PolicyId.HasValue)
                                    {
                                        statementEntry.PolicyId = originalInvoice.PolicyId.Value;
                                        var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(originalInvoice.PolicyId.Value);
                                        statementEntry.PolicyNumber = policy.PolicyNumber;
                                    }
                                }
                            }

                            statementEntry.Balance = balance;
                            statementEntry.DocumentNumber = transaction.RmaReference;

                            //filter statments by policy
                            if (policyIds.Contains(statementEntry.PolicyId))
                            {
                                statements.Add(statementEntry);
                            }
                        }
                        foreach (var statement in statements.Where(c => policyIds.Contains(c.PolicyId)))
                        {
                            if (statement.TransactionDate >= currentPeriod.StartDate
                                && statement.TransactionDate <= currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate > currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate < currentPeriod.StartDate)
                            {
                                statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                            }
                        }
                        results = statements.ToList();
                    }
                }
                return results;
            }
            return null;
        }

        public async Task<bool> ReinstateBadDebt(BadDebtReinstateRequest request)
        {
            Contract.Requires(request != null);
            try
            {
                if (request != null)
                {
                    var roleplayerId = request.RoleplayerId;
                    var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(request.Period);
                    var roleplayer = await _rolePlayerService.GetFinPayeeByRolePlayerId(request.RoleplayerId);

                    using (var scope = _dbContextScopeFactory.Create())
                    {

                        foreach (var badDebt in request.BadDebtReinstates)
                        {
                            var transaction = new billing_Transaction();
                            var transactionEffectiveDate = DateTime.Now.ToSaDateTime();
                            var originalTransaction = await _transactionRepository.FirstOrDefaultAsync(c => c.TransactionId == badDebt.TransactionId);
                            var text = string.Empty;
                            var originalRmaReference = originalTransaction?.RmaReference;

                            var reinstateDocumentReference = await CreateReinstateReferenceNumber();

                            if (originalTransaction != null && originalTransaction.TransactionEffectiveDate != null)
                            {
                                transactionEffectiveDate = (DateTime)originalTransaction.TransactionEffectiveDate;
                            }

                            text = (!string.IsNullOrEmpty(originalTransaction.RmaReference)) ? $"Bad Debt Reinstate of doc: {originalTransaction.RmaReference} with doc: {reinstateDocumentReference}" : "Bad Debt Reinstate";

                            transaction.RolePlayerId = roleplayerId;
                            transaction.TransactionType = TransactionTypeEnum.DebitNote;
                            transaction.Reason = $"Debt Reinstate :{originalRmaReference}:{request.Reason}";
                            transaction.RmaReference = reinstateDocumentReference;
                            transaction.TransactionDate = postingDate;
                            transaction.TransactionTypeLinkId = (int)TransactionActionType.Debit;
                            transaction.Amount = badDebt.Amount;
                            transaction.PeriodId = await GetPeriodId(request.Period);
                            transaction.TransactionReason = TransactionReasonEnum.Reinstate;
                            transaction.LinkedTransactionId = badDebt.TransactionId;//avoid reinstating the same interest
                            transaction.TransactionEffectiveDate = DateTime.Now.ToSaDateTime();
                            transaction.BankReference = originalTransaction.BankReference;

                            //reverse invoice write offs

                            var previousWriteOffAllocations = _invoiceAllocationRepository.Where(x => x.TransactionId == badDebt.TransactionId && (x.LinkedTransaction.TransactionType == TransactionTypeEnum.Interest || x.LinkedTransaction.TransactionType == TransactionTypeEnum.Invoice) && !x.IsDeleted);
                            List<billing_InvoiceAllocation> reinstateAllocations = new List<billing_InvoiceAllocation>();
                            foreach (var item in previousWriteOffAllocations)
                            {
                                billing_InvoiceAllocation invoiceAllocation = new billing_InvoiceAllocation();
                                invoiceAllocation.TransactionId = transaction.TransactionId;
                                invoiceAllocation.LinkedTransactionId = item.LinkedTransactionId;
                                invoiceAllocation.Amount = item.Amount;
                                invoiceAllocation.InvoiceId = item.InvoiceId;
                                invoiceAllocation.ProductCategoryType = item.ProductCategoryType;
                                invoiceAllocation.TransactionTypeLinkId = (int)TransactionActionType.Debit;
                                invoiceAllocation.BillingAllocationType = item.BillingAllocationType;
                                transaction.InvoiceAllocations_TransactionId.Add(item);
                            }

                            _transactionRepository.Create(transaction);
                            var note = new BillingNote
                            {
                                ItemId = roleplayerId,
                                ItemType = BillingNoteTypeEnum.BadDebtReinstate.GetDescription().SplitCamelCaseText(),
                                Text = text
                            };
                            await _billingService.AddBillingNote(note);
                        }

                        await scope.SaveChangesAsync()
                          .ConfigureAwait(false);
                    }

                    if (roleplayer.DebtorStatus.HasValue && (roleplayer.DebtorStatus == DebtorStatusEnum.WriteOff
                        || roleplayer.DebtorStatus == DebtorStatusEnum.LegalWriteOff))
                    {

                        UpdateDebtorStatusRequest updateDebtorStatusRequest = new UpdateDebtorStatusRequest();
                        updateDebtorStatusRequest.DebtorStatus = DebtorStatusEnum.PremiumReinstate;
                        updateDebtorStatusRequest.RolePlayerId = roleplayerId;

                        await _billingService.UpdateTheDebtorStatus(updateDebtorStatusRequest);
                    }

                    return await Task.FromResult(true);
                }
                return await Task.FromResult(false);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured Reinstating Bad Debt - Error Message {ex.Message}");
                return await Task.FromResult(false);
            }
        }

        public async Task<decimal> GetDebtorCreditBalance(int roleplayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _transactionRepository.SqlQueryAsync<decimal>(
                    DatabaseConstants.GetDebtorCreditBalance,
                    new SqlParameter("@roleplayerId", roleplayerId));
                return result.FirstOrDefault();
            }
        }

        public async Task<List<Statement>> GetDebtorInvoiceTransactionHistoryForAdhocInterest(int rolePlayerId)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                var results = new List<Statement>();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var productOptionGeneratingInterest = await _productOptionService.GetProductOptionsThatAccumulatesInterest();
                    var productOptionGeneratingInterestIds = productOptionGeneratingInterest.Select(c => c.Id);
                    var debtorPolicies = await _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(rolePlayerId);
                    var validPolicyIds = debtorPolicies.Where(c => productOptionGeneratingInterestIds.Contains(c.ProductOptionId)).Select(c => c.PolicyId).ToList();

                    if (validPolicyIds.Count == 0)
                        return results;

                    var invoiceTransactions = await _transactionRepository
                           .Where(c => c.RolePlayerId == rolePlayerId && !c.IsDeleted
                            && c.TransactionType == TransactionTypeEnum.Invoice && c.InvoiceId != null)
                            .ToListAsync();

                    if (invoiceTransactions.Count > 0)
                    {
                        var currentPeriod = await _periodService.GetCurrentPeriod();
                        var transactionInvoiceIds = new List<int>();
                        var statements = new List<Statement>();

                        var invoiceTransactionIds = invoiceTransactions
                            .Select(c => c.TransactionId)
                            .ToList();
                        var revesalsForInvoices = await _transactionRepository
                            .Where(c => c.TransactionType == TransactionTypeEnum.InvoiceReversal
                             && invoiceTransactionIds.Contains((int)c.LinkedTransactionId))
                            .ToListAsync();
                        var reversalLinkIds = revesalsForInvoices
                            .Select(c => c.LinkedTransactionId)
                            .Distinct()
                            .ToList();
                        var transactionsRaised = invoiceTransactions
                            .Where(c => !reversalLinkIds.Contains(c.TransactionId))
                            .ToList();
                        transactionInvoiceIds = transactionsRaised
                            .Where(c => c.InvoiceId.HasValue)
                            .Select(c => (int)c.InvoiceId)
                            .ToList();

                        var invoices = await _invoiceRepository.Where(i => transactionInvoiceIds.Contains(i.InvoiceId) && validPolicyIds.Contains(i.PolicyId.Value)).ToListAsync();
                        var validInvoiceIds = invoices.Select(c => c.InvoiceId).ToList();
                        foreach (var transaction in transactionsRaised.Where(c => c.InvoiceId != null && validInvoiceIds.Contains((int)c.InvoiceId)))
                        {
                            var invoice = new billing_Invoice();
                            var balance = transaction.Amount;
                            if (transaction.InvoiceId.HasValue)
                            {
                                var debitAllocations = await _invoiceAllocationRepository.Where(t =>
                           t.InvoiceId == transaction.InvoiceId)
                             .ToListAsync();

                                if (debitAllocations.Count > 0)
                                {
                                    foreach (var allocation in debitAllocations)
                                    {
                                        balance -= allocation.Amount;
                                    }
                                    if (balance < 0)
                                    {
                                        balance = 0;
                                    }
                                }
                                invoice = invoices.FirstOrDefault(i => i.InvoiceId == transaction.InvoiceId);
                            }
                            if (balance == 0)
                                continue;

                            var statementEntry = new Statement
                            {
                                Amount = transaction.Amount,
                                CreditAmount =
                                transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit ? transaction.Amount : 0,
                                DebitAmount = transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit ? transaction.Amount : 0,
                                PolicyId = 0,
                                RunningBalance = 0, // no concept of a running balance in the system
                                InvoiceId = null,
                                TransactionDate = transaction.TransactionDate,
                                TransactionId = transaction.TransactionId,
                                TransactionType = transaction.TransactionType.GetDescription()
                            };
                            if (invoice != null)
                            {
                                statementEntry.InvoiceId = invoice.InvoiceId;
                                if (invoice.PolicyId.HasValue)
                                {
                                    statementEntry.PolicyId = invoice.PolicyId.Value;
                                    var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId.Value);
                                    statementEntry.PolicyNumber = policy.PolicyNumber;
                                }
                            }


                            statementEntry.Balance = balance;

                            statementEntry.Reference = transaction.TransactionType == TransactionTypeEnum.Invoice
                              ? string.IsNullOrEmpty(transaction.BankReference) ? transaction.RmaReference : transaction.BankReference :
                                string.IsNullOrEmpty(transaction.RmaReference) ? transaction.BankReference : transaction.RmaReference;
                            if (invoice != null && !string.IsNullOrEmpty(invoice.InvoiceNumber))
                            {
                                statementEntry.DocumentNumber = invoice.InvoiceNumber;
                            }

                            statements.Add(statementEntry);
                        }

                        foreach (var statement in statements)
                        {
                            if (statement.TransactionDate >= currentPeriod.StartDate
                                && statement.TransactionDate <= currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Current.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate > currentPeriod.EndDate)
                            {
                                statement.Period = PeriodStatusEnum.Future.DisplayAttributeValue();
                            }
                            else if (statement.TransactionDate < currentPeriod.StartDate)
                            {
                                statement.Period = PeriodStatusEnum.History.DisplayAttributeValue();
                            }
                        }

                        results = statements.ToList();
                    }
                }
                return results;
            }
            return null;
        }

        public async Task ReverseInterestInClosedPeriod(Statement item, int roleplayerId, string reason)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
                if (item != null)
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                        var reference = await CreateCreditNoteReferenceNumber();
                        var transaction = new billing_Transaction();
                        transaction.RolePlayerId = roleplayerId;
                        transaction.TransactionType = TransactionTypeEnum.CreditNote;
                        transaction.Reason = reason;
                        transaction.RmaReference = reference;
                        transaction.TransactionDate = postingDate;
                        transaction.TransactionTypeLinkId = (int)TransactionActionType.Credit;
                        transaction.Amount = item.Amount;
                        transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);

                        if (item.InvoiceId.HasValue)//the original invoice linked to this transaction
                            transaction.InvoiceId = item.InvoiceId.Value;
                        transaction.LinkedTransactionId = item.TransactionId;
                        var allocationAmount = item.Amount;

                        var creditTransactionId = transaction.TransactionId;
                        if (item.InvoiceId.HasValue)
                        {
                            var originalInvoice = await GetInvoiceDetails(item.InvoiceId.Value);
                            var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(originalInvoice.PolicyId.Value);

                            var allocation = new billing_InvoiceAllocation { TransactionId = creditTransactionId, InvoiceId = item.InvoiceId.Value, Amount = allocationAmount, TransactionTypeLinkId = (int)TransactionActionType.Credit, BillingAllocationType = BillingAllocationTypeEnum.InterestAllocation };
                            if (policy != null)
                                allocation.ProductCategoryType = policy.ProductCategoryType;

                            transaction.InvoiceAllocations_TransactionId.Add(allocation);
                        }

                        _transactionRepository.Create(transaction);

                        await scope.SaveChangesAsync()
                                         .ConfigureAwait(false);
                    }
                }
        }

        public async Task ReverseInterestInOpenPeriod(Statement item, int roleplayerId, string reason)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
                if (item != null)
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

                        var transaction = new billing_Transaction();
                        transaction.RolePlayerId = roleplayerId;
                        transaction.TransactionType = TransactionTypeEnum.InterestReversal;
                        transaction.Reason = reason;
                        transaction.RmaReference = interestReversal;
                        transaction.TransactionDate = postingDate;
                        transaction.TransactionTypeLinkId = 2;
                        transaction.Amount = item.Amount;
                        transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);

                        if (item.InvoiceId.HasValue)//the original invoice linked to this transaction
                            transaction.InvoiceId = item.InvoiceId.Value;
                        transaction.LinkedTransactionId = item.TransactionId;

                        _transactionRepository.Create(transaction);

                        await scope.SaveChangesAsync()
                                         .ConfigureAwait(false);
                    }
                }
        }

        private async Task<string> CreateInterestReferenceNumber()
        {
            return await _documentNumberService.GenerateInterestDocumentNumber();
        }

        private async Task<string> CreateReinstateReferenceNumber()
        {
            return await _documentNumberService.GenerateReinstateDocumentNumber();
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

        private async Task<billing_Invoice> GetInvoiceDetails(int invoiceId)
        {
            return await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);
        }

        public async Task<List<Transaction>> GetDebitTransactionsForAllocationByPolicies(int rolePlayerId, decimal amount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId && (t.TransactionTypeLinkId == (int)TransactionActionType.Debit
                                      && t.InvoiceAllocations_TransactionId.Sum(c => c.Amount) != t.Amount)).ToListAsync();

                var transactions = Mapper.Map<List<Transaction>>(entities);
                return transactions.ToList();
            }
        }

        public async Task<List<Transaction>> GetTransactionsForTransferByAccountNumber(InterDebtorTransactionRequest request)
        {
            Contract.Requires(request != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);
            var currentPeriod = await _periodService.GetCurrentPeriod();
            var latestPeriod = await _periodService.GetLatestPeriod();

            var startDate = currentPeriod.StartDate;
            var endDate = (latestPeriod != null) ? latestPeriod.EndDate : currentPeriod.EndDate;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rmaBankAccount = request.RmaBankAccount != null ? request.RmaBankAccount : string.Empty;
                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@startDate",
                    SqlDbType = SqlDbType.Date,
                    Value = startDate
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@interestDates",
                    SqlDbType = SqlDbType.Date,
                    Value = endDate
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@roleplayerId",
                    SqlDbType = SqlDbType.Int,
                    Value = request.RoleplayerId
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@bankaccount",
                    SqlDbType = SqlDbType.VarChar,
                    Value = rmaBankAccount
                });

                var results = await _finPayeeRepository.SqlQueryAsync<Transaction>(DatabaseConstants.GetTransactionsCreditForTransfer,
                    new SqlParameter("@startDate", startDate), new SqlParameter("@endDate", endDate),
                    new SqlParameter("@roleplayerId", request.RoleplayerId),
                    new SqlParameter("@bankaccount", rmaBankAccount));

                return results;
            }
        }

        public async Task<List<DebtorAccountNumberModel>> GetDebtorsByAccountNumber(InterDebtorToDebtorRequest request)
        {
            Contract.Requires(request != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchText = request.SearchText != null ? request.SearchText : string.Empty;
                var rmaBankAccount = request.RmaBankAccount != null ? request.RmaBankAccount : string.Empty;

                var result = await _finPayeeRepository.SqlQueryAsync<DebtorAccountNumberModel>(DatabaseConstants.GetDebtorsByAccountNumber, new SqlParameter("@rmaBankAccount", rmaBankAccount), new SqlParameter("@searchText", searchText));

                return result;
            }
        }

        public async Task<bool> ReallocateCredit(TransactionTransfer transactionTransfer)
        {
            if (transactionTransfer != null)
            {
                var bouncedReversals = new List<Transaction>();
                bouncedReversals.AddRange(transactionTransfer.Transactions.Where(c => c.TransactionTypeLinkId == (int)TransactionActionType.Debit));
                if (bouncedReversals.Count > 0)
                    await _paymentAllocationService.DoBouncedReallocation(bouncedReversals, transactionTransfer.ToDebtorAccount.RolePlayerId, transactionTransfer.ToDebtorAccount.FinPayeNumber, transactionTransfer.FromDebtorAccount.FinPayeNumber);

                var creditNoteReversal = new CreditNoteReversals
                {
                    Transactions = transactionTransfer.Transactions.Where(c => c.Amount > 0 && c.TransactionTypeLinkId == (int)TransactionActionType.Credit).ToList(),
                    RolePlayerId = transactionTransfer.FromDebtorAccount.RolePlayerId,
                    FinPayeeNumber = transactionTransfer.FromDebtorAccount.FinPayeNumber,
                    DebtorAccount = transactionTransfer.FromDebtorAccount,
                    IsPaymentReAllocation = transactionTransfer.Transactions[0].TransactionType == TransactionTypeEnum.Payment,
                    IsCreditNoteReAllocation = transactionTransfer.Transactions[0].TransactionType == TransactionTypeEnum.CreditNote,
                    ReAllocationReceiverFinPayeeNumber = transactionTransfer.ToDebtorAccount.FinPayeNumber
                };
                if (transactionTransfer.InvoiceAllocations != null)
                    creditNoteReversal.InvoiceAllocations = transactionTransfer.InvoiceAllocations;

                foreach (var tran in creditNoteReversal.Transactions)
                    tran.InvoiceId = null;
                try
                {
                    var searchSuspenseDebtor = await GetSuspenseDebtorByRolePlayer(transactionTransfer.ToDebtorAccount.RolePlayerId);

                    if (transactionTransfer.ToDebtorAccount.RolePlayerId > 0 && searchSuspenseDebtor == null)
                    {
                        creditNoteReversal.ReAllocationReceiverFinPayeeNumber = transactionTransfer.ToDebtorAccount.FinPayeNumber;

                        var creditNoteAccount = new CreditNoteAccount
                        {
                            Transactions = transactionTransfer.Transactions.Where(c => c.Amount > 0 && c.TransactionTypeLinkId == (int)TransactionActionType.Credit).ToList(),
                            RolePlayerId = transactionTransfer.ToDebtorAccount.RolePlayerId,
                            FinPayeeNumber = transactionTransfer.ToDebtorAccount.FinPayeNumber,
                            IsPaymentReAllocation = transactionTransfer.Transactions[0].TransactionType == TransactionTypeEnum.Payment,
                            IsCreditNoteReAllocation = transactionTransfer.Transactions[0].TransactionType == TransactionTypeEnum.CreditNote,
                            ReAllocationOriginalFinPayeeNumber = transactionTransfer.FromDebtorAccount.FinPayeNumber,
                            PolicyIds = transactionTransfer.ToPolicyIds
                        };

                        foreach (var tran in creditNoteAccount.Transactions)
                            tran.InvoiceId = null;
                        await _paymentAllocationService.DoReallocation(creditNoteReversal, creditNoteAccount);
                        return await Task.FromResult(true);
                    }
                    else //no ToDebtor //put back in suspense account
                    {
                        var finPayeeDetails = await GetSuspenseFinPayeeDetails(transactionTransfer.ToDebtorAccount.RolePlayerId);

                        if (finPayeeDetails != null)
                        {
                            creditNoteReversal.ReAllocationReceiverFinPayeeNumber = $"{suspenseName}";
                            await _paymentAllocationService.DoDebitReallocation(creditNoteReversal);
                            foreach (var transaction in creditNoteReversal.Transactions.Where(c => c.Amount > 0 && c.TransactionTypeLinkId == (int)TransactionActionType.Credit))
                            {
                                if (transaction.BankStatementEntryId.HasValue)
                                    _ = await _paymentAllocationService.AddPaymentToUnallocatedPaymentUsingBankstatementEntry(transaction.BankStatementEntryId.Value, transaction.ReallocatedAmount, finPayeeDetails.RolePlayerId);
                            }
                        }
                    }
                    await _documentIndexService.UpdateDocumentKeyValues(transactionTransfer.RequestCode, transactionTransfer.FromDebtorAccount.FinPayeNumber);
                    return await Task.FromResult(true);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Credit reallocation error > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                    return await Task.FromResult(false);
                }
            }
            else
                return await Task.FromResult(false);
        }

        private async Task<client_FinPayee> GetSuspenseFinPayeeDetails(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _finPayeeRepository.SingleOrDefaultAsync(f => f.RolePlayerId == rolePlayerId);
            }
        }

        public async Task<List<Statement>> GetDebtorOpenTransactions(DebtorOpenTransactionsRequest request)
        {
            if (!(await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag)))
            {
                Contract.Requires(request != null);
                List<int> policyIds = null;

                //Recommendation would be to incorporate fluent validation
                bool isValidRequest = (request != null && request.PolicyIds != null && request.PolicyIds.Count > 0 || request.RoleplayerId > 0)
&& (request.TransactionStartDate is null || DateTime.TryParse(request.TransactionStartDate.ToString(), out _)
&& (request.TransactionStartDate is null || DateTime.TryParse(request.TransactionEndDate.ToString(), out _)));

                //We need to implement a mechanism for fluent validation on requests
                if (!isValidRequest)
                {
                    return new List<Statement>();
                }

                var parameters = new List<SqlParameter>
                {
                    new SqlParameter
                    {
                        ParameterName = "@roleplayerId",
                        SqlDbType = SqlDbType.Int,
                        Value = request.RoleplayerId
                    }
                };

                var policies = string.Empty;

                var sb = new StringBuilder();

                if (policyIds != null && policyIds.Count > 0)
                {
                    policyIds.ForEach(c => sb.Append($",{c}"));
                    if (sb.Length > 0)
                    {
                        policies = sb.ToString().Substring(1);
                    }
                }

                parameters.Add(new SqlParameter
                {
                    ParameterName = "@policyIds",
                    SqlDbType = SqlDbType.VarChar,
                    Value = string.IsNullOrWhiteSpace(policies) ? (object)DBNull.Value : policies
                });

                parameters.Add(new SqlParameter
                {
                    ParameterName = "@transactionTypeId",
                    SqlDbType = SqlDbType.Int,
                    Value = request.TransactionTypeId
                });

                parameters.Add(new SqlParameter
                {
                    ParameterName = "@outputBalance",
                    SqlDbType = System.Data.SqlDbType.Decimal,
                    Direction = ParameterDirection.Output
                });

                // The assumption here is the standard is both a blend of sql stored procedures and linq.
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var transactions = await _transactionRepository
                        .SqlQueryAsync<Statement>(DatabaseConstants.GetDebtorOpenTransactions, parameters.ToArray());

                    foreach (var transaction in transactions)
                    {
                        var documentDate = transaction.TransactionEffectiveDate.HasValue ? transaction.TransactionEffectiveDate.Value : transaction.TransactionDate;
                        var bankstatementEntryId = transaction.BankstatementEntryId.HasValue ? transaction.BankstatementEntryId.Value : 0;
                        var transactionReasonId = transaction.TransactionReasonId.HasValue ? transaction.TransactionReasonId.Value : 0;

                        var transactionType = (TransactionTypeEnum)transaction.TransactionTypeId;
                        transaction.Description = await GetStatementDescription(transactionType, documentDate, transaction.DocumentNumber, bankstatementEntryId, transactionReasonId);
                        transaction.DocumentDate = documentDate;
                    }

                    if (request.TransactionStartDate != null && request.TransactionEndDate != null)
                    {
                        transactions = transactions
                            .Where(x => x.TransactionDate >= request.TransactionStartDate && x.TransactionDate <= request.TransactionEndDate)
                            .ToList();
                    }

                    return transactions;
                }
            }

            return null;
        }

        private async Task<string> GetStatementDescription(TransactionTypeEnum transactionType, DateTime documentDate, string documentNumber, int bankstatementEntryId, int transactionReasonId)
        {
            var description = string.Empty;
            switch (transactionType)
            {
                case TransactionTypeEnum.Invoice:

                    var invoiceType = (transactionReasonId != 0 && (TransactionReasonEnum)transactionReasonId == TransactionReasonEnum.PremiumAdjustment) ? "Premium Adj" : "Premium";
                    description = $"{invoiceType} - " + documentDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                    documentDate.ToString("yyyy", CultureInfo.InvariantCulture);
                    break;
                case TransactionTypeEnum.CreditNote:
                    description = "Credit Note - " +
                          documentDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                       documentDate.ToString("yyyy", CultureInfo.InvariantCulture);
                    break;
                case TransactionTypeEnum.Payment:

                    description = "Payment - " + documentDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                                  documentDate.ToString("yyyy", CultureInfo.InvariantCulture);
                    break;
                case TransactionTypeEnum.PaymentReversal:
                    var wasDebitOrderReversal = false;
                    if (bankstatementEntryId > 0)
                    {
                        var bankStatementEntry = await _facsStatementRepository.Where(s => s.BankStatementEntryId == bankstatementEntryId).SingleAsync();
                        wasDebitOrderReversal = bankStatementEntry.DocumentType == "DO";
                        if (wasDebitOrderReversal)
                        {
                            description = "Return - " + bankStatementEntry.StatementDate?.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                        bankStatementEntry.StatementDate?.ToString("yyyy", CultureInfo.InvariantCulture);
                        }
                        else
                        {
                            description =
                                 "Payment Reversal - " + bankStatementEntry.StatementDate?.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                                 bankStatementEntry.StatementDate?.ToString("yyyy", CultureInfo.InvariantCulture);
                        }
                    }
                    else
                    {
                        description =
                               "Payment Reversal - " + documentDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                               documentDate.ToString("yyyy", CultureInfo.InvariantCulture);
                    }
                    break;

                default:
                    description = transactionType.GetDescription().SplitCamelCaseText() + " - " +
                           documentDate.ToString("MMMM", CultureInfo.InvariantCulture) + " - " +
                           documentDate.ToString("yyyy", CultureInfo.InvariantCulture);
                    break;
            }

            return await Task.FromResult(description);
        }

        public async Task<decimal> GetHistoryDebtorBalance(int rolePlayerId)
        {
            var balance = 0M;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var currrentPeriod = await _periodService.GetCurrentPeriod();
                var transactions = await _transactionRepository.SqlQueryAsync<Statement>(
                    DatabaseConstants.GetDebtorTransactionHistory,
                    new SqlParameter("@roleplayerId", rolePlayerId),
                    new SqlParameter("@startDate", new DateTime(1900, 1, 1)),
                    new SqlParameter("@endDate", DateTime.Now.EndOfTheDay()));

                balance = transactions.Sum(t => (decimal)t.Balance);
                balance = (balance < 0) ? decimal.Negate(balance) : 0;

                return balance;
            }
        }

        public async Task<bool> ReallocateDebtorBalance(DebtorCreditReallocationRequest request)
        {
            if (request != null)
            {
                try
                {
                    var toFinpayee = await _rolePlayerService.GetFinPayee(request.ToRoleplayerId);
                    var fromFinpayee = await _rolePlayerService.GetFinPayee(request.FromRoleplayerId);
                    var periodId = await GetPeriodId(PeriodStatusEnum.Current);
                    var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var debitTransactionEntry = new Transaction
                        {
                            Amount = request.AmountRealllocated,
                            Reason = "Reallocation From",
                            RolePlayerId = request.FromRoleplayerId,
                            TransactionType = TransactionTypeEnum.DebitReallocation,
                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                            IsReAllocation = true,
                            TransactionDate = postingDate,
                            PeriodId = periodId
                        };

                        var creditTransactionEntry = new Transaction
                        {
                            Amount = request.AmountRealllocated,
                            Reason = "Reallocation To",
                            RolePlayerId = request.ToRoleplayerId,
                            TransactionType = TransactionTypeEnum.CreditReallocation,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            IsReAllocation = true,
                            TransactionDate = postingDate,
                            PeriodId = periodId
                        };

                        _transactionRepository.Create(Mapper.Map<billing_Transaction>(creditTransactionEntry));
                        _transactionRepository.Create(Mapper.Map<billing_Transaction>(debitTransactionEntry));

                        await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                    }
                    await UpdateTransferDocumentsIndexing(request.DocumentUniqueId, request.FromRoleplayerId, request.ToRoleplayerId);
                    var fromNote = new BillingNote
                    {
                        ItemId = request.FromRoleplayerId,
                        ItemType = BillingNoteTypeEnum.ReAllocation.GetDescription(),
                        Text = $"Balance Re-allocation of amount: {request.AmountRealllocated} from {fromFinpayee}"
                    };
                    await _billingService.AddBillingNote(fromNote);

                    var toNote = new BillingNote
                    {
                        ItemId = request.ToRoleplayerId,
                        ItemType = BillingNoteTypeEnum.ReAllocation.GetDescription(),
                        Text = $"Balance Re-allocation of amount: {request.AmountRealllocated} to {toFinpayee}"
                    };
                    await _billingService.AddBillingNote(fromNote);
                    return await Task.FromResult(true);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Failed to reallocated balance - roleplayerid:{request.FromRoleplayerId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                    await Task.FromResult(false);
                }
            }
            return await Task.FromResult(false);
        }

        private async Task UpdateTransferDocumentsIndexing(string documentUniqueId, int fromRoleplayerId, int toRoleplayerId)
        {
            await _documentIndexService.UpdateDocumentKeys(Common.Enums.DocumentSystemNameEnum.BillingManager, "transferId", documentUniqueId, "transferId", $"{fromRoleplayerId.ToString()}_{toRoleplayerId.ToString()}");
        }

        public async Task<decimal> GetReclassificationBalanceByPolicy(int roleplayerId, int policyId)
        {
            try
            {
                var claimsAmountTotal = 0m;
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var results = await _invoiceRepository.SqlQueryAsync<decimal>(DatabaseConstants.GetPaidClaimAmountsForPolicy,
                        new SqlParameter("@policyId", policyId));
                    if (results != null && results.Count > 0)
                        claimsAmountTotal = results[0];
                }

                var creditBalance = await _billingService.GetDebtorNetBalance(roleplayerId);
                creditBalance *= (-1);
                return creditBalance - claimsAmountTotal;
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        public async Task<decimal> GetCancellationBalanceByPolicy(int roleplayerId, int policyId)
        {
            var productBalanceRequest = new DebtorProductBalanceRequest { RoleplayerId = roleplayerId, PolicyIds = new List<int> { policyId } };
            var productBalances = await _billingService.GetProductBalancesByPolicyIds(productBalanceRequest);

            if (productBalances != null)
                return (decimal)productBalances.FirstOrDefault()?.Balance;
            else
                return 0;
        }

        public async Task<List<PremiumListingTransaction>> GetPremiumListingTransactionsByPaymentFileId(int paymentFileId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paymentIds = new List<int>();
                paymentIds = await _premiumTransactionPaymentFileRepository.Where(p => p.PremiumTransactionPaymentFileId == paymentFileId)
                   .Select(f => f.PremiumListingTransactionId).ToListAsync();
                if (paymentIds != null && paymentIds.Count > 0)
                {
                    var results = await
                    _premiumListingTransactionsRepository
                        .Where(s => paymentIds.Contains(s.Id))
                        .ToListAsync();

                    return results == null
                        ? new List<PremiumListingTransaction>()
                        : Mapper.Map<List<PremiumListingTransaction>>(results);
                }
                return new List<PremiumListingTransaction>();
            }
        }

        public async Task<decimal> GetTotalAmountPaidToPremiumListingByTransactionId(int transactionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            var invoiceStatusList = new List<InvoiceStatusEnum> { InvoiceStatusEnum.Paid, InvoiceStatusEnum.Partially };

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paymentFiles = await _premiumListingPaymentFileRepository.Where(c => c.LinkedTransactionId == transactionId).ToListAsync();

                if (paymentFiles.Count > 0)
                {
                    var results = 0m;
                    foreach (var paymentFile in paymentFiles)
                    {
                        var fileIdentifier = paymentFile.FileIdentifier;
                        var validatedFile = await _premiumPaymentFileValidationRepository.FirstOrDefaultAsync(f => f.FileIdentifier == fileIdentifier);
                        if (validatedFile != null)
                        {
                            var payments = await _premiumTransactionPaymentFileRepository.Where(p => p.PaymentFileId == validatedFile.FileId).ToArrayAsync();
                            results += payments.Sum(p => p.Amount);
                        }
                    }
                    return results;
                }
                else
                    return await Task.FromResult(0);
            }
        }

        public async Task<List<PremiumListingTransaction>> GetPremiumListingTransactionsByPaymentDate(List<int> childpolicyIds, DateTime paymentDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _premiumListingTransactionsRepository.Where(x => childpolicyIds.Contains(x.PolicyId.Value) && x.PaymentDate == paymentDate).ToListAsync();


                return results == null
                    ? new List<PremiumListingTransaction>()
                    : Mapper.Map<List<PremiumListingTransaction>>(results);
            }
        }

        public async Task<List<PremiumListingTransaction>> GetPremiumListingTransactionsByInvoiceDate(List<int> childpolicyIds, DateTime invoiceDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var startOfTheMonth = DateTimeHelper.StartOfTheMonth(invoiceDate);
                var endOfTheMonth = DateTimeHelper.EndOfTheMonth(invoiceDate);

                var results = await _premiumListingTransactionsRepository.Where(x => childpolicyIds.Contains(x.PolicyId.Value) && x.InvoiceDate >= startOfTheMonth
                                             && x.InvoiceDate <= endOfTheMonth).ToListAsync();

                return results == null
                    ? new List<PremiumListingTransaction>()
                    : Mapper.Map<List<PremiumListingTransaction>>(results);
            }
        }

        public async Task<List<PaymentAllocationRecord>> AllocatePaymentsToPremiumListingTransactions(Guid fileIdentifier, int transactionId, string modifiedBy, PaymentAllocationScheme paymentAllocationScheme)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            var recordsProcessed = 0;
            var paymentAllocationRecords = paymentAllocationScheme?.PaymentAllocationRecords;


            using (var scope = _dbContextScopeFactory.Create())
            {
                var premiumListingPayments = await _premiumListingPaymentRepository.Where(x => x.FileIdentifier == fileIdentifier).ToListAsync();
                var premiumListingFile = await _premiumListingPaymentFileRepository.FirstOrDefaultAsync(x => x.FileIdentifier == fileIdentifier && x.LinkedTransactionId.Value == transactionId);

                if (premiumListingPayments.Count == 0)
                {
                    return paymentAllocationRecords;
                }

                if (premiumListingFile == null)
                {
                    return paymentAllocationRecords;
                }

                var childPolicyNumers = premiumListingPayments.Select(x => x.MemberPolicyNumber).ToList();
                var childPolicies = await _policyService.GetPoliciesByPolicyNumbers(childPolicyNumers);

                if (childPolicies.Count == 0)
                {
                    return paymentAllocationRecords;
                }

                foreach (var premiumListingPayment in premiumListingPayments)
                {
                    var childPolicy = childPolicies.FirstOrDefault(x => x.PolicyNumber == premiumListingPayment.MemberPolicyNumber);
                    var invoiceDateArr = premiumListingPayment.PaymentDate.Split('-').ToList();

                    if (invoiceDateArr.Count != 3)
                    {
                        continue;
                    }

                    var invoiceDate = new DateTime(int.Parse(invoiceDateArr[0]), int.Parse(invoiceDateArr[1]), int.Parse(invoiceDateArr[2]));
                    var startOfTheMonth = DateTimeHelper.StartOfTheMonth(invoiceDate);
                    var endOfTheMonth = DateTimeHelper.EndOfTheMonth(invoiceDate);

                    var listingTransaction = await _premiumListingTransactionsRepository.FirstOrDefaultAsync(x => childPolicy.PolicyId == x.PolicyId.Value && x.InvoiceDate >= startOfTheMonth
                                                 && x.InvoiceDate <= endOfTheMonth);

                    if (listingTransaction == null)
                    {
                        continue;
                    }

                    var payAmount = double.Parse(premiumListingPayment.PaymentAmount.Replace(".", ","));

                    if (payAmount > 0)
                    {
                        var paymentAllocationRecord = paymentAllocationRecords.FirstOrDefault(x => x.PolicyNumber == premiumListingPayment.MemberPolicyNumber
                                                        && x.PolicyMonth == invoiceDate && decimal.ToDouble(x.Amount) == payAmount);

                        if (paymentAllocationRecord == null)
                        {
                            continue;
                        }

                        var invoiceAmount = listingTransaction.InvoiceAmount;
                        var previousPaymentAmount = listingTransaction.PaymentAmount;

                        var outstandingAmount = invoiceAmount - (previousPaymentAmount + payAmount);

                        if (outstandingAmount > 0)
                        {
                            listingTransaction.PaymentAmount += payAmount;
                            paymentAllocationRecord.AmountAllocated = payAmount;
                            listingTransaction.ModifiedDate = DateTimeHelper.SaNow;
                            listingTransaction.ModifiedBy = modifiedBy;
                            listingTransaction.PaymentDate = paymentAllocationScheme.PaymentDate;
                            listingTransaction.InvoiceStatus = listingTransaction.PaymentAmount >= listingTransaction.InvoiceAmount ? InvoiceStatusEnum.Paid : InvoiceStatusEnum.Partially;

                        }
                        else
                        {
                            var remainingInvoiceBalance = invoiceAmount - previousPaymentAmount;

                            if (remainingInvoiceBalance > 0)
                            {
                                listingTransaction.PaymentAmount += remainingInvoiceBalance;
                                paymentAllocationRecord.AmountAllocated = remainingInvoiceBalance;
                                listingTransaction.ModifiedDate = DateTimeHelper.SaNow;
                                listingTransaction.ModifiedBy = modifiedBy;
                                listingTransaction.PaymentDate = paymentAllocationScheme.PaymentDate;
                                listingTransaction.InvoiceStatus = listingTransaction.PaymentAmount >= listingTransaction.InvoiceAmount ? InvoiceStatusEnum.Paid : InvoiceStatusEnum.Partially;
                            }
                        }

                        paymentAllocationRecord.PaymentStatus = listingTransaction.InvoiceStatus.DisplayAttributeValue();
                        paymentAllocationRecord.InvoiceDate = listingTransaction.InvoiceDate;
                        paymentAllocationRecord.InvoiceAmount = listingTransaction.InvoiceAmount;
                        paymentAllocationRecord.PaymentDate = paymentAllocationScheme.PaymentDate;
                        recordsProcessed++;
                    }

                }

                premiumListingFile.FileProcessingStatusId = recordsProcessed > 0 ? (int)UploadedFileProcessingStatusEnum.Success : (int)UploadedFileProcessingStatusEnum.Failed;
                premiumListingFile.ModifiedBy = modifiedBy;
                premiumListingFile.ModifiedDate = DateTimeHelper.SaNow;

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return paymentAllocationRecords;

        }

        public async Task<int> CreateRefund(Refund refund)
        {
            Contract.Requires(refund != null);
            try
            {
                int headerId = 0;
                if (refund.RefundRmaBankAccountAmounts != null)
                {
                    var industryClass = IndustryClassEnum.Individual;
                    var idNumber = string.Empty;
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(refund.RolePlayerId);
                    var payee = rolePlayer.DisplayName;

                    var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(refund.RolePlayerId);

                    var refundReason = string.Empty;
                    refundReason = refund.Trigger.GetDescription().SplitCamelCaseText();

                    int companyNumber = 0;
                    int branchNumber = 0;

                    if (refund.Trigger == RefundTypeEnum.PolicyInception)
                        refundReason = RefundReasonEnum.PolicyStartDateChange.GetDescription().SplitCamelCaseText();


                    var refundReference = await CreateRefundReferenceNumber();
                    var periodId = await GetPeriodId(refund.PeriodStatus);
                    headerId = await CreateRefundHeader(refundReference, refund.RefundAmount, refund.RolePlayerId, refundReason, periodId, RefundStatusEnum.RefundInprogressWaitingFinanceApproval);
                    var groups = refund?.RefundRmaBankAccountAmounts.GroupBy(c => c.RmaBankAccountId);

                    foreach (var group in groups)
                    {
                        var policy = new Policy();
                        if (policies != null && policies.Count > 0)
                        {
                            policy = policies.FirstOrDefault();
                        }

                        var senderAccount = group.FirstOrDefault()?.AccountNumber;

                        bool? doClaimRecovery = null;
                        decimal claimRecoveryLatestBalance = 0;

                        var debtor = await _rolePlayerService.GetFinPayeeByRolePlayerId(rolePlayer.RolePlayerId);

                        doClaimRecovery = (refund.Trigger == RefundTypeEnum.PolicyCancellation ||
                            refund.Trigger == RefundTypeEnum.PolicyReclassification);

                        //get latest claim Recovery Balance to avoid over recovery.. 
                        if (doClaimRecovery == true)
                        {
                            claimRecoveryLatestBalance = await GetDebtorClaimRecoveriesBalance(refund.RolePlayerId);
                        }

                        var bankAccountNumber = string.Empty;
                        var companyBranchInfo = new billing_CompanyBranchBankAccount();
                        using (_dbContextScopeFactory.CreateReadOnly())
                        {
                            companyBranchInfo = await _companyBranchBankAccountRepository.FirstOrDefaultAsync(c => c.IndustryClass == industryClass
                                                      && c.BankAccountId == group.Key);
                        }


                        if (companyBranchInfo != null)
                        {
                            companyNumber = companyBranchInfo.CompanyNumber;
                            branchNumber = companyBranchInfo.BranchNumber;
                        }

                        var fullyAllocatedInvoices = new List<Invoice>();
                        var partiallyAllocatedInvoices = new List<Invoice>();
                        var allInvoicesToBeProcessed = new List<Invoice>();


                        if (refund.Trigger == RefundTypeEnum.PolicyCancellation || refund.Trigger == RefundTypeEnum.PolicyInception)
                        {
                            switch (refund.Trigger)
                            {
                                case RefundTypeEnum.PolicyCancellation:
                                    if (policy != null && policy.PolicyId > 0)
                                    {
                                        var activityDate = new DateTime(1900, 1, 1);

                                        if (policy.ExpiryDate != null)
                                            activityDate = (DateTime)policy.ExpiryDate;
                                        else if (policy.CancellationDate != null)
                                            activityDate = (DateTime)policy.CancellationDate;

                                        var clientInvoices = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);
                                        if (policy.PaymentFrequency == PaymentFrequencyEnum.Monthly)
                                        {
                                            if (!isStillWithinCoolingOffPeriod(activityDate.StartOfNextDay(), (DateTime)(policy.PolicyInceptionDate.Value).StartOfTheDay()))
                                            {//backdated refund
                                                allInvoicesToBeProcessed = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);
                                            }
                                            else
                                            {//refund for single invoice raised
                                                if (clientInvoices.Count > 0)
                                                    allInvoicesToBeProcessed.Add(clientInvoices.OrderBy(c => c.InvoiceId).FirstOrDefault());
                                            }
                                        }
                                        else if (policy.PaymentFrequency == PaymentFrequencyEnum.Annually)
                                        {
                                            if (clientInvoices.Count > 0)
                                                allInvoicesToBeProcessed.Add(clientInvoices.OrderBy(c => c.InvoiceId).LastOrDefault());
                                        }
                                    }
                                    break;

                                case RefundTypeEnum.PolicyInception:
                                    if (policy != null && policy.PolicyId > 0)
                                    {
                                        var activityDate = policy.PolicyInceptionDate;
                                        var invoices = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);
                                        if (invoices.Count > 0)
                                            allInvoicesToBeProcessed.Add(invoices.OrderBy(c => c.InvoiceId).FirstOrDefault());
                                    }
                                    break;
                            }
                            //get paid invoices to perform commission clawbacks on
                            if (allInvoicesToBeProcessed.Count > 0)
                            {
                                foreach (var invoice in allInvoicesToBeProcessed)
                                {
                                    if (invoice.Balance == 0)
                                    {
                                        fullyAllocatedInvoices.Add(invoice);
                                    }
                                    else if (invoice.Balance > 0 && invoice.Balance != invoice.TotalInvoiceAmount)
                                    {
                                        partiallyAllocatedInvoices.Add(invoice);
                                    }
                                }
                            }


                            var reason = string.Empty;
                            if (refund.Trigger == RefundTypeEnum.PolicyCancellation)
                                reason = RefundTypeEnum.PolicyCancellation.GetDescription().SplitCamelCaseText();

                            var refundHeaderAmount = doClaimRecovery == true ? (refund.RefundAmount - claimRecoveryLatestBalance) : refund.RefundAmount;

                            if (refundHeaderAmount > 0)
                            {
                                if (refundHeaderAmount != refund.RefundAmount)
                                {
                                    await _billingService.UpdateRefundHeader(new RefundHeader { HeaderTotalAmount = refundHeaderAmount });
                                }
                                await CreateRefundHeaderDetail(headerId, null, refundHeaderAmount, senderAccount, bankAccountNumber, policy.PolicyId,
                                    policy.ProductOption.ProductId, policy.ProductCategoryType, companyNumber, branchNumber);

                                if (partiallyAllocatedInvoices.Count > 0)
                                    await _paymentAllocationService.PerformCommissionClawbacks(partiallyAllocatedInvoices);

                                if (fullyAllocatedInvoices.Count > 0)
                                    await _paymentAllocationService.PerformCommissionClawbacks(fullyAllocatedInvoices);
                            }

                        }
                        else if (refund.Trigger == RefundTypeEnum.Overpayment || refund.Trigger == RefundTypeEnum.Transactional || refund.Trigger == RefundTypeEnum.TermsOverpayment)
                        {
                            var reason = string.Empty;
                            if (refund.Trigger == RefundTypeEnum.Overpayment)
                                reason = RefundTypeEnum.Overpayment.GetDescription().SplitCamelCaseText();
                            else if (refund.Trigger == RefundTypeEnum.TermsOverpayment)
                                reason = RefundTypeEnum.TermsOverpayment.GetDescription().SplitCamelCaseText();

                            var refundHeaderAmount = doClaimRecovery == true ? (refund.RefundAmount - claimRecoveryLatestBalance) : refund.RefundAmount;

                            if (refundHeaderAmount > 0)
                            {
                                if (refundHeaderAmount != refund.RefundAmount)
                                {
                                    await _billingService.UpdateRefundHeader(new RefundHeader { HeaderTotalAmount = refundHeaderAmount });
                                }

                                if (refund.Trigger == RefundTypeEnum.TermsOverpayment)
                                {
                                    //Create Terms Overpayment  Refund HeaderDetails
                                    var fullRefundAmountRemaining = refundHeaderAmount;
                                    foreach (var refundBankAccounAmount in group)
                                    {
                                        decimal headerDetailAmount = 0;
                                        if (fullRefundAmountRemaining <= 0) { continue; }

                                        if (fullRefundAmountRemaining >= refundBankAccounAmount.Amount)
                                        {
                                            headerDetailAmount = refundBankAccounAmount.Amount;
                                        }
                                        else
                                        {
                                            headerDetailAmount = fullRefundAmountRemaining;
                                        }

                                        await CreateRefundHeaderDetail(headerId, refundBankAccounAmount.TransactionId, headerDetailAmount, senderAccount, bankAccountNumber, policy.PolicyId,
                                    policy.ProductOption.ProductId, policy.ProductCategoryType, companyNumber, branchNumber);

                                        fullRefundAmountRemaining -= headerDetailAmount;
                                    }
                                }
                                else
                                {
                                    await CreateRefundHeaderDetail(headerId, null, refundHeaderAmount, senderAccount, bankAccountNumber, policy.PolicyId,
                                    policy.ProductOption.ProductId, policy.ProductCategoryType, companyNumber, branchNumber);
                                }
                            }

                        }
                        else if (refund.Trigger == RefundTypeEnum.CreditBalance
                            || refund.Trigger == RefundTypeEnum.PolicyReclassification)
                        {
                            var remainingBalance = refund.RefundAmount;

                            var reason = string.Empty;
                            if (refund.Trigger == RefundTypeEnum.PolicyReclassification)
                                reason = RefundTypeEnum.PolicyReclassification.GetDescription().SplitCamelCaseText();

                            var refundHeaderAmount = doClaimRecovery == true ? (refund.RefundAmount - claimRecoveryLatestBalance) : refund.RefundAmount;

                            if (refundHeaderAmount > 0)
                            {
                                if (refundHeaderAmount != refund.RefundAmount)
                                {
                                    await _billingService.UpdateRefundHeader(new RefundHeader { HeaderTotalAmount = refundHeaderAmount });
                                }
                                await CreateRefundHeaderDetail(headerId, null, refundHeaderAmount, senderAccount, bankAccountNumber, policy.PolicyId,
                                    policy.ProductOption.ProductId, policy.ProductCategoryType, companyNumber, branchNumber);
                            }
                        }
                        else if (refund.Trigger == RefundTypeEnum.ClaimPayout)
                        {
                            var creditTransactions = await GetCreditTransactionsWithBalances(refund.RolePlayerId);

                            if (creditTransactions.Count > 0)
                            {
                                foreach (var tran in creditTransactions)
                                {
                                    if (!tran.Balance.HasValue)
                                        continue;

                                    var detailAmount = Math.Abs(tran.Balance.Value);
                                    await CreateRefundHeaderDetail(headerId, tran.TransactionId, detailAmount, senderAccount, bankAccountNumber, policy.PolicyId,
                                    policy.ProductOption.ProductId, policy.ProductCategoryType, companyNumber, branchNumber);
                                    var transaction = new Transaction
                                    {
                                        Reason = refund.Note.Text,
                                        TransactionType = TransactionTypeEnum.Refund,
                                        RmaReference = await CreateRefundReferenceNumber(),
                                        TransactionDate = DateTimeHelper.SaNow,
                                        Amount = detailAmount,
                                        TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                        RolePlayerId = refund.RolePlayerId,
                                        LinkedTransactionId = tran.TransactionId
                                    };
                                    await AddTransaction(transaction);
                                }
                            }
                        }
                    }
                }
                return headerId;
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when creating refund - Error Message {ex.Message}");
                return await Task.FromResult(0);
            }
        }

        public bool isStillWithinCoolingOffPeriod(DateTime cancellationDate, DateTime inceptionDate)
        {
            var result = false;
            System.TimeSpan diff = cancellationDate.Subtract(inceptionDate);

            result = (diff.Days <= 31) ? true : false;
            return result;
        }

        private async Task<int> GetPeriodIdBasedOnOpenPeriod()
        {
            var latestPeriod = await _periodService.GetLatestPeriod();
            if (latestPeriod != null)
                return latestPeriod.Id;
            else
                return await GetPeriodId(PeriodStatusEnum.Current);
        }

        public async Task<List<DebtorProductCategoryBalance>> GetDebtorReclassficationRefundBreakDown(int roleplayerId)
        {
            var results = new List<DebtorProductCategoryBalance>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                results = await _transactionRepository.SqlQueryAsync<DebtorProductCategoryBalance>(
               DatabaseConstants.GetDebtorReclassficationRefundBreakDown,
               new SqlParameter("@roleplayerId", roleplayerId));
                return results;
            }
        }

        public async Task<List<DebtorProductCategoryBalance>> GetDebtorCancellationRefundBreakDown(int roleplayerId)
        {
            var results = new List<DebtorProductCategoryBalance>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                results = await _transactionRepository.SqlQueryAsync<DebtorProductCategoryBalance>(
               DatabaseConstants.GetDebtorCancellationRefundBreakDown,
               new SqlParameter("@roleplayerId", roleplayerId));
                return results;
            }
        }

        public async Task<decimal> GetDebtorClaimRecoveriesBalance(int rolePlayerId)
        {
            return await _transactionCreatorService.GetDebtorForPayOutBalanceByRolePlayerId(rolePlayerId);
        }

        public async Task<List<Transaction>> GetPaymentTransactionsByRoleplayerIdBankStatementReference(int roleplayerId, string bankStatementReference)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await (from transaction in _transactionRepository.Where(t => t.RolePlayerId == roleplayerId && t.TransactionType == TransactionTypeEnum.Payment && t.InvoiceId != null)
                                      join statement in _facsStatementRepository.Where(s => s.UserReference.Contains(bankStatementReference))
                                      on transaction.BankStatementEntryId equals statement.BankStatementEntryId

                                      select transaction).ToListAsync();

                var transactions = Mapper.Map<List<Transaction>>(entities);

                foreach (var tran in transactions)
                {
                    var balance = await GetTransactionBalance(tran);
                    tran.Balance = balance;
                    tran.OriginalUnallocatedAmount = balance;
                }

                return transactions.ToList();
            }
        }

        public async Task<List<Transaction>> GetBouncedTransactionsForTransfer(InterDebtorTransactionRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);

            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var periodIds = string.Empty;
                if (request.Period == PeriodStatusEnum.Current)
                {
                    var latestPeriod = await _periodService.GetLatestPeriod();
                    if (latestPeriod != null)
                    {
                        var currentPeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                        periodIds = $"{currentPeriodId},{latestPeriod.Id}";
                    }
                    else
                    {
                        var currentPeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                        periodIds = $"{currentPeriodId}";
                    }
                }
                else if (request.Period == PeriodStatusEnum.History)
                {
                    periodIds = $"0";
                }

                var results = await _transactionRepository.SqlQueryAsync<Transaction>(
                    DatabaseConstants.GetBouncedTransactionsForTransfer,
                    new SqlParameter("@roleplayerId", request.RoleplayerId)
                    , new SqlParameter("@bankaccount", request.RmaBankAccount)
                    , new SqlParameter("@period", periodIds));
                return results;
            }
        }

        public async Task<List<Transaction>> GetPremiumAllocatedTransactionsByRoleplayer(int roleplayerId, TransactionTypeEnum transactionType, DateTime startDate, DateTime endDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(ViewPayments);
            var _startDate = startDate.StartOfTheDay();
            var _endDate = endDate.EndOfTheDay();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.Where(t => t.RolePlayerId == roleplayerId && t.IsDeleted != true && t.TransactionType == transactionType && t.TransactionDate >= _startDate && t.TransactionDate <= _endDate).ToListAsync();
                var transactionIds = new List<int>();
                transactionIds.AddRange(entities.Select(t => t.TransactionId).ToList());

                var allocations = await _invoiceAllocationRepository.Where(i => transactionIds.Contains(i.TransactionId)).ToListAsync();
                var allocatedTransactionIds = allocations.Select(c => c.TransactionId).ToList();
                var alloctedTransactions = entities.Where(c => allocatedTransactionIds.Contains(c.TransactionId));

                var transactions = Mapper.Map<List<Transaction>>(alloctedTransactions);
                var transactionsToRemoveIds = new List<int>();

                foreach (var tran in transactions)
                {
                    var totalPaid = await GetTotalAmountPaidToPremiumListingByTransactionId(tran.TransactionId);
                    tran.Balance = tran.Amount - totalPaid;
                    tran.OriginalUnallocatedAmount = (decimal)tran.Balance;
                }
                return transactions.ToList();
            }
        }

        private async Task<bool> PostItemToGeneralLedger(int roleplayerId, int itemId, decimal amount, int bankAccountId, string incomeStatementChart, string balanceSheetChart, bool isAllocated, IndustryClassEnum industryClass, int? contraTransactionId)
        {
            await _transactionCreatorService.PostItemToGeneralLedger(roleplayerId, itemId, amount, bankAccountId, incomeStatementChart, balanceSheetChart, isAllocated, industryClass, null);
            return await Task.FromResult(true);
        }

        private async Task<billing_SuspenseDebtorBankMapping> GetSuspenseAccountDebtorDetailsByBankAccount(string bankAccountNumber)
        {
            var bankAccount = await _bankAccountService.GetBankAccountByStringAccountNumber(bankAccountNumber);
            var suspenseAccountDebtor = await _suspenseDebtorBankMappingRepository.FirstOrDefaultAsync(c => c.BankAccountId == bankAccount.Id);
            return suspenseAccountDebtor;
        }

        public async Task<List<int>> AddAdjustmentCreditNote(CreditNoteAccount creditNoteAccount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            Contract.Requires(creditNoteAccount != null);

            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
            var reference = await _invoiceService.CreateCreditNoteReferenceNumber();

            var newTransactionIdentifiers = new List<int>();

            foreach (var transaction in creditNoteAccount?.Transactions)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    transaction.TransactionType = transaction.TransactionType;
                    var mappedTransaction = Mapper.Map<billing_Transaction>(transaction);

                    mappedTransaction.Reason = transaction.Reason;
                    mappedTransaction.BankReference = transaction.BankReference;
                    mappedTransaction.RmaReference = reference;
                    mappedTransaction.TransactionDate = transaction.TransactionDate;
                    mappedTransaction.PeriodId = await GetPeriodId((PeriodStatusEnum)transaction.PeriodId);
                    mappedTransaction.Invoice = null;
                    mappedTransaction.InvoiceId = transaction.InvoiceId;
                    mappedTransaction.TransactionTypeLinkId = 2;
                    mappedTransaction.RolePlayerId = creditNoteAccount == null ? 0 : creditNoteAccount.RolePlayerId;

                    _transactionRepository.Create(mappedTransaction);

                    await scope.SaveChangesAsync();

                    newTransactionIdentifiers.Add(mappedTransaction.TransactionId);
                }
            }

            return newTransactionIdentifiers;
        }

        public async Task<List<Transaction>> GetTransactionsByDateAndPolicyId(int policyId, DateTime date)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<Transaction>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactions = await (from transaction in _transactionRepository
                                          where transaction.TransactionType == TransactionTypeEnum.Invoice
                                           && transaction.TransactionReason != TransactionReasonEnum.PremiumAdjustment
                                           && transaction.TransactionDate.Month == date.Month
                                           && transaction.TransactionDate.Year == date.Year
                                           && transaction.Invoice.PolicyId == policyId
                                          select transaction).ToListAsync();

                if (transactions.Count > 0)
                {
                    results = Mapper.Map<List<Transaction>>(transactions);
                }
            }

            return results;
        }

        private async Task<List<billing_SuspenseDebtorBankMapping>> GetSuspenseDebtorByRolePlayer(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _suspenseDebtorBankMappingRepository
                  .Where(d => d.RoleplayerId == rolePlayerId).ToListAsync();
            }
        }

        public async Task<bool> RealeaseRefundForPayment(Refund refund)
        {
            if (refund != null)
            {
                if (refund.RefundRmaBankAccountAmounts != null)
                {
                    var header = new billing_RefundHeader();
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        header = await _refundHeaderRepository.FirstOrDefaultAsync(r => r.RefundHeaderId == refund.RefundHeaderId);
                    }
                    var clientType = ClientTypeEnum.Individual;
                    var industryClass = IndustryClassEnum.Individual;
                    var idNumber = string.Empty;
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(refund.RolePlayerId);

                    var payee = rolePlayer.DisplayName;
                    if (rolePlayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Company)
                    {
                        clientType = ClientTypeEnum.Company;

                        if (rolePlayer.Company.CompanyRegNo != null && rolePlayer.Company.CompanyIdType == CompanyIdTypeEnum.Group)
                        {
                            clientType = ClientTypeEnum.GroupIndividual;
                        }
                        if (rolePlayer.Company.CompanyRegNo != null)
                        {
                            idNumber = rolePlayer.Company.CompanyRegNo;
                        }
                        industryClass = rolePlayer.Company.IndustryClass.Value;
                    }
                    else
                    {
                        if (rolePlayer.Person != null)
                        {
                            idNumber = rolePlayer.Person?.IdNumber;
                        }
                    }
                    var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(refund.RolePlayerId);

                    var groups = refund?.RefundRmaBankAccountAmounts.GroupBy(c => c.RmaBankAccountId);

                    foreach (var group in groups)
                    {
                        var rmaAccountNumber = group.FirstOrDefault()?.AccountNumber;
                        var headerDetail = new billing_RefundHeaderDetail();
                        using (_dbContextScopeFactory.CreateReadOnly())
                        {
                            headerDetail = await _refundHeaderDetailRepository.FirstOrDefaultAsync(h => h.FromAccountNumber == rmaAccountNumber);
                        }
                        var amount = group.FirstOrDefault()?.Amount;
                        var policy = new Policy();
                        if (headerDetail != null)
                        {
                            if (headerDetail.PolicyId.HasValue)
                            {
                                policy = await _policyService.GetPolicy(headerDetail.PolicyId.Value);
                            }
                        }

                        if (refund != null)
                        {
                            var bankingDetails = await _rolePlayerService.GetBankDetailByBankAccountId(refund.RolePlayerBankingId);

                            if (bankingDetails != null)
                            {
                                var clientEmail = !string.IsNullOrEmpty(refund.GroupEmail) ? refund.GroupEmail : rolePlayer.EmailAddress;
                                var branchId = bankingDetails.BankBranchId;
                                var bankAccountNumber = bankingDetails.AccountNumber;

                                var bankBranch = await _bankBranchService.GetBankBranch(branchId);

                                var payment = new Payment()
                                {
                                    Company = headerDetail.CompanyNumber.ToString(),
                                    Branch = headerDetail.BranchNumber.ToString(),
                                    SenderAccountNo = headerDetail.FromAccountNumber,
                                    SubmissionCount = 1,
                                    MaxSubmissionCount = 10,
                                    PaymentType = PaymentTypeEnum.Refund,
                                    PaymentStatus = PaymentStatusEnum.Pending
                                };

                                if (headerDetail.ProductId.HasValue)
                                {
                                    var product = await _productService.GetProduct(headerDetail.ProductId.Value);
                                    payment.Product = product.Code;
                                }
                                if (policy != null)
                                    payment.PolicyReference = policy.PolicyNumber;

                                payment.Amount = (decimal)amount;
                                payment.AccountNo = bankAccountNumber;
                                payment.Bank = bankBranch.Bank.Name;
                                payment.ClientType = clientType;
                                payment.BankAccountType = bankingDetails.BankAccountType;
                                payment.BankBranch = bankBranch.Bank.UniversalBranchCode;
                                payment.IdNumber = idNumber;
                                payment.EmailAddress = clientEmail;
                                payment.Payee = payee;
                                payment.PayeeId = refund.RolePlayerId;
                                if (policy != null && policy.PolicyId > 0)
                                    payment.PolicyId = policy.PolicyId;
                                payment.IsDebtorCheck = false;
                                payment.IsForex = false;
                                payment.IsReversed = false;
                                payment.DoClaimRecovery = (refund.Trigger == RefundTypeEnum.PolicyCancellation ||
                                refund.Trigger == RefundTypeEnum.PolicyReclassification);
                                payment.RefundHeaderId = header.RefundHeaderId;
                                payment.ClaimInvoiceId = null;
                                payment.MedicalInvoiceId = null;

                                await _paymentCreatorService.CreatePaymentWithAllocations(payment);
                            }
                        }
                    }
                    await _billingService.UpdateRefundHeader(new RefundHeader
                    {
                        RefundHeaderId = (int)refund.RefundHeaderId.Value,
                        RefundStatus = RefundStatusEnum.RefundSubmittedForPayment
                    });
                }
            }
            return await Task.FromResult(true);
        }

        public async Task<PagedRequestResult<Transaction>> GetPagedTransactions(TransactionSearchRequest transactionSearchRequest)
        {
            Contract.Requires(transactionSearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _transactionRepository.AsQueryable();

                if (transactionSearchRequest.TransactionType.HasValue)
                {
                    var transactionType = transactionSearchRequest.TransactionType.Value;
                    query = query.Where(r => r.TransactionType == transactionType);
                }

                if (transactionSearchRequest.StartDate.HasValue)
                {
                    var startDate = transactionSearchRequest.StartDate.Value;
                    query = query.Where(r => r.TransactionDate >= startDate);
                }

                if (transactionSearchRequest.EndDate.HasValue)
                {
                    var endDate = transactionSearchRequest.EndDate.Value;
                    query = query.Where(r => r.TransactionDate <= endDate);
                }

                if (transactionSearchRequest.RolePlayerId.HasValue)
                {
                    var rolePlayerId = transactionSearchRequest.RolePlayerId.Value;
                    query = query.Where(r => r.RolePlayerId == rolePlayerId);
                }

                if (!string.IsNullOrEmpty(transactionSearchRequest.PagedRequest.SearchCriteria))
                {
                    var filter = transactionSearchRequest.PagedRequest.SearchCriteria;
                    query = query.Where(r => r.BankReference.Contains(filter));
                }

                var transactions = await query.ToPagedResult(transactionSearchRequest.PagedRequest);

                var data = Mapper.Map<List<Transaction>>(transactions.Data);

                return new PagedRequestResult<Transaction>
                {
                    Page = transactionSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(transactions.RowCount / (double)transactionSearchRequest.PagedRequest.PageSize),
                    RowCount = transactions.RowCount,
                    PageSize = transactionSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }
    }
}
