using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
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
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;

using Transaction = RMA.Service.Billing.Contracts.Entities.Transaction;
using RMA.Service.Billing.Utils;
using RMA.Service.FinCare.Contracts.Enums;
using Castle.Core.Internal;
using System.Diagnostics.Contracts;
using System.Data.SqlClient;
using RMA.Service.Billing.Database.Constants;

using RMA.Service.FinCare.Contracts.Entities.Finance;


namespace RMA.Service.Billing.Services
{
    public class AbilityTransactionsAuditFacade : RemotingStatelessService, IAbilityTransactionsAuditService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_AbilityTransactionsAudit> _abilityTransactionsAuditRepository;
        private readonly IRepository<billing_InvoiceAllocation> _invoiceAllocationsRepository;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRolePlayerPolicyService _roleplayerPolicyService;
        private readonly IBankBranchService _bankBranchService;
        private readonly IInvoiceService _invoiceService;
        private readonly ITransactionService _transactionService;
        private readonly IClaimRecoveryInvoiceService _claimRecoveryInvoiceService;
        private readonly IPaymentService _paymentService;
        private readonly IIndustryService _industryService;
        private readonly IRepository<billing_RefundHeader> _refundHeaderRepository;
        private readonly IRepository<billing_RefundHeaderDetail> _refundHeaderDetailRepository;
        IRepository<finance_ProductCrossRefTranType> _productCrossRefTranTypeRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IProductOptionService _productOptionService;
        private readonly IProductService _productService;
        private readonly IBillingService _billingService;
        private readonly IPolicyService _policyService;
        private const string negativeGlSign = "-";
        private const string positiveGlSign = "+";
        private const string coid = "coid";
        private const string gpa = "gpa";
        private const string cjp = "cjp";
        private const string riot = "riot";
        private const string coidClass = "coid class";
        private readonly IRepository<finance_BankStatementEntry> _bankStatementEntryRepository;
        private readonly IRepository<billing_UnallocatedPayment> _unallocatedPaymentRepository;
        private readonly IRepository<billing_SuspenseDebtorBankMapping> _suspenseDebtorBankMappingRepository;
        private readonly IBankAccountService _bankAccountService;
        private const string interDebtorTo = "Inter Debtor To";
        private const string interDebtorFrom = "Inter Debtor From";
        private const string aug = "aug";
        private const string receiptReversal = "Receipt Reversal";
        private const string receipts = "Receipts";
        private const string euroAssitPremium = "Europ Assist Premium";
        private const string reallocationDebit = "Reallocation - Debit";
        private const string reallocationCredit = "Reallocation - Credit";
        private const string claimRecoveryReceipts = "Claim Recovery Receipts";
        private const string claimRecoveryInvoice = "Claim Recovery Invoice";
        private const string UnearnedIncomeStatementChart = "75000";
        private readonly IRepository<finance_ProductCrossRefBankAccount> _productCrossRefBankAccounts;
       

