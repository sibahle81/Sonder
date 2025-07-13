using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities.Payments;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.Billing.Mappers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Entities.Commissions;
using RMA.Service.FinCare.Contracts.Interfaces.Commissions;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;
using TinyCsvParser.Mapping;

using FinPayee = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.FinPayee;
using Transaction = RMA.Service.Billing.Contracts.Entities.Transaction;
using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;
using System.IdentityModel.Metadata;
using System.Data;
using RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation;

namespace RMA.Service.Billing.Services
{
    public class PaymentAllocationFacade : RemotingStatelessService, IPaymentAllocationService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const char commaDelimiter = ',';

        public const string BulkAllocationsQueueName = "mcc.fin.bulkpaymentallocations";
        private string fincareportServerUrl;


        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_UnallocatedPayment> _unallocatedPaymentRepository;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly IInvoiceService _invoiceService;
        private readonly ICommissionService _commissionService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<finance_BankStatementEntry> _facsStatementRepository;
        private readonly IRepository<billing_InvoiceAllocation> _invoiceAllocationRepository;
        private readonly IClaimRecoveryInvoiceService _claimRecoveryInvoiceService;
        private readonly IRepository<billing_ClaimRecoveryInvoice> _claimRecoveryInvoiceRepository;
        private readonly IPeriodService _periodService;
        private readonly IRepository<billing_RefundHeader> _refundHeaderRepository;
        private readonly IRepository<billing_RefundHeaderDetail> _refundHeaderDetailRepository;
        private readonly IRepository<billing_DebitTransactionAllocation> _debitAllocationRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<Load_BulkAllocationFile> _bulkAllocationFileRepository;
        private readonly IRepository<Load_BulkManualAllocation> _bulkManualAllocationRepository;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IRepository<billing_TermArrangement> _termArrangementRepository;
        private readonly IRepository<billing_TermArrangementSchedule> _termArrangementScheduleRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly ISendEmailService _sendEmailService;
        private WebHeaderCollection _headerCollection;
        private string fromAddress;
        private readonly IDocumentNumberService _documentNumberService;
        private readonly ILetterOfGoodStandingService _letterOfGoodStandingService;
        private readonly IBillingService _billingService;
        private readonly IProductOptionService _productOptionService;
        private readonly IPolicyService _policyService;
        private readonly IRepository<billing_TermArrangementProductOption> _termArrangementProductOptionRepository;
        private readonly IRepository<billing_TermScheduleAllocation> _termScheduleAllocationRepository;
        private readonly ITermsArrangementService _termsArrangementService;
        private readonly IRepository<billing_SuspenseDebtorBankMapping> _suspenseDebtorBankMappingRepository;
        private readonly IBankAccountService _bankAccountService;
        private readonly IAbilityTransactionsAuditService _abilityTransactionsAuditService;
        private readonly IRepository<billing_TermBulkAllocation> _termBulkAllocationRepository;
        private readonly IIndustryService _industryService;
        private readonly IRepository<billing_PolicyPaymentAllocation> _policyPaymentAllocation;