        public AbilityTransactionsAuditFacade(StatelessServiceContext context,
         IDbContextScopeFactory dbContextScopeFactory,
         IRolePlayerService rolePlayerService,
         IRepository<billing_AbilityTransactionsAudit> abilityTransactionsAuditRepository,
         IRepository<billing_InvoiceAllocation> invoiceAllocationsRepository,
         IBankBranchService bankBranchService,
         IRolePlayerPolicyService roleplayerPolicyService,
         ITransactionService transactionService,
         IClaimRecoveryInvoiceService claimRecoveryInvoiceService,
         IPaymentService paymentService,
         IRepository<billing_RefundHeader> refundHeaderRepository,
         IRepository<billing_RefundHeaderDetail> refundHeaderDetailRepository,
         IIndustryService industryService,
         IInvoiceService invoiceService,
         IConfigurationService configurationService,
         IProductOptionService productOptionService,
         IProductService productService,
         IPolicyService policyService,
         IRepository<finance_BankStatementEntry> bankStatementEntryRepository, IBankAccountService bankAccountService,
         IBillingService billingService,
         IRepository<finance_ProductCrossRefTranType> productCrossRefTranTypeRepository,
         IRepository<billing_UnallocatedPayment> unallocatedPaymentRepository,
         IRepository<billing_SuspenseDebtorBankMapping> suspenseDebtorBankMappingRepository,
         IRepository<billing_Invoice> invoiceRepository,
         IRepository<finance_ProductCrossRefBankAccount> productCrossRefBankAccounts)
         : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _abilityTransactionsAuditRepository = abilityTransactionsAuditRepository;
            _rolePlayerService = rolePlayerService;
            _roleplayerPolicyService = roleplayerPolicyService;
            _bankBranchService = bankBranchService;
            _invoiceService = invoiceService;
            _transactionService = transactionService;
            _paymentService = paymentService;
            _claimRecoveryInvoiceService = claimRecoveryInvoiceService;
            _invoiceAllocationsRepository = invoiceAllocationsRepository;
            _industryService = industryService;
            _refundHeaderRepository = refundHeaderRepository;
            _refundHeaderDetailRepository = refundHeaderDetailRepository;
            _configurationService = configurationService;
            _productOptionService = productOptionService;
            _productService = productService;
            _policyService = policyService;
            _bankStatementEntryRepository = bankStatementEntryRepository;
            _bankAccountService = bankAccountService;
            _billingService = billingService;
            _productCrossRefTranTypeRepository = productCrossRefTranTypeRepository;
            _unallocatedPaymentRepository = unallocatedPaymentRepository;
            _suspenseDebtorBankMappingRepository = suspenseDebtorBankMappingRepository;
            _invoiceRepository = invoiceRepository;
            _productCrossRefBankAccounts = productCrossRefBankAccounts;
        }

        public async Task<List<AbilityTransactionsAudit>> GetAbilityPostingAudits()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingAudit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var abilityPostingAudits = await _abilityTransactionsAuditRepository.ToListAsync();
                if (abilityPostingAudits.Any())
                {
                    return Mapper.Map<List<AbilityTransactionsAudit>>(abilityPostingAudits);
                }
                else
                {
                    return new List<AbilityTransactionsAudit>();
                }

            }
        }

        public async Task<List<AbilityTransactionsAudit>> GetAbilityPostingAuditsToProcess()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingAudit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var abilityPostingAudits = await _abilityTransactionsAuditRepository
                     .Where(x => x.IsProcessed == false).Take(1000).ToListAsync();
                if (abilityPostingAudits.Count > 0)
                {
                    return Mapper.Map<List<AbilityTransactionsAudit>>(abilityPostingAudits);
                }
                else
                {
                    return new List<AbilityTransactionsAudit>();
                }
            }
        }

        public async Task<AbilityTransactionsAudit> GetAbilityPostingAudit(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingAudit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var abilityPostingAudit = await _abilityTransactionsAuditRepository
                    .ProjectTo<AbilityTransactionsAudit>()
                    .SingleAsync(prod => prod.Id == id,
                        $"Could not find AbilityTransactionsAudit with id {id}");

                return Mapper.Map<AbilityTransactionsAudit>(abilityPostingAudit);
            }
        }

        public async Task<List<AbilityTransactionsAudit>> GetAbilityPostingAuditByRef(string reference)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingAudit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var abilityPostingAudits = await _abilityTransactionsAuditRepository
                   .Where(x => x.Reference == reference).ToListAsync();
                return Mapper.Map<List<AbilityTransactionsAudit>>(abilityPostingAudits);
            }
        }

        public async Task EditAbilityPostingAudit(AbilityTransactionsAudit abilityPostingAudit)
        {
            Contract.Requires(abilityPostingAudit != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditBillingAudit);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataCrossRef = await _abilityTransactionsAuditRepository.Where(x => x.Id == abilityPostingAudit.Id).SingleAsync();
                dataCrossRef.Reference = abilityPostingAudit.Reference;
                dataCrossRef.IsProcessed = abilityPostingAudit.IsProcessed;
                _abilityTransactionsAuditRepository.Update(dataCrossRef);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }

        }

        public async Task<int> AddAbilityPostingAudit(AbilityTransactionsAudit abilityPostingAudit)
        {
            Contract.Requires(abilityPostingAudit != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingAudit);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_AbilityTransactionsAudit>(abilityPostingAudit);
                _abilityTransactionsAuditRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.Id;
            }
        }

        private async Task<string> GenerateRecoveryReferences(Transaction transaction)
        {
            Contract.Requires(transaction != null);
            using (_dbContextScopeFactory.Create())
            {
                var reference = "";
                var strDate = transaction.TransactionDate.ToString("ddMMyyyy");


                if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice)
                {
                    var claimRecovery = await _claimRecoveryInvoiceService.GetInvoice((int)transaction.ClaimRecoveryInvoiceId);
                    var payment = await _paymentService.GetPaymentByClaimId(claimRecovery.ClaimId);
                    if (payment != null && payment.Product == "Individual")
                    {
                        reference = "RECINDI-" + strDate;
                    }
                    else if (payment != null && payment.Product == "GroupIndividual")
                    {
                        reference = "RECGRPI-" + strDate;
                    }
                    else if (payment != null && payment.Product == "Goldwage")
                    {
                        reference = "RECGLWI-" + strDate;
                    }
                    else if (payment == null)
                    {
                        reference = "RECGRPI-" + strDate;
                    }
                }
                else if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryPayment)
                {
                    var invoiceAllocation = await _invoiceAllocationsRepository.Where(x => x.TransactionId == transaction.TransactionId).FirstOrDefaultAsync();

                    if (invoiceAllocation != null)
                    {
                        var claimRecovery = await _claimRecoveryInvoiceService.GetInvoice((int)invoiceAllocation.ClaimRecoveryId);
                        var payment = await _paymentService.GetPaymentByClaimId(claimRecovery.ClaimId);
                        if (payment != null && payment.Product == "Individual")
                        {
                            reference = "RECINDP-" + strDate;
                        }
                        else if (payment != null && payment.Product == "GroupIndividual")
                        {
                            reference = "RECGRPP-" + strDate;
                        }
                        else if (payment != null && payment.Product == "Goldwage")
                        {
                            reference = "RECGLWP-" + strDate;
                        }
                        else if (payment == null)
                        {
                            reference = "RECGRPP-" + strDate;
                        }
                    }
                    else
                    {
                        reference = "RECGRPP-" + strDate;
                    }
                }
                return reference;
            }
        }

        public async Task AddRefundTransactionAudit(int paymentId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingAudit);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var reference = "";
                var payment = await _paymentService.GetById(paymentId);
                var strDate = payment.SubmissionDate.Value.ToString("ddMMyyyy");
                var refundHeader = await _refundHeaderRepository.Where(x => x.RefundHeaderId == (int)payment.RefundHeaderId).FirstOrDefaultAsync();
                var refundHeaderDetail = await _refundHeaderDetailRepository.Where(x => x.RefundHeaderId == refundHeader.RefundHeaderId).FirstOrDefaultAsync();
                var finPayee = await _rolePlayerService.GetFinPayee(refundHeader.RolePlayerId);
                var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(refundHeader.RolePlayerId);
                if (finPayee == null || finPayee.IndustryId == 0)
                {
                    reference = rolePlayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person ? "REFIND-" + strDate : "REFGRP-" + strDate;
                }
                else
                {
                    var industry = await _industryService.GetIndustry(finPayee.IndustryId);
                    if (industry.IndustryClass == IndustryClassEnum.Individual)
                    {
                        reference = "REFIND-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Other || industry.IndustryClass == IndustryClassEnum.Group || industry.IndustryClass == IndustryClassEnum.Senna)
                    {
                        reference = "REFGRP-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = "REFMTL-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = "REFMIN-" + strDate;
                    }
                }

                var abilityCollectionsAudit = new AbilityTransactionsAudit
                {
                    Reference = reference,
                    TransactionId = refundHeaderDetail.TransactionId,
                    ItemReference = payment.BatchReference,
                    Amount = payment.Amount,
                    Item = "Refund",
                    OnwerDetails = payment.Payee,
                    IsProcessed = false,
                    Bank = payment.Bank,
                    BankBranch = payment.BankBranch,
                    AccountDetails = payment.AccountNo
                };

                var entity = Mapper.Map<billing_AbilityTransactionsAudit>(abilityCollectionsAudit);
                _abilityTransactionsAuditRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task ProcessTransactionsForPosting()
        {
            try
            {
                var transactionsToProcess = new List<Transaction>();
                var bankAccounts = await _bankAccountService.GetBankAccounts();
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var productCrossRefConfigs = await _productCrossRefTranTypeRepository.Where(c => c.IsActive && c.AbilityCollectionChartPrefix != null).ToListAsync();
                    var lookUpPrefixes = Enum.GetValues(typeof(AbilityCollectionChartPrefixEnum)).Cast<AbilityCollectionChartPrefixEnum>().ToList();

                    try
                    {
                        await _abilityTransactionsAuditRepository.ExecuteSqlCommandAsync("[billing].[ProcessEuropeAssistPremiums]");
                    }
                    catch (Exception ex)
                    {
                        ex.LogException();
                    }

                    try
                    {
                        var transactions = await _transactionService.GetUnloggedTransactions();
                        int? sourceBankAccountId = 0;
                        if (transactions.Count != 0)
                        {
                            foreach (var transaction in transactions)
                            {
                                try
                                {
                                    var entities = await _abilityTransactionsAuditRepository.Where(x => x.TransactionId == transaction.TransactionId).ToListAsync();
                                    
                                    if (entities.Count > 0)
                                        continue;

                                    var itemGlSign = positiveGlSign;
                                    var itemType = string.Empty;
                                    var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(transaction.RolePlayerId);
                                    var reference = string.Empty;
                                    
                                    if (transaction.TransactionType == TransactionTypeEnum.Invoice)
                                    {
                                        if (transaction.InvoiceId.HasValue)
                                        {
                                            var invoice = _invoiceRepository.Where(x => x.InvoiceId == transaction.InvoiceId).FirstOrDefaultAsync();
                                            if (invoice == null)
                                            {
                                                continue;
                                            }
                                        }

                                        itemType = TransactionTypeEnum.Invoice.GetDescription().SplitCamelCaseText();
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.Invoice);
                                        //assign the data to the detailedTransaction
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.CreditNote)
                                    {
                                        itemType = TransactionTypeEnum.CreditNote.GetDescription().SplitCamelCaseText();
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.CreditNote);
                                        itemGlSign = negativeGlSign;
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.DebitNote)
                                    {
                                        itemType = TransactionTypeEnum.DebitNote.GetDescription().SplitCamelCaseText();
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.DebitNote);
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.Payment)
                                    {
                                        itemType = receipts;
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.Payment);
                                        //interbank transfer To debtor creates a debit
                                        if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                                            itemGlSign = negativeGlSign;
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice)
                                    {
                                        itemType = claimRecoveryInvoice;
                                        reference = await GenerateRecoveryReferences(transaction);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.ClaimRecoveryInvoice);
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryPayment)
                                    {
                                        itemType = claimRecoveryReceipts;
                                        reference = await GenerateRecoveryReferences(transaction);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.ClaimRecoveryPayment);
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.PaymentReversal)
                                    {
                                        itemType = receiptReversal;
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.PaymentReversal);
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.CreditReallocation)
                                    {
                                        itemType = reallocationCredit;
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.CreditReallocation);
                                        itemGlSign = negativeGlSign;
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.DebitReallocation)
                                    {
                                        itemType = reallocationDebit;
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.DebitReallocation);
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.EuropAssistPremium)
                                    {
                                        itemType = euroAssitPremium;
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.EuropAssistPremium);

                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.Interest)
                                    {
                                        itemType = TransactionTypeEnum.Interest.GetDescription().SplitCamelCaseText();
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.Interest);
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.InterestReversal)
                                    {
                                        itemType = TransactionTypeEnum.InterestReversal.GetDescription().SplitCamelCaseText();
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.InterestReversal);
                                        itemGlSign = negativeGlSign;
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer && transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit)
                                    {
                                        itemType = interDebtorTo;
                                        var interDebtorReference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.InterDebtorTransfer);
                                        itemGlSign = positiveGlSign;
                                        if (!string.IsNullOrEmpty(interDebtorReference))
                                            reference = interDebtorReference.Replace("IDT", "PRV");
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer && transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                                    {
                                        itemType = interDebtorFrom;
                                        var interDebtorReference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.InterDebtorTransfer);
                                        itemGlSign = negativeGlSign;
                                        if (!string.IsNullOrEmpty(interDebtorReference))
                                            reference = interDebtorReference.Replace("IDT", "COL");
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.Refund)
                                    {
                                        itemType = TransactionTypeEnum.Refund.GetDescription().SplitCamelCaseText();
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.Refund);
                                    }
                                    else if (transaction.TransactionType == TransactionTypeEnum.RefundReversal)
                                    {
                                        itemType = TransactionTypeEnum.RefundReversal.GetDescription().SplitCamelCaseText();
                                        reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                        sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.RefundReversal);
                                        itemGlSign = negativeGlSign;
                                    }
                                    var amount = transaction.Amount;
                                    if (itemGlSign == negativeGlSign)
                                        amount = decimal.Negate(amount);

                                    var abilityCollectionsAudit = new AbilityTransactionsAudit
                                    {
                                        Reference = reference,
                                        TransactionId = transaction.TransactionId,
                                        ItemReference = transaction.RmaReference ?? transaction.BankReference,
                                        Amount = amount,
                                        Item = itemType,
                                        OnwerDetails = rolePlayer.DisplayName,
                                        IsProcessed = false,
                                        IsActive = true
                                    };
                                    if (sourceBankAccountId.HasValue && sourceBankAccountId.Value > 0)
                                        abilityCollectionsAudit.BankAccountId = sourceBankAccountId.Value;

                                    foreach (var lookUpPrefix in lookUpPrefixes)
                                    {
                                        var cleanedReference = reference.Replace("-", "");
                                        if (cleanedReference.StartsWith(lookUpPrefix.GetDescription(), StringComparison.InvariantCultureIgnoreCase))
                                        {
                                            var config = productCrossRefConfigs.FirstOrDefault(c => c.AbilityCollectionChartPrefix == lookUpPrefix);
                                            if (config != null)
                                            {
                                                if (config?.ChartBsNo > 0)
                                                    abilityCollectionsAudit.BSChart = config.ChartBsNo.ToString();
                                                if (config?.ChartIsNo > 0)
                                                    abilityCollectionsAudit.ISChart = config.ChartIsNo.ToString();
                                                if (!string.IsNullOrEmpty(config.Level1))
                                                    abilityCollectionsAudit.Level1 = config.Level1;
                                                if (!string.IsNullOrEmpty(config.Level2))
                                                    abilityCollectionsAudit.Level2 = config.Level2;
                                                if (!string.IsNullOrEmpty(config.Level3))
                                                    abilityCollectionsAudit.Level3 = config.Level3;

                                                if (!abilityCollectionsAudit.BankAccountId.HasValue)
                                                {
                                                    abilityCollectionsAudit.BankAccountId = await GetCrossReferenceBankAccountId(config.Id);
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    transactionsToProcess.Add(transaction);
                                    var entity = Mapper.Map<billing_AbilityTransactionsAudit>(abilityCollectionsAudit);
                                    _abilityTransactionsAuditRepository.Create(entity);
                                }
                                catch (Exception scheduleEx)
                                {
                                    scheduleEx.LogException($"Error in {nameof(ProcessTransactionsForPosting)}. PolicyId: {transaction.TransactionId}. Exception: {scheduleEx.Message}");
                                }


                            }
                        }

                        if (transactionsToProcess.Count > 0)
                            await _transactionService.UpdateTransaction(transactionsToProcess);

                        await scope.SaveChangesAsync().ConfigureAwait(false);

                    }
                    catch (Exception ex)
                    {

                        ex.LogException($"Error in {nameof(ProcessTransactionsForPosting)}. Exception:{ex.Message} ");

                    }
                }

            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Processing Transactions For Posting - Error Message {ex.Message}");
            }

        }
        
        public async Task<bool> PostItemToGeneralLedger(int roleplayerId, int itemId, decimal amount, int bankAccountId, string incomeStatementChart, string balanceSheetChart, bool isAllocated, IndustryClassEnum industryClass, int? contraTransactionId)
        {
            var reference = string.Empty;
            int? sourceBankAccountId = 0;
            var transactionsToProcess = new List<Transaction>();
            var bankAccounts = await _bankAccountService.GetBankAccounts();
            var itemGlSign = positiveGlSign;

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    if (!isAllocated)
                    {
                        sourceBankAccountId = bankAccountId;
                        var finpayee = await _rolePlayerService.GetFinPayee(roleplayerId);

                        int bankStatementEntryId = 0;
                        var unallocatedPayment = await _unallocatedPaymentRepository.FirstOrDefaultAsync(c => c.UnallocatedPaymentId == itemId);
                        bankStatementEntryId = unallocatedPayment.BankStatementEntryId;
                        var bankstatementEntry = await _bankStatementEntryRepository.FirstOrDefaultAsync(b => b.BankStatementEntryId == bankStatementEntryId);

                        reference = await GenerateSuspenseReference(bankAccountId, bankstatementEntry.StatementDate.Value, industryClass);
                        var entity = new billing_AbilityTransactionsAudit
                        {
                            Reference = reference,
                            UnallocatedPaymentId = itemId,
                            Item = receipts,
                            OnwerDetails = finpayee.FinPayeNumber,
                            IsProcessed = false,
                            IsActive = true,
                            BankAccountId = bankAccountId,
                            BsChart = balanceSheetChart,
                            TransactionId = contraTransactionId
                        };

                        if (bankstatementEntry != null)
                        {
                            var statementReference = bankstatementEntry.StatementNumber + "/" + bankstatementEntry.StatementLineNumber + " " +
                                                 (bankstatementEntry.StatementDate?.Date.FormatDaySlashMonthSlashYear() ??
                                                  string.Empty);
                            entity.ItemReference = statementReference;
                            if (bankstatementEntry.DebitCredit == "+")
                            {
                                entity.Item = receipts;
                                itemGlSign = negativeGlSign;
                            }
                            else
                                entity.Item = receiptReversal;
                        }
                        if (itemGlSign == negativeGlSign)
                            amount = decimal.Negate(amount);

                        entity.IsChart = incomeStatementChart;

                        entity.Amount = amount;
                        _abilityTransactionsAuditRepository.Create(entity);
                    }
                    else
                    {
                        var transaction = await _transactionService.GetTransaction(itemId);
                        if (transaction != null && isAllocated)
                        {
                            var productCrossRefConfigs = await _productCrossRefTranTypeRepository.Where(c => c.IsActive && c.AbilityCollectionChartPrefix != null).ToListAsync();
                            var lookUpPrefixes = Enum.GetValues(typeof(AbilityCollectionChartPrefixEnum)).Cast<AbilityCollectionChartPrefixEnum>().ToList();

                            var itemType = string.Empty;
                            var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(roleplayerId);

                            if (transaction.TransactionType == TransactionTypeEnum.Invoice)
                            {
                                itemType = TransactionTypeEnum.Invoice.GetDescription().SplitCamelCaseText();
                                if (incomeStatementChart == UnearnedIncomeStatementChart)
                                {
                                    var productName = await GetProductNameByInvoice(transaction.InvoiceId.Value);
                                    reference = await GenerateUnearnedReferences(transaction, productName);
                                }
                                else
                                    reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.Invoice);
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.CreditNote)
                            {
                                itemType = TransactionTypeEnum.CreditNote.GetDescription().SplitCamelCaseText();
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.CreditNote);
                                itemGlSign = negativeGlSign;
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.DebitNote)
                            {
                                itemType = TransactionTypeEnum.DebitNote.GetDescription().SplitCamelCaseText();
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.DebitNote);
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.Payment)
                            {
                                itemType = receipts;
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.Payment);
                                //interbank transfer To debtor creates a debit
                                if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                                    itemGlSign = negativeGlSign;
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice)
                            {
                                itemType = claimRecoveryInvoice;
                                reference = await GenerateRecoveryReferences(transaction);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.ClaimRecoveryInvoice);
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryPayment)
                            {
                                itemType = claimRecoveryReceipts;
                                reference = await GenerateRecoveryReferences(transaction);
                                sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.ClaimRecoveryPayment);
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.PaymentReversal)
                            {
                                itemType = receiptReversal;
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.PaymentReversal);
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.CreditReallocation)
                            {
                                itemType = reallocationCredit;
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.CreditReallocation);
                                itemGlSign = negativeGlSign;
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.DebitReallocation)
                            {
                                itemType = reallocationDebit;
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.DebitReallocation);
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.EuropAssistPremium)
                            {
                                itemType = euroAssitPremium;
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.EuropAssistPremium);

                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.Interest)
                            {
                                itemType = TransactionTypeEnum.Interest.GetDescription().SplitCamelCaseText();
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.Interest);
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.InterestReversal)
                            {
                                itemType = TransactionTypeEnum.InterestReversal.GetDescription().SplitCamelCaseText();
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.InterestReversal);
                                itemGlSign = negativeGlSign;
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer && transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit)
                            {
                                itemType = interDebtorTo;
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.InterDebtorTransfer);
                                itemGlSign = positiveGlSign;
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer && transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                            {
                                itemType = interDebtorFrom;
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.InterDebtorTransfer);
                                itemGlSign = negativeGlSign;
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.Refund)
                            {
                                itemType = TransactionTypeEnum.Refund.GetDescription().SplitCamelCaseText();
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.Refund);
                            }
                            else if (transaction.TransactionType == TransactionTypeEnum.RefundReversal)
                            {
                                itemType = TransactionTypeEnum.RefundReversal.GetDescription().SplitCamelCaseText();
                                reference = await GenerateTransactionReferences(transaction, bankAccounts);
                                if (bankAccountId > 0)
                                    sourceBankAccountId = bankAccountId;
                                else
                                    sourceBankAccountId = await GetSourceBankAccount(transaction.TransactionId, TransactionTypeEnum.RefundReversal);
                                itemGlSign = negativeGlSign;
                            }

                            if (itemGlSign == negativeGlSign)
                                amount = decimal.Negate(amount);

                            var abilityCollectionsAudit = new AbilityTransactionsAudit
                            {
                                Reference = reference,
                                TransactionId = transaction.TransactionId,
                                ItemReference = transaction.RmaReference ?? transaction.BankReference,
                                Amount = amount,
                                Item = itemType,
                                OnwerDetails = rolePlayer.DisplayName,
                                IsProcessed = false,
                                IsActive = true
                            };
                            if (sourceBankAccountId.HasValue && sourceBankAccountId.Value > 0)
                                abilityCollectionsAudit.BankAccountId = sourceBankAccountId.Value;

                            if (!string.IsNullOrEmpty(incomeStatementChart))
                                abilityCollectionsAudit.ISChart = incomeStatementChart;
                            if (!string.IsNullOrEmpty(balanceSheetChart))
                                abilityCollectionsAudit.BSChart = balanceSheetChart;

                            if (string.IsNullOrEmpty(incomeStatementChart) || string.IsNullOrEmpty(balanceSheetChart))
                            {
                                foreach (var lookUpPrefix in lookUpPrefixes)
                                {
                                    if (reference.StartsWith(lookUpPrefix.GetDescription(), StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        var config = productCrossRefConfigs.FirstOrDefault(c => c.AbilityCollectionChartPrefix == lookUpPrefix);
                                        if (config != null)
                                        {
                                            if (string.IsNullOrEmpty(incomeStatementChart))
                                                abilityCollectionsAudit.ISChart = config.ChartIsNo.ToString();

                                            if (string.IsNullOrEmpty(balanceSheetChart))
                                                abilityCollectionsAudit.BSChart = config.ChartBsNo.ToString();
                                        }
                                        break;
                                    }
                                }
                            }

                            var entity = Mapper.Map<billing_AbilityTransactionsAudit>(abilityCollectionsAudit);
                            _abilityTransactionsAuditRepository.Create(entity);

                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return await Task.FromResult(true);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error when Posting To Gl- Error Message {ex.Message}- StackTrace- {ex.StackTrace}");
                    return await Task.FromResult(false);
                }
            }
        }

        public async Task ProcessMonthlyEarnedIncome()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    await _abilityTransactionsAuditRepository.ExecuteSqlCommandAsync(Database.Constants.DatabaseConstants.RaisePendingInstallmentPremiums);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error when Process Monthly Earned Income- Error Message {ex.Message}- StackTrace- {ex.StackTrace}");
                }

            }
        }

        #region Private Helper Methods

        private async Task<int> GetCrossReferenceBankAccountId(int productCrossRefTranTypeId)
        {
            var productCrossRefBankAccounts = await _productCrossRefBankAccounts.SingleOrDefaultAsync(x => x.ProductCrossRefTranTypeId == productCrossRefTranTypeId);

            return productCrossRefBankAccounts != null ? productCrossRefBankAccounts.BankAccountId : 0;
        }
       
        private async Task<string> GenerateTransactionReferences(Transaction transaction, List<BankAccount> bankAccounts)
        {
            Contract.Requires(transaction != null);
            var products = await _productService.GetProducts();
            var nonFuneralProducts = products.Where(c => c.UnderwriterId == (int)UnderwriterEnum.RMAMutualAssurance).ToList();
            using (_dbContextScopeFactory.Create())
            {
                var reference = string.Empty;
                try
                {
                    var detailedTransaction = 
                        (await _abilityTransactionsAuditRepository.SqlQueryAsync<TransactionDetail>(
                            DatabaseConstants.GetAbilityTransactionDetails,
                            new SqlParameter
                            {
                                ParameterName = "@TransactionId",
                                Value = transaction.TransactionId
                            }
                        )).FirstOrDefault();

                    detailedTransaction.TransactionType = transaction.TransactionType;
                    string strDate = detailedTransaction.StrDate;
                    var sennaFsp = await _configurationService.GetModuleSetting(SystemSettings.SennaFSP);
                    var sennaAccountDescription = await _configurationService.GetModuleSetting(SystemSettings.SennaAccountDescription);

                    if (transaction.TransactionType == TransactionTypeEnum.Invoice)
                    {
                        if (!transaction.InvoiceId.HasValue)
                        {
                            return reference;
                        }

                        if (transaction.PolicyId == null)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "INVIND-" + strDate : "INVGRP-" + strDate;
                            return reference;
                        }

                        var prefix = GenerateRefeenceFromAbilityChartMapping(transaction, ref reference, detailedTransaction, strDate);
                        if (!prefix.IsNullOrEmpty())
                        {
                            return reference = $"{prefix}-{strDate}";
                        }

                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "INVIND-" + strDate : "INVGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.IndustryId == null)
                            {
                                return reference;
                            }

                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual)
                            {
                                if (detailedTransaction.ProductClass.Value == (int)ProductClassEnum.ValuePlus)
                                {
                                    return reference = $"{AbilityCollectionChartPrefixEnum.MVPPREM.DisplayAttributeValue()}-{strDate}";
                                }

                                else if (detailedTransaction.BankStatementEntryId != null)
                                {
                                    var unPaddedBankEntryAccount = detailedTransaction.BankAccountNumber.TrimStart('0');
                                    var accountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == unPaddedBankEntryAccount)?.DepartmentName;
                                    var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, unPaddedBankEntryAccount);

                                    return !string.IsNullOrEmpty(generatedReference) ? generatedReference : accountDescription == sennaAccountDescription ? $"{AbilityCollectionChartPrefixEnum.FSENAINVFUN.DisplayAttributeValue()}-{strDate}" : null;
                                }
                                else { reference = "INVIND-" + strDate; }

                            }
                            else
                            {
                                if (detailedTransaction.IsFuneralProduct.HasValue && !detailedTransaction.IsFuneralProduct.Value)
                                {
                                    var foundReference = await GenerateNoneFuneralTransactionReferences(transaction, detailedTransaction.ProductName);
                                    if (!string.IsNullOrEmpty(foundReference))
                                        reference = foundReference;

                                    return reference;
                                }

                                else
                                {
                                    if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Other || detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Group ||
                                        detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Senna)
                                    {
                                        reference = "INVGRP-" + strDate;
                                    }
                                    else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Metals)
                                    {
                                        reference = "INVMTL-" + strDate;
                                    }
                                    else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Mining)
                                    {
                                        reference = "INVMIN-" + strDate;
                                    }
                                }
                            }
                        }
                    }
                    else if (transaction.TransactionType == TransactionTypeEnum.CreditNote)
                    {
                        if (transaction.TransactionReason == TransactionReasonEnum.DebtWriteOff
                           || transaction.TransactionReason == TransactionReasonEnum.InterestWriteOff
                            || transaction.TransactionReason == TransactionReasonEnum.PremiumWriteOff
                            )
                        {
                            var allocations = await _invoiceService.GetInvoiceAllocationsByTransaction(transaction.TransactionId);
                            if (allocations.Where(c => c.ProductCategoryType.HasValue).ToList().Count > 0)
                            {
                                //we only need one allocation to determine the product category coid vs vaps
                                var productCategory = allocations.Select(c => c.ProductCategoryType).FirstOrDefault().Value;
                                if (productCategory != ProductCategoryTypeEnum.Funeral
                                    && productCategory != ProductCategoryTypeEnum.None)
                                    return await GenerateNoneFuneralTransactionReferences(transaction,
                                        ((ProductCategoryTypeEnum)productCategory).GetDescription().SplitCamelCaseText());
                            }
                        }

                        if (!string.IsNullOrEmpty(transaction.BankReference))
                        {
                            var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, transaction.BankReference);
                            if (!string.IsNullOrEmpty(generatedReference))
                                return generatedReference;
                        }


                        if (detailedTransaction.BankStatementEntryId != null)
                        {
                            var unPaddedBankEntryAccount = detailedTransaction.BankAccountNumber.TrimStart('0');
                            var accountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == unPaddedBankEntryAccount)?.DepartmentName;
                            if (accountDescription == sennaAccountDescription)
                            {
                                return reference = $"{AbilityCollectionChartPrefixEnum.FSENACRNFUN.DisplayAttributeValue()}-{strDate}";
                            }
                        }

                        if (detailedTransaction.InvoiceId.HasValue && detailedTransaction.ProductId.HasValue)
                        {
                            if (nonFuneralProducts.Select(c => c.Id).ToList().Contains(detailedTransaction.ProductId.Value))
                                return await GenerateNoneFuneralTransactionReferences(transaction, detailedTransaction.ProductName);

                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual && detailedTransaction.ProductClass == (int)ProductClassEnum.ValuePlus)
                            {
                                return $"{AbilityCollectionChartPrefixEnum.MVPPREM.DisplayAttributeValue()}-{strDate}";

                            }

                            var prefix = GenerateRefeenceFromAbilityChartMapping(transaction, ref reference, detailedTransaction, strDate);
                            if (!prefix.IsNullOrEmpty())
                            {
                                return reference = $"{prefix}-{strDate}";
                            }
                        }

                        //interest is only charged on coid
                        if (transaction.LinkedTransactionId != null && !transaction.InvoiceId.HasValue)
                        {
                            var originalTransacton = await _transactionService.GetTransaction((int)transaction.LinkedTransactionId);
                            if (originalTransacton.TransactionType == TransactionTypeEnum.InterestReversal || originalTransacton.TransactionType == TransactionTypeEnum.Interest)
                            {
                                return await GenerateNoneFuneralTransactionReferences(transaction, coid);
                            }
                        }

                        if (!string.IsNullOrEmpty(transaction.RmaReference) && detailedTransaction.InvoiceId != null && detailedTransaction.PolicyId != null && nonFuneralProducts.Select(c => c.Id).ToList().Contains(detailedTransaction.ProductId.Value))
                        {
                            return await GenerateNoneFuneralTransactionReferences(transaction, detailedTransaction.ProductName);
                        }

                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "CRNIND-" + strDate : "CRNGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual && transaction.Reason != null && transaction.Reason.StartsWith("Premium Payback Credit Note"))
                            {
                                reference = "PPB-CRNIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "CRNIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Other || detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Group ||
                                     detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "CRNGRP-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "CRNMTL-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "CRNMIN-" + strDate;
                            }
                        }
                    }
                    else if (transaction.TransactionType == TransactionTypeEnum.DebitNote)
                    {
                        if (transaction.TransactionReason == TransactionReasonEnum.Reinstate
                          || transaction.TransactionReason == TransactionReasonEnum.InterestReinstate
                          || transaction.TransactionReason == TransactionReasonEnum.PremiumReinstate
                           )
                        {
                            var allocations = await _invoiceService.GetInvoiceAllocationsByTransaction(transaction.TransactionId);
                            if (allocations.Where(c => c.ProductCategoryType.HasValue).ToList().Count > 0)
                            {
                                //we only need one allocation to determine the product category coid vs vaps
                                var productCategory = allocations.Select(c => c.ProductCategoryType).FirstOrDefault().Value;
                                if (productCategory != ProductCategoryTypeEnum.Funeral
                                    && productCategory != ProductCategoryTypeEnum.None)
                                    return await GenerateNoneFuneralTransactionReferences(transaction,
                                        ((ProductCategoryTypeEnum)productCategory).GetDescription().SplitCamelCaseText());
                            }
                        }

                        if (!string.IsNullOrEmpty(transaction.BankReference))
                        {
                            var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, transaction.BankReference);
                            if (!string.IsNullOrEmpty(generatedReference))
                                return generatedReference;
                        }

                        if (detailedTransaction.BankStatementEntryId != null)
                        {
                            var bankstatementEntry = await _bankStatementEntryRepository.Where(c => c.BankStatementEntryId == transaction.BankStatementEntryId).FirstOrDefaultAsync();

                            if (bankstatementEntry != null)
                            {
                                var unPaddedBankEntryAccount = bankstatementEntry.BankAccountNumber.TrimStart('0');
                                var accountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == unPaddedBankEntryAccount)?.DepartmentName;
                                var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, unPaddedBankEntryAccount);

                                return !string.IsNullOrEmpty(generatedReference) ? generatedReference : accountDescription == sennaAccountDescription ? $"{AbilityCollectionChartPrefixEnum.FSENAINVFUN.DisplayAttributeValue()}-{strDate}" : null;
                            }
                        }


                        if (transaction.InvoiceId.HasValue)
                        {
                            var invoice = await _invoiceService.GetInvoiceById(transaction.InvoiceId.Value);
                            var policy = await _roleplayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId);
                            var brokerage = await _policyService.GetPolicyBrokerageByPolicyId(invoice.PolicyId);
                            var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(transaction.RolePlayerId);
                            if (policy != null)
                            {
                                var productOption = await _productOptionService.GetProductOption(policy.ProductOptionId);
                                if (nonFuneralProducts.Select(c => c.Id).ToList().Contains(productOption.ProductId))
                                    return await GenerateNoneFuneralTransactionReferences(transaction, productOption.Name);
                            }

                            var prefix = GenerateRefeenceFromAbilityChartMapping(transaction, ref reference, detailedTransaction, strDate);
                            if (!prefix.IsNullOrEmpty())
                            {
                                return reference = $"{prefix}-{strDate}";
                            }
                        }

                        //interest is only charged on coid
                        if (transaction.LinkedTransactionId != null)
                        {
                            var originalTransacton = await _transactionService.GetTransaction((int)transaction.LinkedTransactionId);
                            if (originalTransacton.TransactionType == TransactionTypeEnum.InterestReversal || originalTransacton.TransactionType == TransactionTypeEnum.Interest)
                            {
                                return await GenerateNoneFuneralTransactionReferences(transaction, coid);
                            }
                        }


                        if (detailedTransaction.FinPayeNumber == null || !detailedTransaction.IndustryId.HasValue)
                        {
                            reference = detailedTransaction.RolePlayerTypeId.Value == (int)RolePlayerIdentificationTypeEnum.Person ? "DBNIND-" + strDate : "DBNGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual && transaction.Reason != null && transaction.Reason.StartsWith("Premium Payback Debit Note"))
                            {
                                reference = "PPB-DBNIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "DBNIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Other || detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Group ||
                                     detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "DBNGRP-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "DBNMTL-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "DBNMIN-" + strDate;
                            }
                        }
                    }
                    else if (transaction.TransactionType == TransactionTypeEnum.Payment)
                    {
                        if (!string.IsNullOrEmpty(transaction.BankReference))
                        {
                            var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, transaction.BankReference);
                            if (!string.IsNullOrEmpty(generatedReference))
                                return generatedReference;
                        }

                        var prefix = GenerateRefeenceFromAbilityChartMapping(transaction, ref reference, detailedTransaction, strDate);

                        if (!prefix.IsNullOrEmpty())      
                        {
                            return $"{prefix}-{strDate}";
                        }

                        if (detailedTransaction.BankStatementEntryId != null)
                        {
                            var unPaddedBankEntryAccount = detailedTransaction.BankAccountNumber.TrimStart('0');
                            var accountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == unPaddedBankEntryAccount)?.DepartmentName;
                            var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, unPaddedBankEntryAccount);

                            reference = !string.IsNullOrEmpty(generatedReference) ? generatedReference : accountDescription == sennaAccountDescription ? $"{AbilityCollectionChartPrefixEnum.FSENACOLFUN.DisplayAttributeValue()}-{strDate}" : null;

                            if (!reference.IsNullOrEmpty())
                                return reference;
                        }

                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "COLIND-" + strDate : "COLGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "COLIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Other || detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Group ||
                                     detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "COLGRP-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "COLMTL-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "COLMIN-" + strDate;
                            }
                        }
                    }
                    else if (transaction.TransactionType == TransactionTypeEnum.EuropAssistPremium)
                    {
                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "COLEUROPIND-" + strDate : "COLEUROPGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "COLEUROPIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Other || detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Group ||
                                     detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "COLEUROPGRP-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "COLEUROPMTL-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "COLEUROPMIN-" + strDate;
                            }
                        }
                    }
                    else if (transaction.TransactionType == TransactionTypeEnum.PaymentReversal)
                    {
                        if (detailedTransaction.BankStatementEntryId != null)
                        {
                            var bankstatementEntry = await _bankStatementEntryRepository.Where(c => c.BankStatementEntryId == transaction.BankStatementEntryId).FirstOrDefaultAsync();

                            if (bankstatementEntry != null)
                            {
                                var unPaddedBankEntryAccount = bankstatementEntry.BankAccountNumber.TrimStart('0'); ;
                                var accountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == unPaddedBankEntryAccount)?.DepartmentName;
                                var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, unPaddedBankEntryAccount);
                                if (!string.IsNullOrEmpty(generatedReference))
                                    return generatedReference;
                            }
                        }
                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "PRVIND-" + strDate : "PRVGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "PRVIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Other || detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Group ||
                                     detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "PRVGRP-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "PRVMTL-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "PRVMIN-" + strDate;
                            }
                        }
                    }

                    else if (transaction.TransactionType == TransactionTypeEnum.DebitReallocation)
                    {
                        if (!string.IsNullOrEmpty(transaction.BankReference))
                        {
                            var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, transaction.BankReference);
                            if (!string.IsNullOrEmpty(generatedReference))
                                return generatedReference;
                        }
                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "REA-DBNIND-" + strDate : "REA-DBNGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "REA-DBNIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Other || detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Group ||
                                     detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "REA-DBNGRP-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "REA-DBNMTL-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "REA-DBNMIN-" + strDate;
                            }
                        }
                    }

                    else if (transaction.TransactionType == TransactionTypeEnum.CreditReallocation)
                    {
                        if (!string.IsNullOrEmpty(transaction.BankReference))
                        {
                            var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, transaction.BankReference);
                            if (!string.IsNullOrEmpty(generatedReference))
                                return generatedReference;
                        }
                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(transaction.RolePlayerId);
                            reference = rolePlayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person ? "REA-CRNIND-" + strDate : "REA-CRNGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "REA-CRNIND-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Other || detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Group ||
                                     detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "REA-CRNGRP-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "REA-CRNMTL-" + strDate;
                            }
                            else if (detailedTransaction.IndustryClassId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "REA-CRNMIN-" + strDate;
                            }
                        }
                    }

                    else if (transaction.TransactionType == TransactionTypeEnum.Refund)
                    {
                        if (detailedTransaction.BankStatementEntryId != null)
                        {
                            var unPaddedBankEntryAccount = detailedTransaction.BankAccountNumber.TrimStart('0');
                            var accountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == unPaddedBankEntryAccount)?.DepartmentName;

                            var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, unPaddedBankEntryAccount);

                            return !string.IsNullOrEmpty(generatedReference) ? generatedReference : accountDescription == sennaAccountDescription ? $"{AbilityCollectionChartPrefixEnum.FSENAREFFUN.DisplayAttributeValue()}-{strDate}" : null;
                        }
                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "REA-CRNIND-" + strDate : "REA-CRNGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "REFIND-" + strDate;
                            }
                            else if (detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Other || detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Group || detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "REFGRP-" + strDate;
                            }
                            else if (detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "REFMTL-" + strDate;
                            }
                            else if (detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "REFMIN-" + strDate;
                            }
                        }
                    }

                    else if (transaction.TransactionType == TransactionTypeEnum.Interest)
                    {   //interest is only charged on coid
                        return await GenerateNoneFuneralTransactionReferences(transaction, coid);
                    }

                    else if (transaction.TransactionType == TransactionTypeEnum.InterestReversal)
                    {   //interest is only charged on coid
                        return await GenerateNoneFuneralTransactionReferences(transaction, coid);
                    }

                    else if (transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer)
                    {
                        if (!string.IsNullOrEmpty(transaction.BankReference))
                        {
                            var bankaccounts = await _bankAccountService.GetBankAccounts();
                            var paidIntoAccount = bankaccounts.Where(c => c.AccountNumber == transaction.BankReference).FirstOrDefault();

                            if (paidIntoAccount != null && paidIntoAccount.AccountName.IndexOf(coidClass, StringComparison.OrdinalIgnoreCase) >= 0)
                                return await GenerateNoneFuneralTransactionReferences(transaction, coid);
                        }
                        else if (string.IsNullOrEmpty(transaction.BankReference))
                        {
                            if (transaction.LinkedTransactionId.HasValue)
                            {
                                var originalCreditTransaction = await _transactionService.GetTransaction(transaction.LinkedTransactionId.Value);
                                if (originalCreditTransaction.BankStatementEntryId.HasValue)
                                {
                                    var bankstatementEntry = await _bankStatementEntryRepository.Where(c => c.BankStatementEntryId == originalCreditTransaction.BankStatementEntryId.Value).FirstOrDefaultAsync();

                                    if (bankstatementEntry != null)
                                    {
                                        var unPaddedBankEntryAccount = bankstatementEntry.BankAccountNumber.TrimStart('0'); ;
                                        var accountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == unPaddedBankEntryAccount)?.DepartmentName;
                                        var generatedReference = await GereateReferenceUsingBankReference(bankAccounts, transaction, unPaddedBankEntryAccount);
                                        if (!string.IsNullOrEmpty(generatedReference))
                                            return generatedReference;
                                    }
                                }
                            }
                        }

                        if (detailedTransaction.FinPayeNumber == null || detailedTransaction.IndustryId == 0)
                        {
                            reference = detailedTransaction.RolePlayerTypeId == (int)RolePlayerIdentificationTypeEnum.Person ? "COLIND-" + strDate : "COLGRP-" + strDate;
                        }
                        else
                        {
                            if (detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Individual)
                            {
                                reference = "IDTIND-" + strDate;
                            }
                            else if (detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Other || detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Group ||
                                     detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Senna)
                            {
                                reference = "IDTGRP-" + strDate;
                            }
                            else if (detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Metals)
                            {
                                reference = "IDTMTL-" + strDate;
                            }
                            else if (detailedTransaction.RolePlayerTypeId == (int)IndustryClassEnum.Mining)
                            {
                                reference = "IDTMIN-" + strDate;
                            }
                        }
                    }
                }
                catch(Exception ex)
                {
                    ex.LogException($"Error when Generating Transaction References- Error Message {ex.Message}- StackTrace- {ex.StackTrace}");
                }

                return reference;
            }
        }

        private static string GenerateRefeenceFromAbilityChartMapping(Transaction transaction, ref string reference, TransactionDetail detailedTransaction, string strDate)
        {
           return ChartPrefixHelper.GetChartPrefix(detailedTransaction.BrokerName, transaction.TransactionType, detailedTransaction.ProductClass).ToString();
        }

        private async Task<string> GenerateNoneFuneralTransactionReferences(Transaction transaction, string productName)
        {
            var productPrefix = string.Empty;
            var isVaps = true;
            if (!string.IsNullOrEmpty(productName))
            {
                if (productName.IndexOf(coid, StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    productPrefix = coid.ToUpper();
                    isVaps = false;
                }
                else productPrefix = await GetProductPrefix(productName);
            }

            using (_dbContextScopeFactory.Create())
            {
                var reference = string.Empty;
                var strDate = transaction.TransactionDate.ToString("ddMMyyyy");
                var finPayee = await _rolePlayerService.GetFinPayee(transaction.RolePlayerId);
                var sennaAccountDesc = await _configurationService.GetModuleSetting(SystemSettings.SennaAccountDescription);

                Industry industry = null;
                if (finPayee != null && finPayee.IndustryId > 0)
                {
                    industry = await _industryService.GetIndustry(finPayee.IndustryId);
                }

                if (industry == null)
                {
                    return reference;
                }

                if (transaction.TransactionType == TransactionTypeEnum.Invoice)
                {
                    if (!transaction.InvoiceId.HasValue)
                    {
                        return reference;
                    }
                    if (isVaps)
                    {
                        reference = $"{productPrefix}-INV-" + strDate;
                    }

                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-INV-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-INV-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-INV-" + strDate;
                    }
                }
                else if (transaction.TransactionType == TransactionTypeEnum.CreditNote)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-CRN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-CRN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-CRN-" + strDate;
                    }
                }
                else if (transaction.TransactionType == TransactionTypeEnum.DebitNote)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-DBN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-DBN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-DBN-" + strDate;
                    }
                }
                else if (transaction.TransactionType == TransactionTypeEnum.Payment)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-COL-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-COL-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-COL-" + strDate;
                    }

                    else if (transaction.BankStatementEntryId != null && isVaps)
                    {
                        var bankstatementEntry = await _bankStatementEntryRepository.Where(c => c.BankStatementEntryId == transaction.BankStatementEntryId).FirstOrDefaultAsync();

                        if (bankstatementEntry != null)
                        {
                            var unPaddedBankEntryAccount = bankstatementEntry.BankAccountNumber.TrimStart('0');
                            var account = await _bankAccountService.GetBankAccountByStringAccountNumber(unPaddedBankEntryAccount);
                            var accountDescription = account?.DepartmentName;
                            if (accountDescription == sennaAccountDesc)
                                return reference = $"{AbilityCollectionChartPrefixEnum.FSENACOLVAPS.DisplayAttributeValue()}-{strDate}";
                        }

                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Individual)
                    {
                        var bankstatementEntry = await _bankStatementEntryRepository.Where(c => c.BankStatementEntryId == transaction.BankStatementEntryId).FirstOrDefaultAsync();

                        var policy = await _policyService.GetPolicyByNumber(bankstatementEntry.UserReference2);

                        if (policy != null)
                        {
                            var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);

                            if (product.ProductClass == ProductClassEnum.ValuePlus)
                                return reference = $"{AbilityCollectionChartPrefixEnum.MVPCOL.DisplayAttributeValue()}-{strDate}";
                        }
                    }

                }

                else if (transaction.TransactionType == TransactionTypeEnum.PaymentReversal)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-PRV-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-PRV-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-PRV-" + strDate;
                    }

                }

                else if (transaction.TransactionType == TransactionTypeEnum.DebitReallocation)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Individual)
                    {
                        reference = $"{productPrefix}OTR-REA-DBN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Other || industry.IndustryClass == IndustryClassEnum.Group ||
                             industry.IndustryClass == IndustryClassEnum.Senna)
                    {
                        reference = $"-{productPrefix}REA-DBN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-REA-DBN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-REA-DBN-" + strDate;
                    }

                }

                else if (transaction.TransactionType == TransactionTypeEnum.CreditReallocation)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-REA-CRN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-REA-CRN-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-REA-CRN-" + strDate;
                    }

                }
                else if (transaction.TransactionType == TransactionTypeEnum.InterestReversal)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-INTRV-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-INTRV-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-INTRV-" + strDate;
                    }
                }
                else if (transaction.TransactionType == TransactionTypeEnum.Interest)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-INT-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-INT-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-INT-" + strDate;
                    }
                }
                else if (transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"IDT{productPrefix}OTR-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"IDT{productPrefix}MTL-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"IDT{productPrefix}MIN-" + strDate;
                    }
                }

                else if (transaction.TransactionType == TransactionTypeEnum.Refund)
                {
                    if (industry.IndustryClass == IndustryClassEnum.Other)
                    {
                        reference = $"{productPrefix}OTR-REF-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        reference = $"{productPrefix}MTL-REF-" + strDate;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Mining)
                    {
                        reference = $"{productPrefix}MIN-REF-" + strDate;
                    }

                    else if (transaction.BankStatementEntryId != null && isVaps)
                    {
                        var bankstatementEntry = await _bankStatementEntryRepository.Where(c => c.BankStatementEntryId == transaction.BankStatementEntryId).FirstOrDefaultAsync();

                        if (bankstatementEntry != null)
                        {
                            var unPaddedBankEntryAccount = bankstatementEntry.BankAccountNumber.TrimStart('0');
                            var account = await _bankAccountService.GetBankAccountByStringAccountNumber(unPaddedBankEntryAccount);
                            var accountDescription = account?.DepartmentName;
                            if (accountDescription == sennaAccountDesc)
                                return reference = $"{AbilityCollectionChartPrefixEnum.FSENAREFVAPS.DisplayAttributeValue()}-{strDate}";
                        }

                    }


                }
                return reference;
            }
        }
        private async Task<int?> GetSourceBankAccount(int transactionId, TransactionTypeEnum transactionType)
        {
            var transaction = await _transactionService.GetTransaction(transactionId);
            if (!string.IsNullOrEmpty(transaction.BankReference))
            {
                var account = await _bankAccountService.GetBankAccountByStringAccountNumber(transaction.BankReference);
                if (account != null) { return account.Id; }
                else
                {
                    return await Task.FromResult(0);
                }
            }
            else
            {// try getting bank for the different transaction types
                if (transactionType == TransactionTypeEnum.Payment || transactionType == TransactionTypeEnum.PaymentReversal || transactionType == TransactionTypeEnum.Refund)
                {
                    if (transaction != null && transaction.BankStatementEntryId.HasValue)
                    {
                        var bankEntry = await _bankStatementEntryRepository
                            .FirstOrDefaultAsync(c => c.BankStatementEntryId == transaction.BankStatementEntryId.Value);
                        var account = await _bankAccountService.GetBankAccountByStringAccountNumber(bankEntry.BankAccountNumber.TrimStart('0'));
                        if (account != null)
                            return account.Id;
                    }
                }
                var fetchedTransaction = await _transactionService.GetTransaction(transactionId);
                if (transactionType == TransactionTypeEnum.Invoice || transactionType == TransactionTypeEnum.Interest ||
                    transactionType == TransactionTypeEnum.InvoiceReversal || transactionType == TransactionTypeEnum.InterestReversal ||
                    (transactionType == TransactionTypeEnum.CreditNote && fetchedTransaction.TransactionReason != TransactionReasonEnum.DebtWriteOff))
                {
                    if (transaction != null && transaction.InvoiceId.HasValue)
                    {
                        var invoice = await _invoiceService.GetInvoice(transaction.InvoiceId.Value);
                        if (invoice != null)
                        {
                            var policy = await _roleplayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId);
                            if (policy != null)
                            {
                                var productOption = await _productOptionService.GetProductOption(policy.ProductOptionId);
                                var bankaccounts = await _productService.GetProductBankAccountsByProductId(productOption.ProductId);
                                if (bankaccounts.Count == 1)
                                {
                                    var account = await _bankAccountService.GetBankAccountById((int)bankaccounts.FirstOrDefault()?.BankAccountId);
                                    return account.Id;
                                }
                                else if (bankaccounts.Count > 1)
                                {
                                    var roleplayer = await _rolePlayerService.GetFinPayee(policy.PolicyPayeeId);
                                    if (roleplayer != null)
                                    {
                                        var industryId = roleplayer.IndustryId;
                                        var industry = await _industryService.GetIndustry(industryId);
                                        var industryClass = industry.IndustryClass;
                                        return bankaccounts.FirstOrDefault(b => b.IndustryClass == industryClass)?.BankAccountId;
                                    }
                                }
                            }
                        }
                    }
                    else if (transaction != null && transaction.BankStatementEntryId.HasValue)
                    {
                        var bankEntry = await _bankStatementEntryRepository
                            .FirstOrDefaultAsync(c => c.BankStatementEntryId == transaction.BankStatementEntryId.Value);
                        var account = await _bankAccountService.GetBankAccountByStringAccountNumber(bankEntry.BankAccountNumber.TrimStart('0'));
                        if (account != null)
                            return account.Id;
                    }
                }
                else if (transactionType == TransactionTypeEnum.InterDebtorTransfer || transactionType == TransactionTypeEnum.CreditReallocation || transactionType == TransactionTypeEnum.DebitReallocation)
                {
                    if (!string.IsNullOrEmpty(transaction.BankReference))
                    {
                        var bankaccounts = await _bankAccountService.GetBankAccounts();
                        var account = await _bankAccountService.GetBankAccountByStringAccountNumber(transaction.BankReference);
                        if (account != null)
                            return account.Id;
                    }
                    else if (string.IsNullOrEmpty(transaction.BankReference))
                    {
                        if (transaction.LinkedTransactionId.HasValue)
                        {
                            var originalCreditTransaction = await _transactionService.GetTransaction(transaction.LinkedTransactionId.Value);
                            if (originalCreditTransaction.BankStatementEntryId.HasValue)
                            {
                                var bankaccounts = await _bankAccountService.GetBankAccounts();
                                var bankEntry = await _bankStatementEntryRepository
                           .FirstOrDefaultAsync(c => c.BankStatementEntryId == originalCreditTransaction.BankStatementEntryId.Value);

                                if (bankEntry != null)
                                {
                                    var account = await _bankAccountService.GetBankAccountByStringAccountNumber(bankEntry.BankAccountNumber.TrimStart('0'));
                                    if (account != null)
                                        return account.Id;
                                }
                            }
                        }
                    }
                }
            }
            return await Task.FromResult(0);
        }
        private async Task<string> GereateReferenceUsingBankReference(List<BankAccount> bankAccounts, Transaction transaction, string bankAccount)
        {
            var results = string.Empty;
            var accountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == bankAccount)?.DepartmentName;
            var productCategory = await _billingService.GetProductCategoryByRmaBankAccount(accountDescription);
            if (productCategory != ProductCategoryTypeEnum.Funeral
                && productCategory != ProductCategoryTypeEnum.None)
                results = await GenerateNoneFuneralTransactionReferences(transaction,
                    productCategory.GetDescription().SplitCamelCaseText());
            return results;
        }
        private async Task<string> GenerateSuspenseReference(int bankaccountId, DateTime statementDate, IndustryClassEnum industryClass)
        {
            var reference = string.Empty;
            var lookUpPrefixes = Enum.GetValues(typeof(AbilityCollectionChartPrefixEnum)).Cast<AbilityCollectionChartPrefixEnum>().ToList();
            var suspenseAccountDebtor = await _suspenseDebtorBankMappingRepository.FirstOrDefaultAsync(c => c.BankAccountId == bankaccountId);
            var prefix = lookUpPrefixes.FirstOrDefault(c => c == suspenseAccountDebtor.AbilityCollectionChartPrefix);
            var strDate = statementDate.ToString("ddMMyyyy");
            if (industryClass == IndustryClassEnum.Mining)
                reference = $"{prefix.GetDescription()}-MIN-" + strDate;
            else if (industryClass == IndustryClassEnum.Metals)
                reference = $"{prefix.GetDescription()}-MTL-" + strDate;
            else if (industryClass == IndustryClassEnum.Individual)
                reference = $"{prefix.GetDescription()}-IND-" + strDate;
            else if (industryClass == IndustryClassEnum.Group)
                reference = $"{prefix.GetDescription()}-GRP-" + strDate;
            else if (industryClass == IndustryClassEnum.Other)
                reference = $"{prefix.GetDescription()}-OTR-" + strDate;
            else
                reference = $"{prefix.GetDescription()}-" + strDate;
            return reference;
        }
        private async Task<string> GenerateUnearnedReferences(Transaction transaction, string productName)
        {
            var productPrefix = string.Empty;
            if (!string.IsNullOrEmpty(productName))
            {
                if (productName.IndexOf(coid, StringComparison.OrdinalIgnoreCase) >= 0)
                    productPrefix = coid.ToUpper();
                else
                    productPrefix = await GetProductPrefix(productName);
            }

            using (_dbContextScopeFactory.Create())
            {
                var reference = string.Empty;
                var strDate = transaction.TransactionDate.ToString("ddMMyyyy");
                var finPayee = await _rolePlayerService.GetFinPayee(transaction.RolePlayerId);

                Industry industry = null;
                if (finPayee != null && finPayee.IndustryId > 0)
                {
                    industry = await _industryService.GetIndustry(finPayee.IndustryId);
                }
                if (industry.IndustryClass == IndustryClassEnum.Other)
                {
                    reference = $"UEP-{productPrefix}OTR" + strDate;
                }
                else if (industry.IndustryClass == IndustryClassEnum.Metals)
                {
                    reference = $"UEP-{productPrefix}MTL" + strDate;
                }
                else if (industry.IndustryClass == IndustryClassEnum.Mining)
                {
                    reference = $"UEP-{productPrefix}MIN" + strDate;
                }
                return reference;
            }
        }
        private async Task<string> GetProductPrefix(string productName)
        {
            var productPrefix = string.Empty;
            if (productName.IndexOf(gpa, StringComparison.OrdinalIgnoreCase) >= 0)
                productPrefix = "GPANC";
            else if (productName.IndexOf("international", StringComparison.OrdinalIgnoreCase) >= 0)
                productPrefix = "CINTNC";
            else if (productName.IndexOf("plus", StringComparison.OrdinalIgnoreCase) >= 0)
                productPrefix = "CPLUSNC";
            else if (productName.IndexOf(cjp, StringComparison.OrdinalIgnoreCase) >= 0)
                productPrefix = "CJPNC";
            else if (productName.IndexOf(riot, StringComparison.OrdinalIgnoreCase) >= 0)
                productPrefix = "RIONC";
            else if (productName.IndexOf(aug, StringComparison.OrdinalIgnoreCase) >= 0)
                productPrefix = $"{aug}NC".ToUpper();
            else if (productName.IndexOf("vaps", StringComparison.OrdinalIgnoreCase) >= 0)
                productPrefix = $"VAPSNC".ToUpper();

            return productPrefix;
        }
        private async Task<string> GetProductNameByInvoice(int invoiceId)
        {
            var invoice = await _invoiceService.GetInvoiceById(invoiceId);
            var policy = await _roleplayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId);
            var productOption = await _productOptionService.GetProductOption(policy.ProductOptionId);
            return productOption.Name;
        }

        private async Task<AbilityTransactionsAudit> GetAbilityTransactionsAuditByTransactionId(int transactionId)
        {
            using (_dbContextScopeFactory.Create())
            {
                var abilityTransactionsAudit = await _abilityTransactionsAuditRepository
                    .Where(x => x.TransactionId == transactionId).FirstOrDefaultAsync();

                return Mapper.Map<AbilityTransactionsAudit>(abilityTransactionsAudit);
            }
        }

        #endregion
    }
}