        public PaymentAllocationFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<billing_UnallocatedPayment> unallocatedPaymentRepository,
            IRepository<billing_Invoice> invoiceRepository,
            IRepository<billing_Transaction> transactionsrRepository,
            IInvoiceService invoiceService,
            ICommissionService commissionService,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<finance_BankStatementEntry> facsStatementRepository,
            IRepository<billing_InvoiceAllocation> invoiceAllocationRepository,
            IClaimRecoveryInvoiceService claimRecoveryInvoiceService,
            IRepository<billing_ClaimRecoveryInvoice> claimRecoveryInvoiceRepository,
            IPeriodService periodService,
            IRepository<billing_RefundHeader> refundHeaderRepository,
            IRepository<billing_RefundHeaderDetail> refundHeaderDetailRepository,
            IRepository<billing_DebitTransactionAllocation> debitAllocationRepository,
            IConfigurationService configurationService,
            IRepository<Load_BulkAllocationFile> bulkAllocationFileRepository,
            IRepository<Load_BulkManualAllocation> bulkManualAllocationRepository,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IRepository<billing_TermArrangement> termArrangementRepository,
            IRepository<billing_TermArrangementSchedule> termArrangementScheduleRepository,
            IRolePlayerService rolePlayerService,
            ISendEmailService sendEmailService,
            IDocumentNumberService documentNumberService,
            ILetterOfGoodStandingService letterOfGoodStandingsService,
            IBillingService billingService,
            IProductOptionService productOptionService,
            IPolicyService policyService,
            IRepository<billing_TermArrangementProductOption> termArrangementProductOptionRepository,
            IRepository<billing_TermScheduleAllocation> termScheduleAllocationRepository,
            ITermsArrangementService termsArrangementService,
            IRepository<billing_SuspenseDebtorBankMapping> suspenseDebtorBankMappingRepository,
            IBankAccountService bankAccountService,
            IAbilityTransactionsAuditService abilityTransactionsAuditService,
            IRepository<billing_TermBulkAllocation> termBulkAllocationRepository,
            IIndustryService industryService,
            IRepository<billing_PolicyPaymentAllocation> policyPaymentAllocation
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _unallocatedPaymentRepository = unallocatedPaymentRepository;
            _invoiceRepository = invoiceRepository;
            _transactionRepository = transactionsrRepository;
            _invoiceService = invoiceService;
            _commissionService = commissionService;
            _documentGeneratorService = documentGeneratorService;
            _facsStatementRepository = facsStatementRepository;
            _invoiceAllocationRepository = invoiceAllocationRepository;
            _claimRecoveryInvoiceService = claimRecoveryInvoiceService;
            _claimRecoveryInvoiceRepository = claimRecoveryInvoiceRepository;
            _periodService = periodService;
            _refundHeaderRepository = refundHeaderRepository;
            _refundHeaderDetailRepository = refundHeaderDetailRepository;
            _debitAllocationRepository = debitAllocationRepository;
            _configurationService = configurationService;
            _bulkAllocationFileRepository = bulkAllocationFileRepository;
            _bulkManualAllocationRepository = bulkManualAllocationRepository;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _termArrangementRepository = termArrangementRepository;
            _termArrangementScheduleRepository = termArrangementScheduleRepository;
            _rolePlayerService = rolePlayerService;
            _sendEmailService = sendEmailService;
            _documentNumberService = documentNumberService;
            _letterOfGoodStandingService = letterOfGoodStandingsService;
            _billingService = billingService;
            _productOptionService = productOptionService;
            _policyService = policyService;
            _termArrangementProductOptionRepository = termArrangementProductOptionRepository;
            _termScheduleAllocationRepository = termScheduleAllocationRepository;
            _termsArrangementService = termsArrangementService;
            _suspenseDebtorBankMappingRepository = suspenseDebtorBankMappingRepository;
            _bankAccountService = bankAccountService;
            _abilityTransactionsAuditService = abilityTransactionsAuditService;
            _termBulkAllocationRepository = termBulkAllocationRepository;
            _industryService = industryService;
            _policyPaymentAllocation = policyPaymentAllocation;
            Task.Run(this.SetupPolicyCommunicationVariables).Wait();
        }


        private async Task SetupPolicyCommunicationVariables()
        {
            fromAddress = await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            fincareportServerUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";
        }

        public async Task<UnallocatedBankImportPayment> GetUnallocatedPayment(int paymentId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var unallocatedPayment = await _unallocatedPaymentRepository
                    .SingleAsync(s => s.UnallocatedPaymentId == paymentId);

                await _unallocatedPaymentRepository.LoadAsync(unallocatedPayment, b => b.BankStatementEntry);

                return new UnallocatedBankImportPayment()
                {
                    BankStatementEntryId = unallocatedPayment.BankStatementEntryId,
                    BillingReference = unallocatedPayment.BankStatementEntry.UserReference,
                    UnallocatedPaymentId = unallocatedPayment.UnallocatedPaymentId,
                    BankAccountNumber = unallocatedPayment.BankStatementEntry.BankAccountNumber,
                    TransactionDate = unallocatedPayment.BankStatementEntry.TransactionDate,
                    UnallocatedAmount = unallocatedPayment.UnallocatedAmount,
                    StatementReference = unallocatedPayment.BankStatementEntry.StatementNumber + "/" +
                                         unallocatedPayment.BankStatementEntry.StatementLineNumber + " " +
                                         (unallocatedPayment.BankStatementEntry.StatementDate?.Date.ToString(
                                              "dd/MM/yyyy") ?? string.Empty),
                    Amount = unallocatedPayment.BankStatementEntry.Amount,
                    DocumentType = unallocatedPayment.BankStatementEntry.DocumentType
                };
            }
        }

        public async Task<List<UnallocatedBankImport>> GetUnAllocatedPayments()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankImports = await _unallocatedPaymentRepository
                    .Where(a => a.AllocationProgressStatus == AllocationProgressStatusEnum.UnAllocated).ToListAsync();
                await _unallocatedPaymentRepository.LoadAsync(bankImports, a => a.BankStatementEntry);
                var bankAllocation = new List<UnallocatedBankImport>();

                foreach (var import in bankImports)
                {
                    var allocation = new UnallocatedBankImport()
                    {
                        UnallocatedPaymentId = import.UnallocatedPaymentId,
                        BankStatementEntryId = import.BankStatementEntryId,
                        BillingReference = import.BankStatementEntry.UserReference2,
                        Amount = import.UnallocatedAmount,
                        BankAccountNumber = import.BankStatementEntry.BankAccountNumber,
                        TransactionDate = import.BankStatementEntry.TransactionDate,
                        StatementReference = import.BankStatementEntry.StatementNumber + "/" +
                                             import.BankStatementEntry.StatementLineNumber + " " +
                                             (import.BankStatementEntry.StatementDate?.Date.ToString("dd/MM/yyyy") ??
                                              string.Empty)
                    };

                    bankAllocation.Add(allocation);
                }

                return bankAllocation;
            }
        }

        public async Task<List<UnallocatedBankImport>> SearchUnAllocatedPayments(string query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filteredUnallocatedPayments = new List<billing_UnallocatedPayment>();

                var unallocatedPayments = await _unallocatedPaymentRepository
                    .Where(a => a.AllocationProgressStatus == AllocationProgressStatusEnum.UnAllocated).ToListAsync();
                await _unallocatedPaymentRepository.LoadAsync(unallocatedPayments, a => a.BankStatementEntry);

                if (query != "null")
                {
                    foreach (var unallocatedPayment in unallocatedPayments)
                    {
                        if (unallocatedPayment.BankStatementEntry != null)
                        {
                            if (unallocatedPayment.BankStatementEntry.BankAccountNumber.Contains(query)
                                || (!string.IsNullOrEmpty(unallocatedPayment.BankStatementEntry.UserReference) &&
                                    unallocatedPayment.BankStatementEntry.UserReference.Contains(query)))
                            {
                                filteredUnallocatedPayments.Add(unallocatedPayment);
                            }
                        }
                    }

                    unallocatedPayments.Clear();
                    unallocatedPayments = filteredUnallocatedPayments;
                }

                var results = new List<UnallocatedBankImport>();
                unallocatedPayments.RemoveAll(s => s.UnallocatedAmount <= 0);

                foreach (var unallocatedPayment in unallocatedPayments)
                {
                    var result = new UnallocatedBankImport()
                    {
                        UnallocatedPaymentId = unallocatedPayment.UnallocatedPaymentId,
                        BankStatementEntryId = unallocatedPayment.BankStatementEntryId,
                        BillingReference = unallocatedPayment.BankStatementEntry.UserReference,
                        Amount = unallocatedPayment.UnallocatedAmount,
                        BankAccountNumber = unallocatedPayment.BankStatementEntry.BankAccountNumber,
                        TransactionDate = unallocatedPayment.BankStatementEntry.TransactionDate,
                        StatementReference = unallocatedPayment.BankStatementEntry.StatementNumber + "/" +
                                             unallocatedPayment.BankStatementEntry.StatementLineNumber + " " +
                                             (unallocatedPayment.BankStatementEntry.StatementDate?.Date.ToString(
                                                  "dd/MM/yyyy") ??
                                              string.Empty)
                    };


                    results.Add(result);
                }

                return results;
            }
        }

        public async Task AddUnallocatedPayments(List<finance_BankStatementEntry> statementEntries)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            if (statementEntries != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    foreach (var entry in statementEntries)
                    {
                        var amount = 0.00M;
                        if (entry.NettAmount.HasValue)
                        {
                            amount = (decimal)((int)entry.NettAmount / 100.0);
                        }

                        amount = entry.DebitCredit == "+" ? Math.Abs(amount) : -Math.Abs(amount);
                        var unallocatedPayment = new billing_UnallocatedPayment()
                        {
                            AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                            UnallocatedAmount = amount,
                            BankStatementEntryId = entry.BankStatementEntryId
                        };
                        _unallocatedPaymentRepository.Create(unallocatedPayment);
                    }

                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<List<Transaction>> GetPaymentTransactionsAllocatedToDebtorAccount(
            int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _transactionRepository.Where(s =>
                    (s.TransactionType == TransactionTypeEnum.Payment ||
                     s.TransactionType == TransactionTypeEnum.CreditNote ||
                     s.TransactionType == TransactionTypeEnum.CreditReallocation
                     || s.TransactionType == TransactionTypeEnum.InterDebtorTransfer)
                    && s.TransactionTypeLinkId == (int)TransactionActionType.Credit
                    && s.RolePlayerId == rolePlayerId).ToListAsync();

                var transactionsToRemove = await _transactionRepository.Where(s =>
                    (s.TransactionType == TransactionTypeEnum.PaymentReversal || s.TransactionType == TransactionTypeEnum.DebitNote
                                                                              || s.TransactionType == TransactionTypeEnum.DebitReallocation || s.TransactionType == TransactionTypeEnum.InterDebtorTransfer)
                    && s.RolePlayerId == rolePlayerId).ToListAsync();

                var transactionsToRemoveIds = new List<int>();

                foreach (var debitTran in transactionsToRemove)
                {
                    var tran = entities.FirstOrDefault(t => t.TransactionId == debitTran.LinkedTransactionId);
                    if (tran != null && tran.Amount == debitTran.Amount)
                    {
                        transactionsToRemoveIds.Add(tran.TransactionId);
                    }
                }

                entities.RemoveAll(s => transactionsToRemoveIds.Contains(s.TransactionId));

                var transactions = Mapper.Map<List<Transaction>>(entities);

                foreach (var transaction in transactions)
                {
                    var balance = await GetTransactionBalance(transaction.TransactionId);
                    transaction.UnallocatedAmount = balance * -1;
                    transaction.BankReference = string.IsNullOrEmpty(transaction.BankReference) ? transaction.RmaReference : transaction.BankReference;
                }

                transactions.RemoveAll(s => s.UnallocatedAmount <= 0);

                return Mapper.Map<List<Transaction>>(transactions);
            }
        }

        public async Task<Transaction> GetTransactionAllocatedToDebtorAccount(int transactionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _transactionRepository.FirstOrDefaultAsync(s =>
                    (s.TransactionType == TransactionTypeEnum.Payment ||
                     s.TransactionType == TransactionTypeEnum.CreditNote
                     || s.TransactionType == TransactionTypeEnum.CreditReallocation
                     || s.TransactionType == TransactionTypeEnum.InterDebtorTransfer)
                    && s.TransactionTypeLinkId == (int)TransactionActionType.Credit
                    && s.TransactionId == transactionId);

                var transaction = Mapper.Map<Transaction>(entity);

                transaction.UnallocatedAmount = await GetTransactionBalance(transactionId);

                return Mapper.Map<Transaction>(transaction);
            }
        }

        public async Task<Transaction> GetTransaction(int transactionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _transactionRepository.FirstOrDefaultAsync(transaction =>
                    transaction.TransactionId == transactionId);

                return Mapper.Map<Transaction>(result);
            }
        }

        private async Task<finance_BankStatementEntry> GetBankStatementEntry(int statementEntryId)
        {
            var result = new finance_BankStatementEntry();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entries = await _facsStatementRepository.Where(c => c.BankStatementEntryId == statementEntryId)
                    .ToListAsync();
                if (entries.Count > 0)
                {
                    result = entries.FirstOrDefault();
                }
            }

            return result;
        }

        public async Task<bool> UnallocateReversal(Transaction transaction)
        {
            Contract.Requires(transaction != null);

            if (transaction.BankStatementEntryId.HasValue)
            {
                var entry = await GetBankStatementEntry(transaction.BankStatementEntryId.Value);
                await AddUnallocatedPayments(new List<finance_BankStatementEntry> { entry });
            }
            return await Task.FromResult(true);

        }

        public async Task<bool> AllocatePaymentsToInvoices(List<ManualPaymentAllocation> manualPaymentAllocations)
        {
            if (manualPaymentAllocations == null || manualPaymentAllocations.Count == 0)
                return await Task.FromResult(false);

            billing_Transaction paymentTransaction = null;
            billing_UnallocatedPayment unallocatedPayment = null;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var tranId = manualPaymentAllocations[0].UnallocatedTransactionId;
                var leaveBalanceInSuspense = manualPaymentAllocations[0].LeaveBalanceInSuspenceAccount;

                paymentTransaction = await _transactionRepository.SingleOrDefaultAsync(t => t.TransactionId == tranId);

                if (paymentTransaction == null)
                {
                    var unallocatedPaymentId = manualPaymentAllocations[0].UnallocatedPaymentId;
                    unallocatedPayment = await _unallocatedPaymentRepository.FindByIdAsync(unallocatedPaymentId);
                    await _unallocatedPaymentRepository.LoadAsync(unallocatedPayment, a => a.BankStatementEntry);

                    var statementReference =
                        unallocatedPayment.BankStatementEntry.StatementNumber + "/" +
                        unallocatedPayment.BankStatementEntry.StatementLineNumber + " " +
                        (unallocatedPayment.BankStatementEntry.StatementDate?.Date.ToString("dd/MM/yyyy") ??
                         string.Empty);

                    paymentTransaction = new billing_Transaction()
                    {
                        Amount = leaveBalanceInSuspense ? manualPaymentAllocations.Sum(s => s.AllocatedAmount) : unallocatedPayment.UnallocatedAmount,
                        TransactionDate = DateTime.Now.ToSaDateTime(),
                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                        TransactionType = manualPaymentAllocations[0].IsClaimRecoveryPayment ? TransactionTypeEnum.ClaimRecoveryPayment : TransactionTypeEnum.Payment,
                        BankStatementEntryId = unallocatedPayment.BankStatementEntryId,
                        RolePlayerId = manualPaymentAllocations[0].RolePlayerId,
                        RmaReference = statementReference,
                        PeriodId = await GetPeriodId(manualPaymentAllocations[0].PeriodStatus)
                    };

                    _transactionRepository.Create(paymentTransaction);
                }

                if (unallocatedPayment != null)
                {
                    unallocatedPayment.UnallocatedAmount = leaveBalanceInSuspense ?
                        unallocatedPayment.UnallocatedAmount - manualPaymentAllocations.Sum(s => s.AllocatedAmount) : 0;
                    if (unallocatedPayment.UnallocatedAmount == 0)
                    {
                        unallocatedPayment.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;
                    }

                    _unallocatedPaymentRepository.Update(unallocatedPayment);
                }
                await scope.SaveChangesAsync();
            }

            await PostPaymentToGeneralLedger(unallocatedPayment, paymentTransaction);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var tran = await _transactionRepository.SingleAsync(t => t.TransactionId == paymentTransaction.TransactionId);

                foreach (var manualPaymentAllocation in manualPaymentAllocations)
                {
                    if (!manualPaymentAllocation.IsClaimRecoveryPayment)
                    {
                        await AllocateCreditTransactionToInvoice(Mapper.Map<Transaction>(tran), manualPaymentAllocation.AllocatedAmount, manualPaymentAllocation.InvoiceId);

                        var invoiceEntity = await _invoiceRepository
                             .Where(i => i.InvoiceId == manualPaymentAllocation.InvoiceId).FirstOrDefaultAsync();
                        var invoice = Mapper.Map<Invoice>(invoiceEntity);
                        if (invoice != null)
                        {
                            try
                            {
                                var invoiceBalance = await _invoiceService.GetInvoiceBalance(invoice.InvoiceId);
                                if (invoiceBalance == 0)
                                {
                                    await SendOutLogForFullyPaidInvoice(invoice);
                                }
                            }
                            catch (Exception ex)
                            {
                                ex.LogException($"Error occured trying to send log for invoice {invoice.InvoiceNumber} message: {ex.Message} - StackTrace: {ex.StackTrace}");
                            }
                        }
                    }
                    else
                    {
                        await AllocateCreditTransactionToInvoice(Mapper.Map<Transaction>(tran), manualPaymentAllocation.AllocatedAmount, null, manualPaymentAllocation.ClaimRecoveryInvoiceId);
                    }
                }

                return (await scope.SaveChangesAsync()) > 0;
            }
        }

        public async Task<bool> AllocatePaymentsToDebtor(List<ManualPaymentAllocation> manualPaymentAllocations)
        {
            if (manualPaymentAllocations == null || manualPaymentAllocations.Count == 0)
                return await Task.FromResult(false);

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var manualPaymentAllocation in manualPaymentAllocations)
                {
                    var unallocatedPayment = await _unallocatedPaymentRepository.FindByIdAsync(manualPaymentAllocation.UnallocatedPaymentId);

                    var statementReference = string.Empty;

                    if (unallocatedPayment != null)
                    {
                        await _unallocatedPaymentRepository.LoadAsync(unallocatedPayment, a => a.BankStatementEntry);

                        statementReference =
                            unallocatedPayment.BankStatementEntry.StatementNumber + "/" +
                            unallocatedPayment.BankStatementEntry.StatementLineNumber + " " +
                            (unallocatedPayment.BankStatementEntry.StatementDate?.Date.ToString("dd/MM/yyyy") ??
                             string.Empty);
                    }

                    Transaction transaction;

                    if (manualPaymentAllocation.AllocatedAmount < 0)
                    {
                        if (manualPaymentAllocation.TransactionType == TransactionTypeEnum.InterDebtorTransfer)
                        {
                            if (manualPaymentAllocation.LinkedInterDebtorTransfer != null)
                            {
                                foreach (var transferDetail in manualPaymentAllocation.LinkedInterDebtorTransfer.InterDebtorTransferDetails)
                                {
                                    var tran = await _transactionRepository.FirstAsync(t => t.TransactionId == transferDetail.LinkedTransactionId);
                                    var creditTransactionBalance = await GetTransactionBalance(tran.TransactionId);
                                    var transferBalance = Math.Abs(creditTransactionBalance) - Math.Abs(transferDetail.Amount);

                                    transaction = new Transaction
                                    {
                                        Amount = Math.Abs(transferDetail.Amount),
                                        TransactionDate = DateTime.Now.ToSaDateTime(),
                                        TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                        TransactionType = manualPaymentAllocation.TransactionType,
                                        BankStatementEntryId = unallocatedPayment?.BankStatementEntryId,
                                        RolePlayerId = manualPaymentAllocation.RolePlayerId,
                                        RmaReference = statementReference,
                                        LinkedTransactionId = transferDetail.LinkedTransactionId,
                                        Balance = transferBalance > 0 ? 0 : Math.Abs(transferBalance),
                                        PeriodId = await GetPeriodId(manualPaymentAllocation.PeriodStatus)
                                    };

                                    await AllocateDebitTransaction(transaction, manualPaymentAllocation.RolePlayerId, transaction.Amount, transferDetail.LinkedTransactionId);
                                }
                            }
                            else
                            {
                                transaction = new Transaction
                                {
                                    Amount = Math.Abs(manualPaymentAllocation.AllocatedAmount),
                                    TransactionDate = DateTime.Now.ToSaDateTime(),
                                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                    TransactionType = manualPaymentAllocation.TransactionType,
                                    BankStatementEntryId = unallocatedPayment?.BankStatementEntryId,
                                    RolePlayerId = manualPaymentAllocation.RolePlayerId,
                                    RmaReference = statementReference,
                                    LinkedTransactionId = null,
                                    Balance = 0,
                                    PeriodId = await GetPeriodId(manualPaymentAllocation.PeriodStatus)
                                };

                                await AllocateDebitTransaction(transaction, manualPaymentAllocation.RolePlayerId, transaction.Amount, null);
                            }
                        }
                        else if (manualPaymentAllocation.TransactionType == TransactionTypeEnum.Refund)
                        {
                            if (manualPaymentAllocation.LinkedRefund != null)
                            {
                                var refundHeaderEntity = Mapper.Map<billing_RefundHeader>(manualPaymentAllocation.LinkedRefund);

                                if (refundHeaderEntity.RefundHeaderDetails == null || refundHeaderEntity.RefundHeaderDetails.Count == 0)
                                {
                                    await _refundHeaderRepository.LoadAsync(refundHeaderEntity, r => r.RefundHeaderDetails);
                                }

                                if (refundHeaderEntity.RefundHeaderDetails != null)
                                {
                                    foreach (var refundDetail in refundHeaderEntity.RefundHeaderDetails)
                                    {
                                        transaction = new Transaction
                                        {
                                            Amount = Math.Abs(refundDetail.TotalAmount),
                                            TransactionDate = DateTimeHelper.SaNow,
                                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                            TransactionType = manualPaymentAllocation.TransactionType,
                                            BankStatementEntryId = manualPaymentAllocation.BankStatementEntryId ?? unallocatedPayment?.BankStatementEntryId,
                                            RolePlayerId = manualPaymentAllocation.RolePlayerId,
                                            RmaReference = statementReference,
                                            LinkedTransactionId = refundDetail.TransactionId,
                                            PeriodId = await GetPeriodId(manualPaymentAllocation.PeriodStatus)
                                        };
                                        await AllocateDebitTransaction(transaction, manualPaymentAllocation.RolePlayerId, transaction.Amount, refundDetail.TransactionId);
                                    }
                                }
                            }
                            else
                            {
                                transaction = new Transaction
                                {
                                    Amount = Math.Abs(manualPaymentAllocation.AllocatedAmount),
                                    TransactionDate = DateTime.Now.ToSaDateTime(),
                                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                    TransactionType = manualPaymentAllocation.TransactionType,
                                    BankStatementEntryId = unallocatedPayment?.BankStatementEntryId,
                                    RolePlayerId = manualPaymentAllocation.RolePlayerId,
                                    RmaReference = statementReference,
                                    LinkedTransactionId = null,
                                    Balance = 0,
                                    PeriodId = await GetPeriodId(manualPaymentAllocation.PeriodStatus)
                                };

                                await AllocateDebitTransaction(transaction, manualPaymentAllocation.RolePlayerId, transaction.Amount, null);
                            }
                        }
                        else if (manualPaymentAllocation.TransactionType == TransactionTypeEnum.PaymentReversal)
                        {
                            if (manualPaymentAllocation.LinkedPayment != null)
                            {
                                var linkedPaymentTran = Mapper.Map<billing_Transaction>(manualPaymentAllocation.LinkedPayment);

                                if (linkedPaymentTran != null)
                                {
                                    transaction = new Transaction
                                    {
                                        Amount = Math.Abs(linkedPaymentTran.Amount),
                                        TransactionDate = DateTime.Now.ToSaDateTime(),
                                        TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                        TransactionType = TransactionTypeEnum.PaymentReversal,
                                        BankStatementEntryId = manualPaymentAllocation.BankStatementEntryId ?? unallocatedPayment?.BankStatementEntryId,
                                        RolePlayerId = manualPaymentAllocation.RolePlayerId,
                                        RmaReference = statementReference,
                                        LinkedTransactionId = linkedPaymentTran.TransactionId,
                                        PeriodId = await GetPeriodId(manualPaymentAllocation.PeriodStatus)
                                    };
                                    await AllocateDebitTransaction(transaction, manualPaymentAllocation.RolePlayerId, transaction.Amount, linkedPaymentTran.TransactionId);
                                }
                            }
                            else
                            {
                                transaction = new Transaction
                                {
                                    Amount = Math.Abs(manualPaymentAllocation.AllocatedAmount),
                                    TransactionDate = DateTime.Now.ToSaDateTime(),
                                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                    TransactionType = manualPaymentAllocation.TransactionType,
                                    BankStatementEntryId = unallocatedPayment?.BankStatementEntryId,
                                    RolePlayerId = manualPaymentAllocation.RolePlayerId,
                                    RmaReference = statementReference,
                                    LinkedTransactionId = null,
                                    Balance = null,
                                    PeriodId = await GetPeriodId(manualPaymentAllocation.PeriodStatus)
                                };

                                await AllocateDebitTransaction(transaction, manualPaymentAllocation.RolePlayerId, transaction.Amount, null);
                            }
                        }
                    }
                    else
                    {
                        transaction = new Transaction
                        {
                            Amount = manualPaymentAllocation.AllocatedAmount,
                            TransactionDate = DateTime.Now.ToSaDateTime(),
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            TransactionType = manualPaymentAllocation.IsClaimRecoveryPayment ? TransactionTypeEnum.ClaimRecoveryPayment : TransactionTypeEnum.Payment,
                            BankStatementEntryId = unallocatedPayment?.BankStatementEntryId,
                            RolePlayerId = manualPaymentAllocation.RolePlayerId,
                            RmaReference = statementReference,
                            PeriodId = await GetPeriodId(manualPaymentAllocation.PeriodStatus)
                        };

                        var createdTransactionId = await AllocateCreditTransactionToDebtor(transaction, manualPaymentAllocation.RolePlayerId, manualPaymentAllocation.AllocatedAmount);

                        var transactionEntity = Mapper.Map<billing_Transaction>(transaction);
                        transactionEntity.TransactionId = createdTransactionId;
                        await PostPaymentToGeneralLedger(unallocatedPayment, transactionEntity);

                        await AllocateToTermsArrangement(transaction.RolePlayerId, transaction.Amount, transaction.TransactionDate, createdTransactionId);
                    }

                    if (unallocatedPayment != null)
                    {
                        if (manualPaymentAllocation.AllocatedAmount < 0)
                        {
                            unallocatedPayment.UnallocatedAmount = 0;
                        }
                        else
                        {
                            unallocatedPayment.UnallocatedAmount -= manualPaymentAllocation.AllocatedAmount;
                        }

                        if (unallocatedPayment.UnallocatedAmount == 0)
                        {
                            unallocatedPayment.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;
                        }

                        _unallocatedPaymentRepository.Update(unallocatedPayment);
                    }

                    var text = $"Payment allocated ref: {manualPaymentAllocation.Reference}";
                    var note = new BillingNote
                    {
                        ItemId = manualPaymentAllocation.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.PaymentAllocation.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }

                await scope.SaveChangesAsync();

                return true;
            }
        }

        public async Task AllocateCreditNotes(CreditNoteAccount creditNoteAccount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AllocateCreditNote);

            if (creditNoteAccount != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    foreach (var transaction in creditNoteAccount?.Transactions)
                    {
                        var reference = await _invoiceService.CreateCreditNoteReferenceNumber();

                        transaction.TransactionType = TransactionTypeEnum.CreditNote;
                        transaction.Reason = creditNoteAccount?.Note?.Text;
                        transaction.RmaReference = reference;
                        transaction.TransactionDate = DateTimeHelper.SaNow;
                        transaction.TransactionTypeLinkId = (int)TransactionActionType.Credit;
                        transaction.RolePlayerId = creditNoteAccount.RolePlayerId;
                        transaction.TransactionId = 0;
                        transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);

                        await AllocateCreditTransaction(transaction, creditNoteAccount.RolePlayerId, transaction.Amount, transaction.InvoiceId, null, null);
                    }

                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task AllocateDebitNotes(CreditNoteReversals creditNoteReversals)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AllocateDebitNote);

            if (creditNoteReversals != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    foreach (var transaction in creditNoteReversals.Transactions)
                    {
                        if (transaction.TransactionType == TransactionTypeEnum.CreditNote)
                        {
                            var transactionPrev = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                            var reference = await CreateDebitNoteReferenceNumber();

                            var reversalTransactionEntry = new Transaction
                            {
                                Amount = transaction.Amount,
                                RmaReference = reference,
                                BankStatementEntryId = transaction.BankStatementEntryId,
                                Reason = transaction.Reason,
                                RolePlayerId = transaction.RolePlayerId,
                                TransactionType = TransactionTypeEnum.DebitNote,
                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                LinkedTransactionId = transaction.TransactionId,
                                TransactionDate =
                                    await DeriveTransactionDateBasedOnPeriodStatus(creditNoteReversals.PeriodStatus)
                            };

                            await AllocateDebitTransaction(reversalTransactionEntry, transaction.RolePlayerId,
                                transaction.Amount, transaction.TransactionId);
                        }
                    }

                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task AllocateCreditTransaction(Transaction creditTransaction,
            int rolePlayerId, decimal amountToAllocate, int? invoiceId, int? claimRecoveryInvoiceId, List<int> policyIds)
        {
            Contract.Requires(creditTransaction != null);
            if (amountToAllocate <= 0)
            {
                throw new TechnicalException(
                    $"AllocateCreditTransaction Error: Credit allocation for debtor with id: {rolePlayerId} failed. Amount must be greater than zero");
            }

            if (!invoiceId.HasValue && !claimRecoveryInvoiceId.HasValue)
            {
                if (policyIds == null || policyIds?.Count == 0)
                {
                    await AllocateCreditTransactionToDebtor(creditTransaction, rolePlayerId, amountToAllocate);
                }
                else
                {
                    await AllocateCreditTransactionToPolicies(creditTransaction, rolePlayerId, amountToAllocate, policyIds);
                }

            }
            else
            {
                if (invoiceId.HasValue)
                {
                    await AllocateCreditTransactionToInvoice(creditTransaction, amountToAllocate,
                        invoiceId.Value);
                }
                else if (claimRecoveryInvoiceId.HasValue)
                {
                    await AllocateCreditTransactionToInvoice(creditTransaction, amountToAllocate,
                        null, claimRecoveryInvoiceId.Value);
                }
            }

        }

        public async Task<int> AllocateDebitTransaction(Transaction debitTransaction, int rolePlayerId, decimal amountToAllocate, int? linkedTransactionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            if (amountToAllocate <= 0)
            {
                throw new TechnicalException(
                    $"AllocateDebitTransaction Error: Debit allocation for debtor with id: {rolePlayerId} failed. Amount must be greater than zero");
            }

            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var transactionEntity = Mapper.Map<billing_Transaction>(debitTransaction);
                transactionEntity.LinkedTransactionId = linkedTransactionId;
                transactionEntity.RolePlayerId = rolePlayerId;
                transactionEntity.Amount = amountToAllocate;
                transactionEntity.InvoiceId = null;
                transactionEntity.Balance = debitTransaction?.Balance;
                if (!string.IsNullOrEmpty(debitTransaction.BankReference))
                    transactionEntity.BankReference = debitTransaction.BankReference;

                var linkedTransactionEntity = await _transactionRepository.Where(t => t.TransactionId == linkedTransactionId).SingleOrDefaultAsync();
                if (amountToAllocate == linkedTransactionEntity?.Amount)
                {
                    await _transactionRepository.LoadAsync(linkedTransactionEntity, t => t.InvoiceAllocations_TransactionId);
                    foreach (var invoiceAllocation in linkedTransactionEntity.InvoiceAllocations_TransactionId)
                    {
                        if (invoiceAllocation.InvoiceId.HasValue)
                        {
                            var invoiceEntity = await _invoiceRepository
                                .Where(i => i.InvoiceId == invoiceAllocation.InvoiceId).SingleAsync();

                            invoiceEntity.InvoiceStatus = InvoiceStatusEnum.Unpaid;

                            await _invoiceRepository.LoadAsync(invoiceEntity, i => i.Policy);

                            if (invoiceEntity.Policy.CommissionPercentage > 0 || invoiceEntity.Policy.AdminPercentage > 0)
                            {
                                var commision = new CommissionInvoicePaymentAllocation()
                                {
                                    InvoiceId = invoiceEntity.InvoiceId,
                                    Amount = decimal.Negate(amountToAllocate),
                                    TransactionDate = DateTimeHelper.SaNow,
                                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                    IsProcessed = false
                                };
                                commissionAllocations.Add(commision);
                            }

                            _invoiceRepository.Update(invoiceEntity);
                            var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(invoiceEntity.PolicyId.Value);

                            var allocation = new billing_InvoiceAllocation
                            {
                                LinkedTransactionId = invoiceAllocation.TransactionId,
                                InvoiceId = invoiceAllocation.InvoiceId.Value,
                                Amount = invoiceAllocation.Amount,
                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocationReversal
                            };
                            if (policy != null)
                                allocation.ProductCategoryType = policy.ProductCategoryType;

                            transactionEntity.InvoiceAllocations_TransactionId.Add(allocation);
                        }
                    }

                    _transactionRepository.Update(linkedTransactionEntity);
                }

                _transactionRepository.Create(transactionEntity);

                if (commissionAllocations.Count > 0)
                {
                    try
                    {
                        await _commissionService.AddCommissions(commissionAllocations);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException();
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return transactionEntity.TransactionId;
            }
        }

        public async Task AllocateCreditTransactionToInvoice(Transaction transaction, decimal amountToAllocate, int? invoiceId, int? claimRecoveryInvoiceId = null)
        {
            Contract.Requires(transaction != null);
            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (!claimRecoveryInvoiceId.HasValue)
                {
                    if (!invoiceId.HasValue)
                    {
                        return;
                    }

                    var invoice = await _invoiceService.GetInvoice(Convert.ToInt32(invoiceId));
                    if (invoice.Balance <= 0)
                    {
                        return;
                    }

                    var invoiceTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.Invoice);

                    billing_Transaction transactionEntity;
                    if (transaction.TransactionId > 0)
                    {
                        var transactionBalance = await GetTransactionBalance(transaction.TransactionId);
                        transactionBalance = Math.Abs(transactionBalance);

                        if (transactionBalance < amountToAllocate)
                        {
                            return;
                        }

                        transactionEntity = await _transactionRepository
                            .Where(t => t.TransactionId == transaction.TransactionId).SingleAsync();
                        await _transactionRepository.LoadAsync(transactionEntity, t => t.InvoiceAllocations_TransactionId);
                    }
                    else
                    {
                        transactionEntity = Mapper.Map<billing_Transaction>(transaction);

                        /*var invoicePeriod = await _periodService.GetPeriod(invoice.InvoiceDate);
                          var currentPeriod = await _periodService.GetCurrentPeriod();

                        transactionEntity.TransactionDate = transactionEntity.TransactionType != TransactionTypeEnum.CreditNote ? transactionEntity.TransactionDate :
                            (invoicePeriod != null ? invoicePeriod.EndDate > currentPeriod.StartDate ? invoice.InvoiceDate : transaction.TransactionDate : invoice.InvoiceDate); */
                    }

                    transactionEntity.InvoiceId = null;
                    transactionEntity.ClaimRecoveryInvoiceId = null;
                    if (!string.IsNullOrEmpty(transaction.BankReference))
                        transactionEntity.BankReference = transaction.BankReference;

                    var allocationAmount = amountToAllocate < invoice.Balance
                        ? amountToAllocate
                        : invoice.Balance;
                    var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(invoice.PolicyId);

                    transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                    {
                        InvoiceId = invoice.InvoiceId,
                        Amount = allocationAmount,
                        BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                        LinkedTransactionId = invoiceTransaction.TransactionId,
                        ProductCategoryType = (policy != null) ? policy.ProductCategoryType : null
                    });

                    var invoiceEntity = _invoiceRepository.FirstOrDefault(t => t.InvoiceId == invoice.InvoiceId);

                    invoiceEntity.InvoiceStatus = allocationAmount < invoice.Balance ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Paid;
                    if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid || invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Partially)
                    {
                        await _invoiceRepository.LoadAsync(invoiceEntity, x => x.Policy);
                        if (invoiceEntity.Policy?.CommissionPercentage > 0 || invoiceEntity.Policy?.AdminPercentage > 0)
                        {
                            var commision = new CommissionInvoicePaymentAllocation()
                            {
                                InvoiceId = invoiceEntity.InvoiceId,
                                Amount = allocationAmount,
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                IsProcessed = false
                            };
                            commissionAllocations.Add(commision);
                        }
                    }

                    if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid)
                    {
                        await _invoiceRepository.LoadAsync(invoiceEntity, i => i.Policy);

                        switch (invoiceEntity.Policy.PolicyStatus)
                        {
                            case PolicyStatusEnum.PendingFirstPremium:
                                invoiceEntity.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                break;
                        }
                    }

                    _invoiceRepository.Update(invoiceEntity);

                    if (transaction.TransactionId > 0)
                    {
                        _transactionRepository.Update(transactionEntity);
                    }
                    else
                    {
                        _transactionRepository.Create(transactionEntity);
                    }
                    var text = $"Invoice allocation to the amount of {transaction.Amount} for document: {invoice.InvoiceNumber}";
                    var note = new BillingNote
                    {
                        ItemId = transaction.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.InvoiceAllocation.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);

                    if (commissionAllocations.Count > 0)
                    {
                        try
                        {
                            await _commissionService.AddCommissions(commissionAllocations);
                        }
                        catch (Exception ex)
                        {
                            ex.LogException();
                        }
                    }
                }
                else
                {
                    var invoice = await _claimRecoveryInvoiceService.GetInvoice(claimRecoveryInvoiceId.Value);
                    if (invoice.Balance <= 0)
                    {
                        return;
                    }

                    billing_Transaction transactionEntity;
                    if (transaction.TransactionId > 0)
                    {
                        var transactionBalance = await GetTransactionBalance(transaction.TransactionId);
                        transactionBalance = Math.Abs(transactionBalance);

                        if (transactionBalance < amountToAllocate)
                        {
                            return;
                        }

                        transactionEntity = await _transactionRepository
                            .Where(t => t.TransactionId == transaction.TransactionId).SingleAsync();
                        await _transactionRepository.LoadAsync(transactionEntity, t => t.InvoiceAllocations_TransactionId);
                    }
                    else
                    {
                        transactionEntity = Mapper.Map<billing_Transaction>(transaction);
                    }

                    transactionEntity.InvoiceId = null;
                    transactionEntity.ClaimRecoveryInvoiceId = null;

                    var allocationAmount = amountToAllocate < invoice.Balance
                        ? amountToAllocate
                        : invoice.Balance;

                    transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                    {
                        ClaimRecoveryId = invoice.ClaimRecoveryInvoiceId,
                        Amount = allocationAmount,
                        BillingAllocationType = BillingAllocationTypeEnum.ClaimRecovery
                    });

                    if (transaction.TransactionId > 0)
                    {
                        _transactionRepository.Update(transactionEntity);
                    }
                    else
                    {
                        _transactionRepository.Create(transactionEntity);
                    }

                    var invoiceEntity = Mapper.Map<billing_ClaimRecoveryInvoice>(invoice);

                    invoiceEntity.InvoiceStatus = allocationAmount < invoice.Balance
                        ? InvoiceStatusEnum.Partially
                        : InvoiceStatusEnum.Paid;

                    _claimRecoveryInvoiceRepository.Update(invoiceEntity);
                }

                await scope.SaveChangesAsync();
            }

        }

        private async Task AllocateCreditTransactionToPolicies(Transaction transaction, int rolePlayerId, decimal amountToAllocate, List<int> policyIds)
        {
            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                transaction.RolePlayerId = rolePlayerId;
                transaction.Amount = amountToAllocate;
                var transactionEntity = Mapper.Map<billing_Transaction>(transaction);
                transactionEntity.InvoiceId = null;
                transactionEntity.ClaimRecoveryInvoiceId = null;
                if (!string.IsNullOrEmpty(transaction.BankReference))
                    transactionEntity.BankReference = transaction.BankReference;

                if (transactionEntity.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment)
                {
                    var unsettledInvoices =
                        await _invoiceService.GetUnsettledInvoices(rolePlayerId, policyIds);

                    if (unsettledInvoices.Count == 1)
                    {
                        var allocationAmount = amountToAllocate < unsettledInvoices[0].Balance
                            ? amountToAllocate
                            : unsettledInvoices[0].Balance;
                        var invoiceId = unsettledInvoices[0].InvoiceId;
                        var invoiceTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.Invoice);
                        var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(unsettledInvoices[0].PolicyId);

                        transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                        {
                            InvoiceId = unsettledInvoices[0].InvoiceId,
                            Amount = allocationAmount,
                            BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            LinkedTransactionId = invoiceTransaction.TransactionId,
                            ProductCategoryType = (policy != null) ? policy.ProductCategoryType : null
                        });

                        var invoiceEntity = Mapper.Map<billing_Invoice>(unsettledInvoices[0]);

                        invoiceEntity.InvoiceStatus = transaction.Amount < unsettledInvoices[0].Balance ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Paid;

                        await _invoiceRepository.LoadAsync(invoiceEntity, i => i.Policy);

                        if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid || invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Partially)
                        {
                            if (invoiceEntity.Policy.CommissionPercentage > 0 || invoiceEntity.Policy.AdminPercentage > 0)
                            {
                                var commision = new CommissionInvoicePaymentAllocation()
                                {
                                    InvoiceId = invoiceEntity.InvoiceId,
                                    Amount = allocationAmount,
                                    TransactionDate = DateTimeHelper.SaNow,
                                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                    IsProcessed = false
                                };
                                commissionAllocations.Add(commision);
                            }
                        }
                        if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid)
                        {
                            switch (invoiceEntity.Policy.PolicyStatus)
                            {
                                case PolicyStatusEnum.PendingFirstPremium:
                                    invoiceEntity.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                    break;
                            }
                        }

                        _invoiceRepository.Update(invoiceEntity);
                    }
                }
                else
                {
                    var unsettledInvoices =
                        await _claimRecoveryInvoiceService.GetUnsettledInvoices(rolePlayerId);

                    if (unsettledInvoices.Count == 1)
                    {
                        var allocationAmount = amountToAllocate < unsettledInvoices[0].Balance
                            ? amountToAllocate
                            : unsettledInvoices[0].Balance;

                        transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                        {
                            ClaimRecoveryId = unsettledInvoices[0].ClaimRecoveryInvoiceId,
                            Amount = allocationAmount,
                            BillingAllocationType = BillingAllocationTypeEnum.ClaimRecovery
                        });


                        var invoiceEntity = Mapper.Map<billing_ClaimRecoveryInvoice>(unsettledInvoices[0]);

                        invoiceEntity.InvoiceStatus = transaction.Amount < unsettledInvoices[0].Balance
                            ? InvoiceStatusEnum.Partially
                            : InvoiceStatusEnum.Paid;

                        _claimRecoveryInvoiceRepository.Update(invoiceEntity);
                    }
                }

                _transactionRepository.Create(transactionEntity);

                if (commissionAllocations.Count > 0)
                {
                    try
                    {
                        await _commissionService.AddCommissions(commissionAllocations);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException();
                    }
                }

                await scope.SaveChangesAsync();
            }
        }

        private async Task<int> AllocateCreditTransactionToDebtor(Transaction transaction, int rolePlayerId, decimal amountToAllocate)
        {
            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                transaction.RolePlayerId = rolePlayerId;
                transaction.Amount = amountToAllocate;
                var transactionEntity = Mapper.Map<billing_Transaction>(transaction);
                transactionEntity.InvoiceId = null;
                transactionEntity.ClaimRecoveryInvoiceId = null;
                if (!string.IsNullOrEmpty(transaction.BankReference))
                    transactionEntity.BankReference = transaction.BankReference;

                if (transactionEntity.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment)
                {
                    var unsettledInvoices =
                        await _invoiceService.GetUnsettledInvoices(rolePlayerId, null);

                    if (unsettledInvoices.Count == 1)
                    {
                        var allocationAmount = amountToAllocate < unsettledInvoices[0].Balance
                            ? amountToAllocate
                            : unsettledInvoices[0].Balance;
                        var invoiceId = unsettledInvoices[0].InvoiceId;
                        var invoiceTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.Invoice);
                        var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(unsettledInvoices[0].PolicyId);

                        transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                        {
                            InvoiceId = unsettledInvoices[0].InvoiceId,
                            Amount = allocationAmount,
                            BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            LinkedTransactionId = invoiceTransaction.TransactionId,
                            ProductCategoryType = (policy != null) ? policy.ProductCategoryType : null
                        });

                        /* var invoicePeriod = await _periodService.GetPeriod(unsettledInvoices[0].InvoiceDate);
                           var currentPeriod = await _periodService.GetCurrentPeriod();

                        transactionEntity.TransactionDate = transactionEntity.TransactionType != TransactionTypeEnum.CreditNote ? transactionEntity.TransactionDate :
                            (invoicePeriod != null ? invoicePeriod.EndDate > currentPeriod.StartDate ? unsettledInvoices[0].InvoiceDate : transactionEntity.TransactionDate : unsettledInvoices[0].InvoiceDate); */

                        var invoiceEntity = Mapper.Map<billing_Invoice>(unsettledInvoices[0]);

                        invoiceEntity.InvoiceStatus = transaction.Amount < unsettledInvoices[0].Balance ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Paid;

                        await _invoiceRepository.LoadAsync(invoiceEntity, i => i.Policy);

                        if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid || invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Partially)
                        {
                            if (invoiceEntity.Policy.CommissionPercentage > 0 || invoiceEntity.Policy.AdminPercentage > 0)
                            {
                                var commision = new CommissionInvoicePaymentAllocation()
                                {
                                    InvoiceId = invoiceEntity.InvoiceId,
                                    Amount = allocationAmount,
                                    TransactionDate = DateTimeHelper.SaNow,
                                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                    IsProcessed = false
                                };
                                commissionAllocations.Add(commision);
                            }
                        }
                        if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid)
                        {
                            switch (invoiceEntity.Policy.PolicyStatus)
                            {
                                case PolicyStatusEnum.PendingFirstPremium:
                                    invoiceEntity.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                    break;
                            }
                        }

                        _invoiceRepository.Update(invoiceEntity);
                    }
                }
                else
                {
                    var unsettledInvoices =
                        await _claimRecoveryInvoiceService.GetUnsettledInvoices(rolePlayerId);

                    if (unsettledInvoices.Count == 1)
                    {
                        var allocationAmount = amountToAllocate < unsettledInvoices[0].Balance
                            ? amountToAllocate
                            : unsettledInvoices[0].Balance;

                        transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                        {
                            ClaimRecoveryId = unsettledInvoices[0].ClaimRecoveryInvoiceId,
                            Amount = allocationAmount,
                            BillingAllocationType = BillingAllocationTypeEnum.ClaimRecovery
                        });


                        var invoiceEntity = Mapper.Map<billing_ClaimRecoveryInvoice>(unsettledInvoices[0]);

                        invoiceEntity.InvoiceStatus = transaction.Amount < unsettledInvoices[0].Balance
                            ? InvoiceStatusEnum.Partially
                            : InvoiceStatusEnum.Paid;

                        _claimRecoveryInvoiceRepository.Update(invoiceEntity);
                    }
                }

                _transactionRepository.Create(transactionEntity);

                if (commissionAllocations.Count > 0)
                {
                    try
                    {
                        await _commissionService.AddCommissions(commissionAllocations);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException();
                    }
                }

                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return transactionEntity.TransactionId;
            }
        }

        public async Task<decimal> GetTransactionBalance(int transactionId)
        {//TODO ---Technical debt
         //find better solution to get balances for different transaction types
         //without adding more if/case statements
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
                    var debitAllocations = await _debitAllocationRepository.Where(d => d.CreditTransactionId == transaction.TransactionId).ToListAsync();
                    balance -= debitAllocations.Sum(i => i.Amount);
                    balance -= await GetPaymentsAllocatedToPoliciesFromTransaction(transaction);
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
                    balance = transaction.Amount;

                    switch (transaction.TransactionType)
                    {
                        case TransactionTypeEnum.Interest:
                            var invoiceAllocations = await _invoiceAllocationRepository.Where(x => x.LinkedTransactionId == transaction.TransactionId).ToListAsync();

                            if (invoiceAllocations.Count > 0)
                            {
                                foreach (var allocation in invoiceAllocations)
                                {
                                    balance -= allocation.Amount;
                                }
                                if (balance < 0)
                                {
                                    balance = 0;
                                }
                            }
                            return balance;
                        default:
                            balance = transaction.LinkedTransactionId != null ? ((transaction.TransactionType == TransactionTypeEnum.DebitReallocation
                        || transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer) ? transaction.Balance ?? 0 : 0)
                        : (transaction.TransactionType == TransactionTypeEnum.DebitNote || transaction.TransactionType == TransactionTypeEnum.PaymentReversal) ? transaction.Amount : 0;
                            return balance;
                    }
                }

                return balance;
            }
        }

        public async Task<string> AllocateInterDebtorTransaction(InterDebtorTransfer interDebtorTransfer, FinPayee fromDebtor)
        {
            var reference = string.Empty;

            if (interDebtorTransfer != null && fromDebtor != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var transactionPrev =
                        await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);

                    foreach (var transaction in interDebtorTransfer.Transactions)
                    {
                        var newTransaction = new billing_Transaction
                        {
                            Amount = transaction.TransferAmount,
                            BankReference = string.Empty,
                            InvoiceId = null,
                            TransactionDate = DateTimeHelper.SaNow,
                            TransactionType = TransactionTypeEnum.InterDebtorTransfer,
                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                            BankStatementEntryId = null,
                            RolePlayerId = fromDebtor.RolePlayerId,
                            LinkedTransactionId = transaction.TransactionId,
                            RmaReference = "IDT" + DateTime.Now.ToString("yyyyMMdd") + 0 + transactionPrev
                        };

                        if (reference == string.Empty) reference = newTransaction.RmaReference;

                        await AllocateDebitTransaction(Mapper.Map<Transaction>(newTransaction),
                            fromDebtor.RolePlayerId, transaction.TransferAmount, transaction.TransactionId);
                    }

                    await scope.SaveChangesAsync();
                }
            }

            return reference;
        }

        public async Task PerformCommissionClawbacks(List<Invoice> invoices)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();
            if (invoices?.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    foreach (var invoice in invoices)
                    {
                        var invoiceEntity = Mapper.Map<billing_Invoice>(invoice);
                        await _invoiceRepository.LoadAsync(invoiceEntity, i => i.Policy);

                        if (invoiceEntity.Policy.CommissionPercentage > 0
                            || invoiceEntity.Policy.AdminPercentage > 0)
                        {
                            var amountAllocated = invoice.TotalInvoiceAmount - invoice.Balance;
                            var commision = new CommissionInvoicePaymentAllocation()
                            {
                                InvoiceId = invoiceEntity.InvoiceId,
                                Amount = decimal.Negate(amountAllocated),
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                IsProcessed = false
                            };
                            commissionAllocations.Add(commision);
                        }
                    }
                }
                try
                {
                    if (commissionAllocations.Count > 0)
                        await _commissionService.AddCommissions(commissionAllocations);
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
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

        public async Task<decimal> GetDebtorOutstandingTotalBalance(int rolePlayerId)
        {
            decimal _outstandingInvoices = 0.00m;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var trns = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId && t.TransactionType == TransactionTypeEnum.Invoice).ToListAsync();
                trns.ForEach(trn => { _outstandingInvoices += GetTransactionBalance(trn.TransactionId).Result; });
            }
            return _outstandingInvoices;
        }
        public async Task<bool> DoesDebtorHaveOutstandingInvoices(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var hasOutstandingInvoices = false;
                var transactions = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId && t.TransactionType == TransactionTypeEnum.Invoice).ToListAsync();

                foreach (var tran in transactions)
                {
                    if (await GetTransactionBalance(tran.TransactionId) > 0)
                    {
                        hasOutstandingInvoices = true;
                    }
                }

                return hasOutstandingInvoices;
            }
        }

        public async Task DoDebitReallocation(CreditNoteReversals creditNoteReversals)
        {
            if (creditNoteReversals != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var periodId = 0;
                    var transactionDate = DateTime.Now.ToSaDateTime();
                    var latestPeriod = await _periodService.GetLatestPeriod();
                    if (latestPeriod != null)
                    {
                        periodId = latestPeriod.Id;
                    }
                    else
                    {
                        periodId = await GetPeriodId(PeriodStatusEnum.Current);
                    }

                    foreach (var transaction in creditNoteReversals.Transactions)
                    {
                        var bankStatementEntry = await _facsStatementRepository.FirstOrDefaultAsync(c => c.BankStatementEntryId == transaction.BankStatementEntryId);
                        var reversalTransactionEntry = new Transaction
                        {
                            Amount = transaction.ReallocatedAmount,
                            BankStatementEntryId = transaction.BankStatementEntryId,
                            Reason = transaction.Reason,
                            RolePlayerId = transaction.RolePlayerId,
                            TransactionType = TransactionTypeEnum.DebitReallocation,
                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                            LinkedTransactionId = transaction.TransactionId,
                            IsReAllocation = true,
                            TransactionDate = transactionDate,
                            PeriodId = periodId
                        };
                        if (bankStatementEntry != null)
                            reversalTransactionEntry.BankReference = bankStatementEntry.BankAccountNumber.TrimStart(new Char[] { '0' });

                        string reference;
                        var reversal = new billing_Transaction();
                        var tranEntity = Mapper.Map<billing_Transaction>(transaction);
                        await _transactionRepository.LoadAsync(tranEntity, t => t.InvoiceAllocations_TransactionId);
                        if (tranEntity.InvoiceAllocations_TransactionId.Count > 0)
                        {
                            var invoiceAllocation = tranEntity.InvoiceAllocations_TransactionId.First();
                            var invoiceEntity = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == invoiceAllocation.InvoiceId);
                            if (creditNoteReversals.IsPaymentReAllocation)
                            {
                                reference = invoiceEntity != null
                                    ? $"Payment Re-Allocation to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber} : {invoiceEntity.InvoiceNumber}"
                                    : $"Payment Re-Allocation to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber}";
                            }
                            else if (creditNoteReversals.IsCreditNoteReAllocation)
                            {
                                reference = invoiceEntity != null
                                    ? $"Credit Note Re-Allocation to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber} : {invoiceEntity.InvoiceNumber}"
                                    : $"Credit Note Re-Allocation to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber}";
                            }
                            else
                            {
                                reference = invoiceEntity != null
                                    ? $"Credit Re-Allocation to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber} : {invoiceEntity.InvoiceNumber}"
                                    : $"Credit Re-Allocation to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber}";
                            }
                        }
                        else
                        {
                            reference = creditNoteReversals.IsPaymentReAllocation ? $"Payment Re-Allocation to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber}" : $"Credit Note Re-Allocation to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber}";
                        }

                        var creditTransactionBalance = await GetTransactionBalance(transaction.TransactionId);
                        var reAllocationBalance = Math.Abs(creditTransactionBalance) - transaction.ReallocatedAmount;

                        reversalTransactionEntry.RmaReference = reference;
                        reversalTransactionEntry.Balance = reAllocationBalance > 0 ? 0 : Math.Abs(reAllocationBalance);

                        if (transaction.ReallocatedAmount == 0)
                            continue;

                        //reversals of previous allocations
                        await AllocateDebitTransaction(reversalTransactionEntry, transaction.RolePlayerId,
                            transaction.ReallocatedAmount, transaction.TransactionId); ;


                        var fromNote = new BillingNote
                        {
                            ItemId = creditNoteReversals.RolePlayerId,
                            ItemType = BillingNoteTypeEnum.ReAllocation.GetDescription(),
                            Text = $"Credit Re-allocation of amount: {transaction.Amount} to {creditNoteReversals.ReAllocationReceiverFinPayeeNumber}"
                        };
                        await _billingService.AddBillingNote(fromNote);

                        if (creditNoteReversals.ToRolePlayerId.HasValue)
                        {
                            var toNote = new BillingNote
                            {
                                ItemId = creditNoteReversals.RolePlayerId,
                                ItemType = BillingNoteTypeEnum.ReAllocation.GetDescription(),
                                Text = $"Credit Re-allocation of amount: {transaction.Amount} from {creditNoteReversals.FinPayeeNumber}"
                            };
                            await _billingService.AddBillingNote(toNote);
                        }
                    }

                    await scope.SaveChangesAsync();
                }
            }
        }

        private async Task DoCreditReallocation(CreditNoteAccount creditNoteAccount)
        {
            if (creditNoteAccount != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var periodId = 0;
                    var transactionDate = DateTime.Now;
                    var latestPeriod = await _periodService.GetLatestPeriod();
                    if (latestPeriod != null)
                    {
                        periodId = latestPeriod.Id;
                    }
                    else
                    {
                        periodId = await GetPeriodId(PeriodStatusEnum.Current);
                    }

                    foreach (var transaction in creditNoteAccount?.Transactions)
                    {
                        var bankStatementEntry = await _facsStatementRepository.FirstOrDefaultAsync(c => c.BankStatementEntryId == transaction.BankStatementEntryId);
                        var reference = creditNoteAccount.IsPaymentReAllocation ? $"Payment Re-Allocation from {creditNoteAccount.ReAllocationOriginalFinPayeeNumber}"
                            : $"Credit Note Re-Allocation from {creditNoteAccount.ReAllocationOriginalFinPayeeNumber}";
                        if (transaction.ReallocatedAmount == 0)
                            continue;
                        transaction.TransactionType = TransactionTypeEnum.CreditReallocation;
                        transaction.Reason = creditNoteAccount?.Note?.Text;
                        transaction.RmaReference = reference;
                        transaction.BankReference = string.Empty;
                        transaction.TransactionDate = transactionDate;
                        transaction.TransactionTypeLinkId = (int)TransactionActionType.Credit;
                        transaction.RolePlayerId = creditNoteAccount.RolePlayerId;
                        transaction.IsReAllocation = true;
                        transaction.TransactionId = 0;
                        transaction.Amount = transaction.ReallocatedAmount;
                        transaction.PeriodId = periodId;
                        if (bankStatementEntry != null)
                            transaction.BankReference = bankStatementEntry.BankAccountNumber.TrimStart(new Char[] { '0' });
                        await AllocateCreditTransaction(transaction, creditNoteAccount.RolePlayerId, transaction.Amount, transaction.InvoiceId, null, creditNoteAccount.PolicyIds);
                    }

                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task DoReallocation(CreditNoteReversals creditNoteReversals, CreditNoteAccount creditNoteAccount)
        {
            if (creditNoteAccount != null && creditNoteReversals != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    await DoDebitReallocation(creditNoteReversals);
                    await DoCreditReallocation(creditNoteAccount);
                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<bool> DoDebitTransactionAllocations(List<ManualPaymentAllocation> manualPaymentAllocations)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            if (manualPaymentAllocations == null || manualPaymentAllocations.Count == 0)
                return await Task.FromResult(false);

            billing_Transaction paymentTransaction = null;
            billing_UnallocatedPayment unallocatedPayment = null;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var tranId = manualPaymentAllocations[0].UnallocatedTransactionId;
                var leaveBalanceInSuspense = manualPaymentAllocations[0].LeaveBalanceInSuspenceAccount;

                paymentTransaction = await _transactionRepository.SingleOrDefaultAsync(t => t.TransactionId == tranId);

                if (paymentTransaction == null)
                {
                    var unallocatedPaymentId = manualPaymentAllocations[0].UnallocatedPaymentId;
                    unallocatedPayment = await _unallocatedPaymentRepository.FindByIdAsync(unallocatedPaymentId);
                    await _unallocatedPaymentRepository.LoadAsync(unallocatedPayment, a => a.BankStatementEntry);

                    var statementReference =
                        unallocatedPayment.BankStatementEntry.StatementNumber + "/" +
                        unallocatedPayment.BankStatementEntry.StatementLineNumber + " " +
                        (unallocatedPayment.BankStatementEntry.StatementDate?.Date.ToString("dd/MM/yyyy") ??
                         string.Empty);

                    paymentTransaction = new billing_Transaction()
                    {
                        Amount = leaveBalanceInSuspense ? manualPaymentAllocations.Sum(s => s.AllocatedAmount) : unallocatedPayment.UnallocatedAmount,
                        TransactionDate = await DeriveTransactionDateBasedOnPeriodStatus(manualPaymentAllocations[0].PeriodStatus),
                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                        TransactionType = manualPaymentAllocations[0].IsClaimRecoveryPayment ? TransactionTypeEnum.ClaimRecoveryPayment : TransactionTypeEnum.Payment,
                        BankStatementEntryId = unallocatedPayment.BankStatementEntryId,
                        RolePlayerId = manualPaymentAllocations[0].RolePlayerId,
                        RmaReference = statementReference,
                        PeriodId = await GetPeriodId(manualPaymentAllocations[0].PeriodStatus)
                    };

                    _transactionRepository.Create(paymentTransaction);
                }

                if (unallocatedPayment != null)
                {
                    unallocatedPayment.UnallocatedAmount = leaveBalanceInSuspense ? unallocatedPayment.UnallocatedAmount - manualPaymentAllocations.Sum(s => s.AllocatedAmount) : 0;
                    if (unallocatedPayment.UnallocatedAmount == 0)
                    {
                        unallocatedPayment.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;
                    }

                    _unallocatedPaymentRepository.Update(unallocatedPayment);
                }

                await scope.SaveChangesAsync();
            }

            await PostPaymentToGeneralLedger(unallocatedPayment, paymentTransaction);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var tran = await _transactionRepository.SingleAsync(t => t.TransactionId == paymentTransaction.TransactionId);

                foreach (var manualPaymentAllocation in manualPaymentAllocations)
                {
                    var createdTransactionId = await AllocateCreditTransactionToDebitTransaction(manualPaymentAllocation.DebitTransaction, Mapper.Map<Transaction>(tran), manualPaymentAllocation.AllocatedAmount);
                    await AllocateToTermsArrangement(manualPaymentAllocation.RolePlayerId, manualPaymentAllocation.AllocatedAmount, DateTime.Now, createdTransactionId);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> AutoAllocateRefund(decimal amount, int refundHeaderId, int bankStatementEntryId, string statementReference)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    int createdTransactionId = 0;
                    var refundHeader = await _refundHeaderRepository.Where(r => r.RefundHeaderId == refundHeaderId).FirstOrDefaultAsync();

                    if (refundHeader == null)
                    {
                        return await Task.FromResult(false);
                    }

                    var termScheduleRefundBreakDowns = await _termsArrangementService.GetTermScheduleRefundBreakDown(refundHeader.RolePlayerId);
                    var refundHeaderDetailList = await _refundHeaderDetailRepository.Where(r => r.RefundHeaderId == refundHeader.RefundHeaderId).ToListAsync();

                    if (refundHeaderDetailList.Count > 0)
                    {
                        foreach (var refundDetail in refundHeaderDetailList)
                        {
                            var transaction = new Transaction
                            {
                                Amount = Math.Abs(refundDetail.TotalAmount),
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                TransactionType = TransactionTypeEnum.Refund,
                                BankStatementEntryId = bankStatementEntryId,
                                RolePlayerId = refundHeader.RolePlayerId,
                                RmaReference = statementReference,
                                PeriodId = refundHeader.PeriodId,
                            };
                            if (refundDetail.TransactionId.HasValue)
                                transaction.LinkedTransactionId = refundDetail.TransactionId.Value;

                            createdTransactionId = await AllocateDebitTransaction(transaction, refundHeader.RolePlayerId, transaction.Amount, refundDetail.TransactionId);
                            if (createdTransactionId > 0)
                            {
                                refundDetail.TransactionId = createdTransactionId;
                                _refundHeaderDetailRepository.Update(refundDetail);
                            }

                            var termScheduleRefundBreakDown = termScheduleRefundBreakDowns.FirstOrDefault(x => x.TransactionId == refundDetail.TransactionId);

                            if (termScheduleRefundBreakDown == null) { continue; }

                            if (refundHeader.Reason == RefundTypeEnum.TermsOverpayment.GetDescription().SplitCamelCaseText())
                            {
                                var termarrangements = await _termsArrangementService.GetActiveArrangementsByRoleplayer(refundHeader.RolePlayerId, 0);
                                if (termarrangements.Count > 0)
                                {
                                    var termarrangement = termarrangements.FirstOrDefault();
                                    var headerDetailRefundAmountRemaining = refundDetail.TotalAmount;
                                    var amountRefunded = await _termsArrangementService.RefundTermSchedulesAllocations(createdTransactionId, termScheduleRefundBreakDown, headerDetailRefundAmountRemaining);
                                    headerDetailRefundAmountRemaining -= amountRefunded;
                                }
                            }
                        }
                    }
                    else
                    {
                        return await Task.FromResult(false);
                    }

                    return (await scope.SaveChangesAsync()) > 0;
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
                return await Task.FromResult(false);
            }
        }

        public async Task<int> AllocateCreditTransactionToDebitTransaction(Transaction debitTransaction, Transaction creditTransaction, decimal amountToAllocate)
        {
            Contract.Requires(creditTransaction != null);
            Contract.Requires(debitTransaction != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            var allocationAmount = 0.00m;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var debitTranBalance = await GetTransactionBalance(debitTransaction.TransactionId);

                if (debitTranBalance <= 0 || amountToAllocate <= 0)
                {
                    return await Task.FromResult(0);
                }

                if (creditTransaction != null && creditTransaction.TransactionId <= 0)
                {
                    return await Task.FromResult(0);
                }

                var transactionBalance = await GetTransactionBalance(creditTransaction.TransactionId);
                transactionBalance = Math.Abs(transactionBalance);
                if (transactionBalance <= 0)
                {
                    return await Task.FromResult(0);
                }

                if (debitTransaction.TransactionType != TransactionTypeEnum.PaymentReversal)
                {
                    allocationAmount = amountToAllocate < debitTranBalance ? amountToAllocate : debitTranBalance;
                }

                var entity = Mapper.Map<billing_Transaction>(debitTransaction);

                if (debitTransaction.TransactionType != TransactionTypeEnum.PaymentReversal)
                {
                    Invoice invoice = null;
                    if (debitTransaction.InvoiceId > 0)
                    {
                        invoice = await _invoiceService.GetInvoice(Convert.ToInt32(debitTransaction.InvoiceId));
                    }

                    PolicyModel policy = null;
                    if (invoice != null)
                    {
                        policy = await _policyService.GetPolicyWithProductOptionByPolicyId(invoice.PolicyId);
                    }

                    entity.Balance -= allocationAmount;

                    if (entity.Balance < 0)
                    {
                        entity.Balance = 0;
                    }


                    var creditTransactionEntity = Mapper.Map<billing_Transaction>(creditTransaction);
                    _transactionRepository.Update(creditTransactionEntity);

                    billing_InvoiceAllocation invoiceAllocation = new billing_InvoiceAllocation()
                    {
                        TransactionId = creditTransaction.TransactionId,
                        Amount = allocationAmount,
                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                        LinkedTransactionId = debitTransaction.TransactionId,
                        ProductCategoryType = (policy != null) ? policy.ProductCategoryType : null
                    };

                    if (invoice != null)
                    {
                        invoiceAllocation.InvoiceId = invoice.InvoiceId;
                    }

                    if (debitTransaction.TransactionType == TransactionTypeEnum.Interest)
                    {
                        invoiceAllocation.BillingAllocationType = BillingAllocationTypeEnum.InterestAllocation;
                    }
                    else
                    {   //allocate other transaction types
                        invoiceAllocation.BillingAllocationType = BillingAllocationTypeEnum.DebitNoteAllocation;
                    }

                    //save debit Allocations
                    _invoiceAllocationRepository.Create(invoiceAllocation);
                }
                else
                {
                    entity.LinkedTransactionId = creditTransaction.TransactionId;
                    entity.Balance = null;
                }
                _transactionRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.TransactionId;
            }

        }

        public async Task<bool> BulkPremiumTransfer(BulkPremiumTransfer bulkPremiumTransfer)
        {
            if (bulkPremiumTransfer == null || bulkPremiumTransfer.PremiumTransferList.Count == 0)
                return await Task.FromResult(false);

            try
            {
                // Save to BulkPremiumTransferHeader and BulkPremiumTransferDetail
                // 
                foreach (var transfer in bulkPremiumTransfer.PremiumTransferList)
                {
                    // Allocate Premiums, if all or nothing, put this whole forEarch in Scope Transaction

                }
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                ex.LogException();
                return await Task.FromResult(false);
            }
        }


        public async Task<bool> BulkManualAllocations(FileContentModel content)
        {
            try
            {
                if (content == null)
                {
                    throw new NullReferenceException("File content cannot be null");
                }
                if (string.IsNullOrEmpty(content.Data))
                {
                    throw new NullReferenceException("File content cannot be null");
                }

                var fileName = string.Empty;

                if (!string.IsNullOrEmpty(content.FileName))
                    fileName = content.FileName;

                var decodedString = Convert.FromBase64String(content.Data);
                var fileData = Encoding.UTF8.GetString(decodedString, 0, decodedString.Length);

                const string newLine = "\n";
                var csvParserOptions = new CsvParserOptions(true, ';');
                var csvMapper = new BulkManualAllocationMapping();
                var csvParser = new CsvParser<Load_BulkManualAllocation>(csvParserOptions, csvMapper);
                var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
                var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

                var rowNumber = 1;
                var fileIdentifier = Guid.NewGuid();
                var allocations = new List<Load_BulkManualAllocation>();

                var bulkAllocationFile = await SaveBulkAllocationsFileDetails(fileIdentifier, fileName);

                foreach (var record in records)
                {
                    if (!record.IsValid)
                    {
                        var line = record.Error.UnmappedRow;
                        var message = GetValidationMessage(line, rowNumber, record.Error);

                        using (var scope = _dbContextScopeFactory.Create())
                        {
                            bulkAllocationFile.IsDeleted = true;
                            _bulkAllocationFileRepository.Update(bulkAllocationFile);
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                        }
                        throw new Exception(message);
                    }
                    var allocation = record.Result;
                    allocation.BulkAllocationFileId = bulkAllocationFile.BulkAllocationFileId;
                    allocations.Add(allocation);
                    rowNumber++;
                }
                await StageBatchAllocations(allocations);

                var producer = new ServiceBusQueueProducer<BulkAllocationMessage>(BulkAllocationsQueueName);
                await producer.PublishMessageAsync(new BulkAllocationMessage()
                {
                    FileId = bulkAllocationFile.BulkAllocationFileId
                });

                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                ex.LogException();
                return await Task.FromResult(false);
            }
        }

        private string GetValidationMessage(string line, int rowNumber, CsvMappingError error)
        {
            var values = line.Split(new char[] { commaDelimiter });

            if (values.Length == 1)
            {
                return "Invalid file delimiter found. Please check file structure";
            }
            else if (values.Length < 9)
            {
                return $"All the required data has not been supplied on line {rowNumber}.";
            }
            return $"Error on line {rowNumber} column {error.ColumnIndex}: {error.Value}";
        }

        private async Task<int> StageBatchAllocations(List<Load_BulkManualAllocation> allocations)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    string sql;
                    var recordCount = 0;
                    const int importCount = 1000;
                    while (allocations.Count > 0)
                    {
                        var count = allocations.Count >= importCount ? importCount : allocations.Count;
                        var records = allocations.GetRange(0, count);
                        sql = GetPaymentsAllocationSql(records);
                        await _transactionRepository.ExecuteSqlCommandAsync(sql);
                        allocations.RemoveRange(0, count);
                        recordCount += count;
                    }
                    return recordCount;
                }
                catch (Exception ex)
                {
                    ex.LogException(ex.Message);
                    return 0;
                }
            }

        }

        private string GetPaymentsAllocationSql(List<Load_BulkManualAllocation> records)
        {
            var sbQuery = new StringBuilder();
            var sql = "INSERT INTO Load.BulkManualAllocation (BankAccountNumber,UserReference,StatementReference,TransactionDate,Amount,UserReference2,AllocateTo,BulkAllocationFileId) values";
            sbQuery.Append(sql);
            foreach (var rec in records)
            {
                var valuesQuery = string.Format("({0},{1},{2},{3},{4},{5},{6},{7}),",
                       SetLength(rec.BankAccountNumber, 30).Quoted(),
                       SetLength(rec.UserReference, 200).Quoted(),
                       SetLength(rec.StatementReference, 50).Quoted(),
                       SetLength(rec.TransactionDate, 12).Quoted(),
                       SetLength(rec.Amount, 30).Quoted(),
                       SetLength(rec.UserReference2, 100).Quoted(),
                       SetLength(rec.AllocateTo, 20).Quoted(),
                       SetLength(rec.BulkAllocationFileId.ToString(), 50).Quoted());

                sbQuery.Append(valuesQuery);
            }
            return sbQuery.ToString().TrimEnd(new char[] { ',' });
        }


        private string SetLength(string value, int len)
        {
            value = value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }


        public async Task FinalizeBulkAllocation(BulkAllocationMessage message)
        {
            var fileId = message?.FileId;
            _ = Task.Run(() => DoBackGroundBulkAllocations((int)fileId));
        }


        private async Task<Load_BulkAllocationFile> SaveBulkAllocationsFileDetails(Guid fileIdentifier, string fileName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_BulkAllocationFile
                {
                    FileIdentifier = fileIdentifier,
                    FileName = fileName,
                    IsDeleted = false
                };
                var created = _bulkAllocationFileRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return created;
            }
        }

        public async Task<List<BulkAllocationFile>> GetBulkPaymentFiles()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _bulkAllocationFileRepository.Where(c => !c.IsDeleted).OrderByDescending(c => c.BulkAllocationFileId).ToListAsync();
                return Mapper.Map<List<BulkAllocationFile>>(results);
            }
        }

        public async Task<List<BulkManualAllocation>> GetBulkPaymentFileDetails(int fileId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _bulkManualAllocationRepository
                .Where(c => !c.IsDeleted && c.BulkAllocationFileId == fileId)
                .ToListAsync();

                return Mapper.Map<List<BulkManualAllocation>>(results);
            }
        }

        public async Task<int> DeleteBulkAllocations(List<int> content)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var items = await _bulkManualAllocationRepository.Where(c => content.Contains(c.Id)).ToListAsync();
                foreach (var item in items)
                {
                    item.IsDeleted = true;
                }
                _bulkManualAllocationRepository.Update(items);

                await scope.SaveChangesAsync();
            }
            return 1;
        }

        public async Task<int> EditBulkAllocations(List<BulkManualAllocation> content)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var contentIds = content.Select(d => d.Id).ToList();
                var items = await _bulkManualAllocationRepository.Where(c => contentIds.Contains(c.Id)).ToListAsync();
                foreach (var item in items)
                {
                    var contentItem = content.FirstOrDefault(c => c.Id == item.Id);
                    item.Amount = contentItem.Amount;
                    item.AllocateTo = contentItem.AllocateTo;
                    item.UserReference = contentItem.UserReference;
                    item.UserReference2 = contentItem.UserReference2;
                    item.LineProcessingStatusId = (int)FileLineItemProcessingStatusEnum.ReQueued;
                }
                _bulkManualAllocationRepository.Update(items);

                await scope.SaveChangesAsync();
                await ResetBulkAllocationScheduledTask();
                return 1;
            }
        }

        private async Task<bool> ResetBulkAllocationScheduledTask()
        {
            bool isSent = false;
            try
            {
                //var scheduledTasks = await _scheduledTaskService.ScheduledTasks();
                //var scheduledTaskName = ConfiguredScheduledTasksEnum.FinalizeBulkAllocations.DisplayAttributeValue();
                //var scheduledTask = scheduledTasks.FirstOrDefault(s => s.ScheduledTaskType.Description == scheduledTaskName);
                //if (scheduledTask != null)
                //{
                //    var scheduleId = scheduledTask.ScheduledTaskId;
                //    _ = await _scheduledTaskService.ResetToCurrentDateAndTime(scheduleId);
                //}
                ///TO DO: Crreate ScheduleTask Listerner then  Publish this message to Service Bus Queue
                isSent = true;
            }
            catch (Exception ex)
            {
                ex.LogException("No scheduler configured to Finalize Bulk Allocations");
            }
            return await Task.FromResult(isSent);
        }
        public async Task<int> AllocatePremiumPaymentToDebtorAndInvoice(PremiumPaymentRequest request)
        {
            var manualPaymentAllocations = request?.ManualPaymentAllocations;
            var source = request?.Source;
            var linkedTransactionId = 0;

            if (manualPaymentAllocations?.Count > 0)
            {
                var invoices = await GetOpenInvoicesForDebtor(manualPaymentAllocations[0].RolePlayerId);

                if (source == (int)PremiumListingPaymentSourceEnum.Debtor)
                {
                    linkedTransactionId = manualPaymentAllocations[0].UnallocatedTransactionId;
                }

                if (source == (int)PremiumListingPaymentSourceEnum.Suspense)
                {
                    if (invoices.Count == 1)
                    {
                        manualPaymentAllocations[0].InvoiceId = invoices[0].InvoiceId;
                        await AllocatePaymentsToInvoices(manualPaymentAllocations);
                    }
                    else
                    {
                        await AllocatePaymentsToDebtor(manualPaymentAllocations);
                    }

                    using (_dbContextScopeFactory.CreateReadOnly())
                    {
                        var bankStatementEntryId = manualPaymentAllocations[0].BankStatementEntryId;
                        var unallocatedPaymentId = manualPaymentAllocations[0].UnallocatedPaymentId;
                        var rolePlayerId = manualPaymentAllocations[0].RolePlayerId;

                        if (!bankStatementEntryId.HasValue && unallocatedPaymentId > 0)
                        {
                            var unallocatedPayment = await _unallocatedPaymentRepository.FirstOrDefaultAsync(t =>
                                                        t.UnallocatedPaymentId == unallocatedPaymentId);
                            bankStatementEntryId = unallocatedPayment.BankStatementEntryId;
                        }

                        if (bankStatementEntryId > 0)
                        {
                            var transaction = await _transactionRepository.OrderByDescending(t => t.TransactionId)
                            .FirstOrDefaultAsync(t => (t.BankStatementEntryId == bankStatementEntryId)
                                     && t.RolePlayerId == rolePlayerId);

                            linkedTransactionId = transaction.TransactionId;
                        }

                        return linkedTransactionId;
                    }

                }
                else if (source == (int)PremiumListingPaymentSourceEnum.Debtor && invoices.Count == 1)
                {

                    manualPaymentAllocations[0].InvoiceId = invoices[0].InvoiceId;
                    await AllocatePaymentsToInvoices(manualPaymentAllocations);
                }
            }

            return linkedTransactionId;
        }


        private async Task<List<Invoice>> GetOpenInvoicesForDebtor(int rolePlayeId)
        {
            var invoices = new List<Invoice>();
            var policies = await _rolePlayerPolicyService.GetTotalNumberOfPoliciesOwnedByRoleplayer(rolePlayeId);
            if (policies.Count == 1)
            {
                invoices = await _invoiceService.GetUnsettledInvoices(rolePlayeId, null);
            }
            return invoices;
        }

        public async Task<bool> AllocatePaymentTransactionToInvoice(Transaction paymentTransaction, decimal amountToAllocate, int invoiceId)
        {
            await AllocateCreditTransactionToInvoice(paymentTransaction, amountToAllocate, invoiceId);
            return true;
        }


        public async Task ReduceUnallocatedBalance(int bankstatementEntryId, decimal allocatedAmount)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var unallocated = await _unallocatedPaymentRepository.Where(x => x.BankStatementEntryId == bankstatementEntryId && !x.IsDeleted).ToListAsync();
                if (unallocated != null && unallocated.Count == 1)
                {//reduce unallocated amount balance of previously unallocated item
                    var itemToUpdate = unallocated.FirstOrDefault();
                    var previousUnallocatedAmount = itemToUpdate.UnallocatedAmount;
                    if (previousUnallocatedAmount < 0)
                        previousUnallocatedAmount = decimal.Negate(previousUnallocatedAmount);


                    if (previousUnallocatedAmount + decimal.Negate(allocatedAmount) == 0)
                    {
                        itemToUpdate.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;
                        itemToUpdate.UnallocatedAmount = 0;
                    }
                    else
                    {
                        itemToUpdate.UnallocatedAmount = previousUnallocatedAmount + decimal.Negate(allocatedAmount);
                    }
                    _unallocatedPaymentRepository.Update(unallocated);
                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<decimal> AllocateToTermsArrangement(int roleplayerId, decimal amount, DateTime statementdate, int transactionId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                decimal totalAllocated = 0;
                var termArrangements = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId && t.IsActive && !t.IsDeleted
                && t.TermArrangementStatus != TermArrangementStatusEnum.Paid
                && t.TermArrangementStatus != TermArrangementStatusEnum.Unsuccessful).ToListAsync();

                foreach (var termArrangement in termArrangements)
                {
                    if (termArrangement != null && termArrangement.TermArrangementStatus != TermArrangementStatusEnum.Paid)
                    {
                        decimal totalAllocatedToTerm = 0;
                        var debtor = await _rolePlayerService.GetFinPayeeByRolePlayerId((int)termArrangement.RolePlayerId);
                        var allocationAmount = amount;
                        await _termArrangementRepository.LoadAsync(termArrangement, x => x.TermArrangementSchedules);
                        var lastFullyPaidSchedule = new billing_TermArrangementSchedule() { TermArrangementScheduleId = 0 };
                        if (termArrangement.TermArrangementSchedules.Count > 0)
                        {
                            var termArrangementSchedules = termArrangement.TermArrangementSchedules.Where(x => x.TermArrangementScheduleStatus != TermArrangementScheduleStatusEnum.Paid).ToList();
                            foreach (var termArrangementSchedule in termArrangementSchedules.OrderBy(c => c.TermArrangementScheduleId))
                            {
                                termArrangementSchedule.AllocationDate = statementdate;

                                var scheduleAllocation = new billing_TermScheduleAllocation();
                                scheduleAllocation.TransactionId = transactionId;
                                scheduleAllocation.TermArrangmentScheduleId = termArrangementSchedule.TermArrangementScheduleId;

                                if (allocationAmount > 0 && allocationAmount >= termArrangementSchedule.Balance)
                                {
                                    scheduleAllocation.Amount = termArrangementSchedule.Balance;
                                    allocationAmount -= termArrangementSchedule.Balance;
                                    totalAllocated += scheduleAllocation.Amount;
                                    totalAllocatedToTerm += scheduleAllocation.Amount;
                                    termArrangementSchedule.Balance -= termArrangementSchedule.Balance;
                                    termArrangementSchedule.TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.Paid;
                                    _termArrangementScheduleRepository.Update(termArrangementSchedule);
                                    if (termArrangementSchedule.Balance <= 100) { lastFullyPaidSchedule = termArrangementSchedule; }
                                    _termScheduleAllocationRepository.Create(scheduleAllocation);
                                }
                                else if (allocationAmount > 0 && allocationAmount < termArrangementSchedule.Balance)
                                {
                                    scheduleAllocation.Amount = allocationAmount;
                                    totalAllocated += scheduleAllocation.Amount;
                                    totalAllocatedToTerm += scheduleAllocation.Amount;
                                    termArrangementSchedule.Balance -= allocationAmount;
                                    allocationAmount -= scheduleAllocation.Amount;
                                    termArrangementSchedule.TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.PartiallyPaid;
                                    _termArrangementScheduleRepository.Update(termArrangementSchedule);
                                    if (termArrangementSchedule.Balance <= 100)
                                        lastFullyPaidSchedule = termArrangementSchedule;
                                    _termScheduleAllocationRepository.Create(scheduleAllocation);
                                    break;
                                }
                            }
                        }

                        termArrangement.Balance -= totalAllocatedToTerm;

                        if (termArrangement.Balance <= 0)
                        {
                            termArrangement.Balance = 0;
                            termArrangement.TermArrangementStatus = TermArrangementStatusEnum.Paid;
                            debtor.DebtorStatus = null;
                            await SendOutLogForPaidUpTermArrangement((int)termArrangement.RolePlayerId);
                        }

                        else if (lastFullyPaidSchedule.TermArrangementScheduleId > 0 && termArrangement.Balance > 0)
                        {
                            await SendOutLogForPaidUpTermSchedule(lastFullyPaidSchedule, (int)termArrangement.RolePlayerId);
                        }
                        else if (lastFullyPaidSchedule.TermArrangementScheduleId == 0 && termArrangement.Balance > 0 && totalAllocatedToTerm > 0)
                        {
                            termArrangement.TermArrangementStatus = TermArrangementStatusEnum.PartiallyPaid;
                        }

                        _termArrangementRepository.Update(termArrangement);
                        await _rolePlayerService.UpdateFinPayee(debtor);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }


                return totalAllocated;
            }
        }

        public async Task<bool> AddPaymentToUnallocatedPaymentUsingBankstatementEntry(int bankstatementEntryId, decimal amount, int rolePlayerId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _unallocatedPaymentRepository.FirstOrDefaultAsync(x => x.BankStatementEntryId == bankstatementEntryId && !x.IsDeleted);

                if (entity != null)
                {
                    var previousUnallocatedAmount = entity.UnallocatedAmount;
                    entity.UnallocatedAmount = previousUnallocatedAmount + amount;
                    entity.AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated;

                    if (entity?.RoleplayerId == 0)
                    {
                        entity.RoleplayerId = rolePlayerId;
                    }
                    _unallocatedPaymentRepository.Update(entity);
                }
                else
                {
                    var newUnallocatedPayment = new billing_UnallocatedPayment()
                    {
                        BankStatementEntryId = bankstatementEntryId,
                        UnallocatedAmount = amount,
                        AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                        RoleplayerId = rolePlayerId,
                    };

                    _unallocatedPaymentRepository.Create(newUnallocatedPayment);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return await Task.FromResult(true);
        }

        public async Task<List<InvoiceAllocation>> GetTransactionInvoiceAllocations(int transactionId)
        {
            var allocations = new List<InvoiceAllocation>();
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = await _invoiceAllocationRepository.Where(x => x.TransactionId == transactionId && !x.IsDeleted).ToListAsync();

                if (entities != null)
                {
                    allocations = Mapper.Map<List<InvoiceAllocation>>(entities);
                    return allocations;
                }
            }
            return allocations;
        }

        private async Task DoBackGroundBulkAllocations(int fileId)
        {
            try
            {
                using (_dbContextScopeFactory.Create())
                {
                    await _transactionRepository.ExecuteSqlCommandAsync(DatabaseConstants.BulkAllocateStagedAllocations, new SqlParameter { ParameterName = "@fileId", Value = fileId });
                    await SendBulkAllocationCompletedNotification(fileId);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"FinalizeBulkAllocation Background Process Failure > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
        }

        private async Task<int> SendBulkAllocationCompletedNotification(int fileId)
        {
            try
            {
                var parameters = $"&fileId={fileId}&rs:Command=ClearSession";
                var reportPath = "RMABulkAllocationExceptionReport";
                Load_BulkAllocationFile bulkAllocationFile = new Load_BulkAllocationFile();

                using (_dbContextScopeFactory.Create())
                {
                    bulkAllocationFile = await _bulkAllocationFileRepository.FirstOrDefaultAsync(c => c.BulkAllocationFileId == fileId);
                }

                if (!string.IsNullOrEmpty(bulkAllocationFile.CreatedBy))
                {
                    var logs = await GetUriDocumentByteData(new Uri($"{fincareportServerUrl}/{reportPath}{parameters}&rs:Format=PDF"), _headerCollection);

                    var attachments = new List<MailAttachment>
                {
                new MailAttachment { AttachmentByteData = logs, FileName = "BulkAllocationsExceptionReport.pdf", FileType = "application/pdf"},
                };

                    var emailAddress = bulkAllocationFile.CreatedBy;
                    return await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = fileId,
                        ItemType = "BulkAllocationFile",
                        FromAddress = fromAddress,
                        Recipients = emailAddress,
                        Subject = $"RMA Bulk Allocations",
                        Body = $"{bulkAllocationFile.FileName} Processing completed. Exception report attached.",
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    });
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send Bulk Allocation Exception Report:{fileId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
            return await Task.FromResult(0);
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        private async Task<int> ExceptionHandleAllocations(List<Load_BulkManualAllocation> allocations)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    string sql;
                    var recordCount = 0;
                    const int importCount = 1000;
                    while (allocations.Count > 0)
                    {
                        var count = allocations.Count >= importCount ? importCount : allocations.Count;
                        var records = allocations.GetRange(0, count);
                        sql = GetPaymentsAllocationSql(records);
                        await _transactionRepository.ExecuteSqlCommandAsync(sql);
                        allocations.RemoveRange(0, count);
                        recordCount += count;
                    }
                    return recordCount;
                }
                catch (Exception ex)
                {
                    ex.LogException(ex.Message);
                    return 0;
                }
            }

        }

        public async Task<bool> ExceptionFailedlAllocations(FileContentModel content)
        {
            try
            {
                if (content == null)
                {
                    throw new NullReferenceException("File content cannot be null");
                }
                if (string.IsNullOrEmpty(content.Data))
                {
                    throw new NullReferenceException("File content cannot be null");
                }

                var fileName = string.Empty;

                if (!string.IsNullOrEmpty(content.FileName))
                    fileName = content.FileName;

                var decodedString = Convert.FromBase64String(content.Data);
                var fileData = Encoding.UTF8.GetString(decodedString, 0, decodedString.Length);

                const string newLine = "\n";
                var csvParserOptions = new CsvParserOptions(true, ';');
                var csvMapper = new BulkManualAllocationMapping();
                var csvParser = new CsvParser<Load_BulkManualAllocation>(csvParserOptions, csvMapper);
                var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
                var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

                var rowNumber = 1;
                var fileIdentifier = Guid.NewGuid();
                var allocations = new List<Load_BulkManualAllocation>();

                var bulkAllocationFile = await SaveBulkAllocationsFileDetails(fileIdentifier, fileName);

                foreach (var record in records)
                {
                    if (!record.IsValid)
                    {
                        var line = record.Error.UnmappedRow;
                        var message = GetValidationMessage(line, rowNumber, record.Error);

                        using (var scope = _dbContextScopeFactory.Create())
                        {
                            bulkAllocationFile.IsDeleted = true;
                            _bulkAllocationFileRepository.Update(bulkAllocationFile);
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                        }
                        throw new Exception(message);
                    }
                    var allocation = record.Result;
                    allocation.BulkAllocationFileId = bulkAllocationFile.BulkAllocationFileId;
                    allocations.Add(allocation);
                    rowNumber++;
                }
                await ExceptionHandleAllocations(allocations);

                var producer = new ServiceBusQueueProducer<BulkAllocationMessage>(BulkAllocationsQueueName);
                await producer.PublishMessageAsync(new BulkAllocationMessage()
                {
                    FileId = bulkAllocationFile.BulkAllocationFileId
                });

                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                ex.LogException();
                return await Task.FromResult(false);
            }
        }

        public async Task<List<ExcptionAllocationFile>> GetExceptionAllocationFiles()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _bulkAllocationFileRepository.Where(c => !c.IsDeleted).OrderByDescending(c => c.BulkAllocationFileId).ToListAsync();
                return Mapper.Map<List<ExcptionAllocationFile>>(results);
            }
        }

        public async Task<List<ExceptionAllocation>> GetExceptionAllocationDetails(int fileId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _bulkManualAllocationRepository
                .Where(c => !c.IsDeleted && c.BulkAllocationFileId == fileId)
                .ToListAsync();

                return Mapper.Map<List<ExceptionAllocation>>(results);
            }
        }

        private async Task<string> CreateDebitNoteReferenceNumber()
        {
            return await _documentNumberService.GenerateDebitNoteDocumentNumber();
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

        private async Task SendOutLogForFullyPaidInvoice(Invoice invoice)
        {
            await _letterOfGoodStandingService.GenerateNextLetterOfGoodStanding(invoice.InvoiceNumber);
        }

        private async Task SendOutLogForPaidUpTermSchedule(billing_TermArrangementSchedule termArrangementSchedule, int roleplayerId)
        {
            var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(roleplayerId); ;
            var coidPolicy = policies.FirstOrDefault(p => p.ProductCategoryType == ProductCategoryTypeEnum.Coid);
            if (coidPolicy != null)
            {
                var finpayee = await _rolePlayerService.GetRolePlayer(coidPolicy.PolicyPayeeId);
                var billingCycle = await _billingService.GetCurrentBillingCycleByIndustryClass((IndustryClassEnum)finpayee.Company.IndustryClass);

                // original payment date
                var payDate = termArrangementSchedule.PaymentDate;

                var additionalDays = await _configurationService.GetModuleSetting(SystemSettings.TermArrangementAdditionalGraceDays);
                if (string.IsNullOrEmpty(additionalDays))
                {
                    additionalDays = "3";
                }

                var expiryDate = payDate.AddMonths(1).AddDays(additionalDays.ToDouble());

                await _letterOfGoodStandingService.GenerateLetterOfGoodStandingForDates(billingCycle.StartDate, expiryDate, finpayee.RolePlayerId, coidPolicy.PolicyId);
            }
        }

        private async Task SendOutLogForPaidUpTermArrangement(int roleplayerId)
        {
            var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(roleplayerId); ;
            var coidPolicy = policies.FirstOrDefault(p => p.ProductCategoryType == ProductCategoryTypeEnum.Coid);
            if (coidPolicy != null)
            {
                var finpayee = await _rolePlayerService.GetRolePlayer(coidPolicy.PolicyPayeeId);
                var billingCycle = await _billingService.GetCurrentBillingCycleByIndustryClass((IndustryClassEnum)finpayee.Company.IndustryClass);

                await _letterOfGoodStandingService.GenerateLetterOfGoodStandingForDates(billingCycle.StartDate, billingCycle.EndDate, finpayee.RolePlayerId, coidPolicy.PolicyId);
            }
        }

        public async Task<List<UnallocatedPayment>> GetUnallocatedPaymentsByBankStatementEntry(int bankStatementEntryId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var unallocatedPaymentEntities = await _unallocatedPaymentRepository
                    .Where(x => x.UnallocatedAmount != 0 && x.BankStatementEntryId == bankStatementEntryId
                        && x.AllocationProgressStatus == AllocationProgressStatusEnum.UnAllocated)
                    .ToListAsync();

                return Mapper.Map<List<UnallocatedPayment>>(unallocatedPaymentEntities);
            }
        }

        public async Task DoBouncedReallocation(List<Transaction> transactions, int? toRoleplayerId, string toFinpayeNumber, string fromFinpayenumber)
        {
            if (transactions != null)
            {
                string reasonTo = string.Empty;
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var periodId = 0;
                    var transactionDate = DateTime.Now.ToSaDateTime();
                    var latestPeriod = await _periodService.GetLatestPeriod();
                    var currentPeriod = await _periodService.GetCurrentPeriod();
                    if (latestPeriod != null)
                    {
                        periodId = latestPeriod.Id;
                    }
                    else
                    {
                        periodId = await GetPeriodId(PeriodStatusEnum.Current);
                    }

                    foreach (var transaction in transactions)
                    {
                        var entity = await _transactionRepository.FirstOrDefaultAsync(c => c.TransactionId == transaction.TransactionId);
                        var isTransferInClosedPeriod = false;
                        if (entity != null && entity.PeriodId.HasValue)
                        {
                            var originalTransactionPeriod = await _periodService.GetPeriodById(entity.PeriodId.Value);
                            if (originalTransactionPeriod != null)
                            {
                                if (originalTransactionPeriod.StartDate < currentPeriod.StartDate)
                                    isTransferInClosedPeriod = true;
                            }
                        }
                        var bankStatementEntry = await _facsStatementRepository.FirstOrDefaultAsync(c => c.BankStatementEntryId == transaction.BankStatementEntryId);
                        var creditTransactionEntry = new Transaction
                        {
                            Amount = transaction.Amount,
                            BankStatementEntryId = transaction.BankStatementEntryId,
                            RolePlayerId = transaction.RolePlayerId,
                            TransactionType = TransactionTypeEnum.CreditNote,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            LinkedTransactionId = transaction.TransactionId,
                            IsReAllocation = true,
                            TransactionDate = transactionDate,
                            PeriodId = periodId
                        };
                        string reasonFrom = isTransferInClosedPeriod ? $"Unmet Payment Re-Allocation to {toFinpayeNumber}" :
                           $"Unmet Payment Inter debtor transfer to {toFinpayeNumber}";
                        if (bankStatementEntry != null)
                        {
                            creditTransactionEntry.BankReference = bankStatementEntry.BankAccountNumber.TrimStart(new Char[] { '0' });
                        }
                        creditTransactionEntry.Reason = reasonFrom;

                        if (toRoleplayerId.HasValue && toRoleplayerId.Value > 0)
                        {
                            var reversalTransactionEntry = new Transaction
                            {
                                Amount = transaction.Amount,
                                BankStatementEntryId = transaction.BankStatementEntryId,
                                Reason = transaction.Reason,
                                RolePlayerId = toRoleplayerId.Value,
                                TransactionType = TransactionTypeEnum.PaymentReversal,
                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                IsReAllocation = true,
                                TransactionDate = transactionDate,
                                PeriodId = periodId
                            };

                            reasonTo = isTransferInClosedPeriod ? $"Unmet Payment Re-Allocation from {fromFinpayenumber}" :
                           $"Unmet Payment Inter debtor transfer from {toFinpayeNumber}";
                            if (bankStatementEntry != null)
                            {
                                reversalTransactionEntry.BankReference = bankStatementEntry.BankAccountNumber.TrimStart(new Char[] { '0' });
                            }
                            reversalTransactionEntry.Reason = reasonTo;
                            var transactionEntityTo = Mapper.Map<billing_Transaction>(reversalTransactionEntry);
                            _transactionRepository.Create(transactionEntityTo);
                        }
                        else //back to suspense
                        {
                            var unallocatedPayment = await _unallocatedPaymentRepository
                                                            .Where(t => t.BankStatementEntryId == (int)transaction.BankStatementEntryId).FirstOrDefaultAsync();
                            if (unallocatedPayment != null)
                            {
                                var suspenseDebtor = await GetSuspenseAccountDebtorDetailsByBankAccount(bankStatementEntry.BankAccountNumber.TrimStart(new char[] { '0' }));
                                if (suspenseDebtor != null)
                                {
                                    var unallocatedItemId = unallocatedPayment.UnallocatedPaymentId;
                                    var suspenseBSChart = await _configurationService.GetModuleSetting(SystemSettings.SuspenseBSChart);
                                    var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                    if (suspenseDebtor.IndustryClass.HasValue)
                                        _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, unallocatedItemId, decimal.Negate(transaction.Amount), suspenseDebtor.BankAccountId, bankChart, suspenseBSChart, false, suspenseDebtor.IndustryClass.Value, null);
                                }
                                unallocatedPayment.UnallocatedAmount = transaction.Amount;
                                unallocatedPayment.AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated;
                                _unallocatedPaymentRepository.Update(unallocatedPayment);
                            }
                            else
                            {
                                var suspenseDebtor = await GetSuspenseAccountDebtorDetailsByBankAccount(bankStatementEntry.BankAccountNumber.TrimStart(new char[] { '0' }));
                                var unallocated = new billing_UnallocatedPayment
                                {
                                    UnallocatedAmount = transaction.Amount,
                                    BankStatementEntryId = (int)transaction.BankStatementEntryId,
                                    RoleplayerId = suspenseDebtor.RoleplayerId,
                                    AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                                    PeriodId = periodId,
                                };
                                var createdPaymentId = await CreateUnallocatedPayment(unallocated);

                                if (suspenseDebtor != null)
                                {
                                    var unallocatedItemId = createdPaymentId;
                                    var suspenseBSChart = await _configurationService.GetModuleSetting(SystemSettings.SuspenseBSChart);
                                    var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                    if (suspenseDebtor.IndustryClass.HasValue)
                                        _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, unallocatedItemId, decimal.Negate(transaction.Amount), suspenseDebtor.BankAccountId, bankChart, suspenseBSChart, false, suspenseDebtor.IndustryClass.Value, null);
                                }
                            }
                        }

                        var transactionEntityFrom = Mapper.Map<billing_Transaction>(creditTransactionEntry);
                        _transactionRepository.Create(transactionEntityFrom);

                        var fromNote = new BillingNote
                        {
                            ItemId = transaction.RolePlayerId,
                            ItemType = BillingNoteTypeEnum.ReAllocation.GetDescription(),
                            Text = $"{reasonFrom} - amount: {transaction.Amount}"
                        };
                        await _billingService.AddBillingNote(fromNote);

                        if (toRoleplayerId.HasValue)
                        {
                            var toNote = new BillingNote
                            {
                                ItemId = toRoleplayerId.Value,
                                ItemType = BillingNoteTypeEnum.ReAllocation.GetDescription(),
                                Text = $"{reasonTo} - amount: {transaction.Amount}"

                            };
                            await _billingService.AddBillingNote(toNote);
                        }
                    }
                    await scope.SaveChangesAsync();
                }
            }
        }

        private async Task<billing_SuspenseDebtorBankMapping> GetSuspenseAccountDebtorDetailsByBankAccount(string bankAccountNumber)
        {
            var bankAccount = await _bankAccountService.GetBankAccountByStringAccountNumber(bankAccountNumber);
            var suspenseAccountDebtor = await _suspenseDebtorBankMappingRepository.FirstOrDefaultAsync(c => c.BankAccountId == bankAccount.Id);
            return suspenseAccountDebtor;
        }

        private async Task<bool> PostItemToGeneralLedger(int roleplayerId, int itemId, decimal amount, int bankAccountId, string incomeStatementChart, string balanceSheetChart, bool isAllocated, IndustryClassEnum industryClass, int? contraTransactionId)
        {
            await _abilityTransactionsAuditService.PostItemToGeneralLedger(roleplayerId, itemId, amount, bankAccountId, incomeStatementChart, balanceSheetChart, isAllocated, industryClass, contraTransactionId);
            return await Task.FromResult(true);
        }

        private async Task<int> CreateUnallocatedPayment(billing_UnallocatedPayment payment)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                _unallocatedPaymentRepository.Create(payment);
                await scope.SaveChangesAsync();
                return payment.UnallocatedPaymentId;
            }
        }

        public async Task<PagedRequestResult<BulkAllocationFile>> GetBulkPaymentAllocationFiles(string startDate, string endDate, int pageNumber, int pageSize
                                                                                    , string orderBy, string sort)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@startDate",
                    SqlDbType = System.Data.SqlDbType.DateTime,
                    Value = startDate
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@endDate",
                    SqlDbType = System.Data.SqlDbType.DateTime,
                    Value = endDate
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@pageNumber",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = pageNumber
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@pageSize",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = pageSize
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@orderBy",
                    SqlDbType = System.Data.SqlDbType.VarChar,
                    Value = orderBy
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@sort",
                    SqlDbType = System.Data.SqlDbType.VarChar,
                    Value = sort
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@recordCount",
                    SqlDbType = System.Data.SqlDbType.BigInt,
                    Direction = ParameterDirection.Output
                });

                var data = await _bulkAllocationFileRepository
                   .SqlQueryAsync<BulkAllocationFile>(
                    "[billing].[GetBulkAllocationFiles] @startDate,@endDate,@pageNumber," +
                    "@pageSize,@orderBy,@sort,@recordCount output", parameters.ToArray());

                var records = 0;
                if (data != null && data.Count > 0)
                    records = Convert.ToInt32(parameters[6]?.Value);

                return new PagedRequestResult<BulkAllocationFile>()
                {
                    Page = pageNumber,
                    PageCount = pageSize,
                    RowCount = records,
                    PageSize = pageSize,
                    Data = data
                };
            }
        }

        public async Task ProcessBulkAllocationsForTerms()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var allocations = await _termBulkAllocationRepository.Where(c => c.IsPendingLog).ToListAsync();
                foreach (var allocation in allocations)
                {
                    if (allocation.Amount.HasValue)
                        await AllocateToTermsArrangement(allocation.RoleplayerId, allocation.Amount.Value, (DateTime)allocation.StatementDate.Value, allocation.TransactionId);

                    allocation.IsPendingLog = false;
                    _termBulkAllocationRepository.Update(allocation);
                }
                await scope.SaveChangesAsync();
            }
        }

        private async Task HandleGeneralLedgerPosting(finance_BankStatementEntry entity, FinPayee debtor, int transactionId, decimal amount)
        {
            var debtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);
            var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
            var bankAccount = await _bankAccountService.GetBankAccountByStringAccountNumber(entity.BankAccountNumber.TrimStart(new char[] { '0' }));

            await PostItemToGeneralLedger(debtor.RolePlayerId, transactionId, amount, bankAccount.Id, bankChart, string.Empty, true, debtorIndustry.IndustryClass, null);
        }

        private async Task PostPaymentToGeneralLedger(billing_UnallocatedPayment unallocatedPayment, billing_Transaction paymentTransaction)
        {
            if (unallocatedPayment == null || paymentTransaction == null)
                return;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var debtor = await _rolePlayerService.GetFinPayeeByRolePlayerId(paymentTransaction.RolePlayerId);
                await HandleGeneralLedgerPosting(unallocatedPayment.BankStatementEntry, debtor, paymentTransaction.TransactionId, paymentTransaction.Amount);
                await scope.SaveChangesAsync();
            }
        }
        public async Task<bool> AllocatePaymentToPolicy(AllocatePaymentToPolicyRequest request)
        {
            if (request == null)
                throw new TechnicalException(
                    $"AllocatePaymentToPolicy Error: request body can not be null");

            if (request.FromPaymentTransactionId == 0)
                throw new TechnicalException(
                    $"AllocatePaymentToPolicy Error: FromPayementTransactionId field cannot be 0");

            if (request.PolicyBillings == null || request.PolicyBillings.Count == 0)
                throw new TechnicalException(
                    $"AllocatePaymentToPolicy Error: Policies to allocate payment is required.");


            using (var scope = _dbContextScopeFactory.Create())
            {
                var paymentTransaction = await _transactionRepository.Where(t => t.TransactionId == request.FromPaymentTransactionId).SingleAsync();
                if (paymentTransaction == null)
                    throw new TechnicalException(
                   $"AllocatePaymentToPolicy Error: payment transaction not found.");

                var paymentAvailableBalance = await GetTransactionBalance(request.FromPaymentTransactionId);
                bool canAllocatePayment = await CanAllocatePayment(Math.Abs(paymentAvailableBalance), paymentTransaction, request);
                if (canAllocatePayment)
                {
                    var paymentsToAllocate = new List<billing_PolicyPaymentAllocation>();
                    foreach (var policy in request.PolicyBillings)
                    {

                        paymentsToAllocate.Add(new billing_PolicyPaymentAllocation
                        {
                            Amount = policy.BillingAmount.HasValue ? policy.BillingAmount.Value : 0M,
                            BillingAllocationType = BillingAllocationTypeEnum.PaymentAllocation,
                            BillingMonth = DateTimeHelper.StartOfTheMonth(policy.BillingDate),
                            CreatedDate = DateTimeHelper.SaNow,
                            CreatedBy = RmaIdentity.Username,
                            ModifiedDate = DateTimeHelper.SaNow,
                            ModifiedBy = RmaIdentity.Username,
                            PolicyId = policy.PolicyId,
                            TransactionId = request.FromPaymentTransactionId,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            IsDeleted = false
                        });
                    }

                    _policyPaymentAllocation.Create(paymentsToAllocate);
                    await scope.SaveChangesAsync();
                }
            }
            return true;
        }
        private async Task<bool> CanAllocatePayment(decimal paymentBalance, billing_Transaction paymentTransaction, AllocatePaymentToPolicyRequest request)
        {

            if (paymentTransaction.RolePlayerId == 0)
                throw new BusinessException(
                       $"Payment transaction not linked to a role player.");

            var policiesLinkedToTransactionRolePlayer = await _rolePlayerPolicyService.GetRolePlayerPolicyByRolePlayerId(paymentTransaction.RolePlayerId);
            if (policiesLinkedToTransactionRolePlayer == null || policiesLinkedToTransactionRolePlayer.Count == 0)
            {
                throw new BusinessException(
                       $"No policies linked to payment transaction.");
            }

            foreach (var item in request.PolicyBillings)
            {
                var policy = policiesLinkedToTransactionRolePlayer.FirstOrDefault(p => p.PolicyId == item.PolicyId);
                if (policy == null)
                {
                    throw new BusinessException(
                          $"policy {item.PolicyNumber} not linked to role player assigned payment transaction.");
                }

                if (!IsPolicyInforce(policy.PolicyStatus))
                {
                    throw new BusinessException(
                              $"Cannot allocate payment to policy with status {policy.PolicyStatus.GetDescription()}");
                }
            }

            var totalAmountToAllocate = request.PolicyBillings.Sum(tx => tx.BillingAmount);
            if (totalAmountToAllocate > paymentBalance)
                throw new TechnicalException(
                   $"AllocatePaymentToPolicy Error: Total amount to allocate is more than the available balance.");

            return true;
        }
        public async Task<bool> TransferPaymentFromPolicyToPolicy(TransferPaymentFromPolicyToPolicyRequest request)
        {
            if (request == null)
                throw new TechnicalException(
                    $"TransferPaymentFromPolicyToPolicyInput Error: request body can not be null.");

            if (request.ToPolicyId == 0)
                throw new TechnicalException(
                    $"TransferPaymentFromPolicyToPolicyInput Error: ToPolicyId field cannot be 0.");

            if (request.FromPolicyId == 0)
                throw new TechnicalException(
                    $"TransferPaymentFromPolicyToPolicyInput Error: FromPolicyId field cannot be 0.");

            if (request.AmountToTransfer < 1)
                throw new TechnicalException(
                    $"TransferPaymentFromPolicyToPolicyInput Error: AmountToTransfer field cannot be less than 1.");

            var fromBillingMonth = DateTimeHelper.StartOfTheMonth(request.FromPolicyBillingMonth);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var allocationTransaction = await _policyPaymentAllocation.SingleOrDefaultAsync(t => t.Id == request.FromPaymentAllocationId);

                if (allocationTransaction == null)
                    throw new TechnicalException(
                 $"TransferPaymentFromPolicyToPolicyInput Error: from policy does not have existing transactions to transfer payment from.");

                var linkedTransactions = await _policyPaymentAllocation.Where(t => t.LinkedPolicyPaymentAllocationId == request.FromPaymentAllocationId).ToListAsync();

                if (!CanTransferPayment(allocationTransaction, linkedTransactions, request.AmountToTransfer))
                    return false;

                var debitTransaction = new billing_PolicyPaymentAllocation
                {
                    Amount = request.AmountToTransfer,
                    CreatedBy = RmaIdentity.Username,
                    ModifiedBy = RmaIdentity.Username,
                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                    TransactionId = allocationTransaction.TransactionId,
                    BillingAllocationType = BillingAllocationTypeEnum.InterPolicyPaymentTransfer,
                    BillingMonth = DateTimeHelper.StartOfTheMonth(request.FromPolicyBillingMonth),
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedDate = DateTimeHelper.SaNow,
                    PolicyId = request.FromPolicyId,
                    LinkedPolicyPaymentAllocationId = request.FromPaymentAllocationId,
                    IsDeleted = false
                };

                var creditTransaction = new billing_PolicyPaymentAllocation
                {
                    Amount = request.AmountToTransfer,
                    CreatedBy = RmaIdentity.Username,
                    ModifiedBy = RmaIdentity.Username,
                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                    TransactionId = allocationTransaction.TransactionId,
                    BillingAllocationType = BillingAllocationTypeEnum.InterPolicyPaymentTransfer,
                    BillingMonth = DateTimeHelper.StartOfTheMonth(request.ToPolicyBillingMonth),
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedDate = DateTimeHelper.SaNow,
                    PolicyId = request.ToPolicyId,
                    LinkedPolicyPaymentAllocationId = request.FromPaymentAllocationId,
                    IsDeleted = false
                };
                _policyPaymentAllocation.Create(
                    new List<billing_PolicyPaymentAllocation>()
                    {
                      debitTransaction,
                      creditTransaction
                    });
                await scope.SaveChangesAsync();
                if (!string.IsNullOrEmpty(request.Notes))
                {
                    var note = new BillingNote
                    {
                        ItemId = request.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.InterPolicyPaymentTransfer.GetDescription(),
                        Text = request.Notes
                    };
                    await _billingService.AddBillingNote(note);
                }
            }
            return true;
        }
        bool IsPolicyInforce(PolicyStatusEnum policyStatus)
        {
            switch (policyStatus)
            {
                case PolicyStatusEnum.New:
                case PolicyStatusEnum.Active:
                case PolicyStatusEnum.Continued:
                case PolicyStatusEnum.Reinstated:
                    return true;
                default:
                    return false;
            }
        }
        public async Task<bool> ReversePaymentsAllocated(ReversePolicyPaymentRequest input)
        {

            if (input == null || input.PaymentIds == null || input.PaymentIds.Count == 0)
                throw new TechnicalException(
                 $"ReversePaymentsAllocated Error: Policy payment Ids is required.");

            using (var scope = _dbContextScopeFactory.Create())
            {
                var allocations = await _policyPaymentAllocation.Where(a =>
                      input.PaymentIds.Contains(a.Id)
                ).ToListAsync();

                if (allocations == null || allocations.Count == 0)
                    throw new TechnicalException(
                 $"ReversePaymentsAllocated Error: from policy does not have existing transactions to transfer payment from.");


                List<billing_PolicyPaymentAllocation> reverseTransactions = new List<billing_PolicyPaymentAllocation>();
                List<billing_PolicyPaymentAllocation> allocationsToDelete = new List<billing_PolicyPaymentAllocation>();

                foreach (var allocation in allocations)
                {
                    if (allocation == null) continue;
                    if (allocation.TransactionTypeLinkId == (int)TransactionActionType.Debit)
                        throw new TechnicalException(
                                $"ReversePaymentsAllocated Error: Can not reverse a debit transaction.");

                    var paymentToReverse = await _policyPaymentAllocation.FindByIdAsync(allocation.Id);
                    if (paymentToReverse == null)
                        throw new TechnicalException(
                         $"ReversePaymentsAllocated Error: Policy payment allocation {allocation.Id} not found");

                    var linkedAllocation = await _policyPaymentAllocation.Where(a => a.LinkedPolicyPaymentAllocationId == allocation.Id).ToListAsync();
                    if (!CanReverseAllocatedPayment(paymentToReverse, linkedAllocation))
                        throw new TechnicalException(
                 $"ReversePaymentsAllocated Error: Payment {allocation.Id} already reversed.");


                    reverseTransactions.Add(
                        new billing_PolicyPaymentAllocation
                        {
                            CreatedDate = DateTimeHelper.SaNow,
                            CreatedBy = RmaIdentity.Username,
                            ModifiedDate = DateTimeHelper.SaNow,
                            ModifiedBy = RmaIdentity.Username,
                            Amount = allocation.Amount,
                            TransactionId = allocation.TransactionId,
                            BillingMonth = allocation.BillingMonth,
                            PolicyId = allocation.PolicyId,
                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                            BillingAllocationType = BillingAllocationTypeEnum.PaymentReversal,
                            LinkedPolicyPaymentAllocationId = allocation.Id,
                            IsDeleted = false
                        });

                    paymentToReverse.IsDeleted = true;
                    allocationsToDelete.Add(paymentToReverse);

                }
                _policyPaymentAllocation.Create(reverseTransactions);
                _policyPaymentAllocation.Update(allocationsToDelete);

                await scope.SaveChangesAsync();
            }
            return true;
        }
        private bool CanReverseAllocatedPayment(billing_PolicyPaymentAllocation paymentToReverse, List<billing_PolicyPaymentAllocation> allocations)
        {
            if (paymentToReverse == null)
                throw new TechnicalException(
                 $"ReversePaymentsAllocated Error: Policy payment allocation not found");

            if (paymentToReverse.IsDeleted)
                throw new BusinessException(
                          $"Cannot reverse an already reversed payment.");

            if (allocations == null || allocations.Count == 0)
                return true;

            var reversedTransactions = allocations.Where(a => a.TransactionTypeLinkId == (int)TransactionActionType.Debit &&
                                                        a.BillingAllocationType == BillingAllocationTypeEnum.PaymentReversal)
                                                        .ToList();

            if (reversedTransactions != null && reversedTransactions.Count > 0)
            {
                throw new BusinessException(
                          $"Cannot reverse an already reversed payment.");
            }

            var transferredTransactions = allocations.Where(a => a.TransactionTypeLinkId == (int)TransactionActionType.Debit &&
                                                        a.BillingAllocationType == BillingAllocationTypeEnum.InterPolicyPaymentTransfer)
                                                        .ToList();

            if (transferredTransactions != null && transferredTransactions.Count > 0)
            {
                throw new BusinessException(
                          $"Cannot reverse a payment already to transfered.");
            }
            return true;
        }
        private bool CanTransferPayment(billing_PolicyPaymentAllocation allocationTransaction, List<billing_PolicyPaymentAllocation> linkedTransactions, decimal transerAmount)
        {
            if (allocationTransaction.IsDeleted)
                throw new BusinessException(
                          $"Cannot transfer a reversed payment.");

            decimal totalBalance = allocationTransaction.Amount;
            if (linkedTransactions != null && linkedTransactions.Count > 0)
            {
                foreach (var allocation in linkedTransactions)
                {
                    if (allocation == null)
                        continue;

                    if (allocation.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                        totalBalance += allocation.Amount;
                    if (allocation.TransactionTypeLinkId == (int)TransactionActionType.Debit)
                        totalBalance -= allocation.Amount;
                }
            }
            if (transerAmount > totalBalance)
                throw new TechnicalException(
                 $"TransferPaymentFromPolicyToPolicyInput Error: Existing balance is less than transfer amount.");

            return true;
        }
        public async Task<PolicyPaymentTransaction> FetchPolicyPaymentTransactionsForBillingMonth(int policyId, DateTime billingMonth)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            PolicyPaymentTransaction results = null;
            var billingEffectiveDate = DateTimeHelper.StartOfTheMonth(billingMonth);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var allocations = await _policyPaymentAllocation.Where(a =>
                   a.PolicyId == policyId &&
                   a.BillingMonth == billingEffectiveDate
                ).ToListAsync();

                if (allocations == null || allocations.Count == 0)
                    return results;
                var policyNumber = await _policyService.GetPolicyNumber(policyId);
                var paymentAllocations = Mapper.Map<List<PolicyPaymentAllocation>>(allocations);
                results = new PolicyPaymentTransaction
                {

                    BillingMonth = billingMonth,
                    PolicyNumber = policyNumber,
                    Allocations = paymentAllocations,
                    Balance = GetCurrentBillingBalance(paymentAllocations)
                };
            }
            return results;
        }
        private Decimal GetCurrentBillingBalance(List<PolicyPaymentAllocation> allocations)
        {
            var result = 0M;

            if (allocations == null || allocations.Count == 0)
                return result;

            foreach (var transaction in allocations)
            {
                if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                    result += transaction.Amount;
                if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit)
                    result -= transaction.Amount;
            }
            return result;
        }
        private async Task<decimal> GetPaymentsAllocatedToPoliciesFromTransaction(billing_Transaction paymentTransaction)
        {
            var results = 0M;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _transactionRepository.LoadAsync(paymentTransaction, t => t.PolicyPaymentAllocations);

                var paymentsAllocated = paymentTransaction.PolicyPaymentAllocations;

                if (paymentsAllocated == null && paymentsAllocated.Count == 0)
                    return results;

                foreach (var payment in paymentsAllocated)
                {
                    if (payment == null) continue;

                    if (payment.TransactionTypeLinkId == (int)TransactionActionType.Debit)
                        results -= payment.Amount;

                    if (payment.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                        results += payment.Amount;

                }
            }
            return results;
        }
    }
}
