using AutoMapper;

using Hyphen.FACS;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.Billing.Utils;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Entities.Commissions;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.FinCare.Contracts.Interfaces.Commissions;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;

using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Text;
using System.Threading.Tasks;

using FinPayee = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.FinPayee;
using Transaction = RMA.Service.Billing.Contracts.Entities.Transaction;

namespace RMA.Service.Billing.Services
{
    public class CollectionFacade : RemotingStatelessService, ICollectionService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const string autoDebitOrdersNoDataTransformations = "AutoDebitOrdersNoDataTransformations";
        private const string validRecordId = "91";
        private const string debitOrderDocumentType = "DO";
        private const string Suspence = "Suspence";
        private const int accountNumberPadding = 16;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_Collection> _collectionRepository;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IRepository<billing_CollectionBatch> _collectionBatchRepository;
        private readonly IRepository<payment_FacsTransactionResult> _facsResultRepository;
        private readonly IRepository<finance_BankStatementEntry> _facsStatementRepository;
        private readonly IBankFacsRequestService _bankFacsRequestService;
        private readonly IBankAccountService _bankAccountService;
        private readonly IConfigurationService _configurationService;
        private readonly ISendEmailService _emailService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IInvoiceService _invoiceService;
        private readonly IRepository<billing_AdhocPaymentInstruction> _adhocCollectionRepository;
        private readonly ICommissionService _commissionService;
        private readonly ITransactionService _transactionService;
        private readonly IRepository<billing_UnallocatedPayment> _unallocatedPaymentRepository;
        private readonly IRepository<billing_InvoiceAllocation> _invoiceAllocationRepository;

        private readonly IInterBankTransferService _interBankTransferService;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly IIndustryService _industryService;
        private readonly IProductOptionService _productOptionService;
        private readonly IProductService _productService;
        private readonly IClaimRecoveryInvoiceService _claimRecoveryInvoiceService;
        private readonly ISerializerService _serializerService;
        private readonly IWizardService _wizardService;
        private readonly IPeriodService _periodService;
        private readonly IBankBranchService _bankBranchService;
        private readonly IBankService _bankService;
        private readonly IRepository<client_RolePlayerBankingDetail> _rolePlayerBankingDetailRepository;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<billing_PremiumListingTransaction> _premiumListingRepository;
        private readonly IPaymentAllocationService _paymentAllocationService;
        private readonly IRepository<billing_TermArrangement> _termArrangementRepository;
        private readonly IRepository<billing_TermArrangementSchedule> _termArrangementScheduleRepository;
        private readonly IRepository<billing_AutoAllocationBankAccount> _autoAllocationBankAccountRepository;
        private readonly IRepository<billing_TermDebitOrderRolePlayerBankingDetail> _termDebitOrderRolePlayerBankingDetailRepository;
        private readonly ITermsArrangementService _termsArrangementService;
        private readonly IRepository<billing_AdhocPaymentInstructionsTermArrangementSchedule> _adhocPaymentInstructionsTermArrangementScheduleRepository;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IBillingService _billingService;
        private readonly IPolicyService _policyService;
        private readonly IAbilityTransactionsAuditService _abilityTransactionsAuditService;
        private readonly IRepository<billing_SuspenseDebtorBankMapping> _suspenseDebtorBankMappingRepository;
        public CollectionFacade(
           StatelessServiceContext context,
           IDbContextScopeFactory dbContextScopeFactory,
           IRepository<billing_Collection> collectionRepository,
           IRepository<billing_Invoice> invoiceRepository,
           IRepository<billing_CollectionBatch> collectionBatchRepository,
           IRepository<payment_FacsTransactionResult> facsResultRepository,
           IRepository<finance_BankStatementEntry> facsStatementRepository,
           IBankAccountService bankAccountService,
           IConfigurationService configurationService,
           ISendEmailService emailService,
           IRolePlayerPolicyService rolePlayerPolicyService,
           IRolePlayerService rolePlayerService,
           IInvoiceService invoiceService,
           IRepository<billing_AdhocPaymentInstruction> adhocCollectionRepository,
           ICommissionService commissionService,
           ITransactionService transactionService,
           IRepository<billing_UnallocatedPayment> unallocatedPaymentRepository,
           IRepository<billing_InvoiceAllocation> invoiceAllocationRepository,
        IInterBankTransferService interBankTransferService,
           IRepository<billing_Transaction> transactionRepository,
           IIndustryService industryService,
           IProductOptionService productOptionService,
           IProductService productService,
           IClaimRecoveryInvoiceService claimRecoveryInvoiceService,
           ISerializerService serializerService,
           IWizardService wizardService,
           IPeriodService periodService,
           IBankBranchService bankBranchService,
           IBankService bankService,
           IRepository<client_RolePlayerBankingDetail> rolePlayerBankingDetailRepository,
           IRepository<policy_Policy> policyRepository,
           IRepository<client_RolePlayer> rolePlayerRepository,
           IRepository<billing_PremiumListingTransaction> premiumListingRepository,
           IPaymentAllocationService paymentAllocationService,
           IRepository<billing_TermArrangement> termArrangementRepository,
           IRepository<billing_TermArrangementSchedule> termArrangementScheduleRepository,
           IRepository<billing_AutoAllocationBankAccount> autoAllocationBankAccountRepository,
           IRepository<billing_TermDebitOrderRolePlayerBankingDetail> termDebitOrderRolePlayerBankingDetailRepository,
           IBankFacsRequestService bankFacsRequestService,
           ITermsArrangementService termsArrangementService,
           IRepository<billing_AdhocPaymentInstructionsTermArrangementSchedule> adhocPaymentInstructionsTermArrangementScheduleRepository,
           IDocumentIndexService documentIndexService,
           IBillingService billingService,
           IPolicyService policyService,
           IAbilityTransactionsAuditService abilityTransactionsAuditService,
         IRepository<billing_SuspenseDebtorBankMapping> suspenseDebtorBankMappingRepository

         ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _collectionRepository = collectionRepository;
            _invoiceRepository = invoiceRepository;
            _collectionBatchRepository = collectionBatchRepository;
            _facsResultRepository = facsResultRepository;
            _bankAccountService = bankAccountService;
            _configurationService = configurationService;
            _emailService = emailService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _rolePlayerService = rolePlayerService;
            _invoiceService = invoiceService;
            _adhocCollectionRepository = adhocCollectionRepository;
            _bankFacsRequestService = bankFacsRequestService;
            _facsStatementRepository = facsStatementRepository;
            _commissionService = commissionService;
            _transactionService = transactionService;
            _unallocatedPaymentRepository = unallocatedPaymentRepository;
            _interBankTransferService = interBankTransferService;
            _transactionRepository = transactionRepository;
            _industryService = industryService;
            _productOptionService = productOptionService;
            _productService = productService;
            _claimRecoveryInvoiceService = claimRecoveryInvoiceService;
            _serializerService = serializerService;
            _wizardService = wizardService;
            _periodService = periodService;
            _bankBranchService = bankBranchService;
            _bankService = bankService;
            _rolePlayerBankingDetailRepository = rolePlayerBankingDetailRepository;
            _policyRepository = policyRepository;
            _rolePlayerRepository = rolePlayerRepository;
            _premiumListingRepository = premiumListingRepository;
            _paymentAllocationService = paymentAllocationService;
            _termArrangementRepository = termArrangementRepository;
            _termArrangementScheduleRepository = termArrangementScheduleRepository;
            _autoAllocationBankAccountRepository = autoAllocationBankAccountRepository;
            _invoiceAllocationRepository = invoiceAllocationRepository;
            _termDebitOrderRolePlayerBankingDetailRepository = termDebitOrderRolePlayerBankingDetailRepository;
            _termsArrangementService = termsArrangementService;
            _adhocPaymentInstructionsTermArrangementScheduleRepository = adhocPaymentInstructionsTermArrangementScheduleRepository;
            _documentIndexService = documentIndexService;
            _billingService = billingService;
            _policyService = policyService;
            _abilityTransactionsAuditService = abilityTransactionsAuditService;
            _suspenseDebtorBankMappingRepository = suspenseDebtorBankMappingRepository;
        }

        public async Task<List<Collection>> GetCollections()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var collections = await _collectionRepository
                    .Where(tr => tr.CollectionsId > 0)
                    .ToListAsync();
                await _collectionRepository.LoadAsync(collections, x => x.Invoice);
                return Mapper.Map<List<Collection>>(collections);
            }
        }

        public async Task<Collection> GetCollection(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (_dbContextScopeFactory.Create())
            {
                var collection = await _collectionRepository
                    .SingleAsync(tr => tr.CollectionsId == id,
                        $"Could not find collection with id {id}");
                await _collectionRepository.LoadAsync(collection, x => x.Invoice);

                return Mapper.Map<Collection>(collection);
            }
        }

        public async Task<int> AddCollection(Collection collection)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddCollection);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_Collection>(collection);
                _collectionRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.CollectionsId;
            }
        }

        public async Task EditCollection(Collection collection)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditCollection);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataCrossRef = await _collectionRepository.Where(x => x.CollectionsId == collection.CollectionsId).SingleAsync();

                _collectionRepository.Update(dataCrossRef);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task AddhocCollections(List<AdhocPaymentInstruction> collections)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddCollection);

            Contract.Requires(collections != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var collection in collections)
                {
                    var paymentInstruction = new billing_AdhocPaymentInstruction
                    {
                        DateToPay = collection.DateToPay.ToSaDateTime(),
                        AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Pending,
                        Amount = collection.Amount,
                        RolePlayerId = collection.RolePlayerId,
                        RolePlayerName = collection.RolePlayerName,
                        Reason = collection.Reason
                    };
                    _adhocCollectionRepository.Create(paymentInstruction);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

        }

        public async Task SubmitCollection(CollectionMessage message)
        {
            if (message == null)
                return;

            Collection collection;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var collectionEntity = await _collectionRepository.FindByIdAsync(message.CollectionId);

                if (collectionEntity == null)
                {
                    return;
                }
                await _collectionRepository.LoadAsync(collectionEntity, c => c.TermArrangementSchedule);
                await _collectionRepository.LoadAsync(collectionEntity, c => c.AdhocPaymentInstruction);

                if (string.IsNullOrEmpty(message.BatchReference))
                {
                    message.BatchReference = GenerateBatchReferenceNumber();
                    var batchEntity = new billing_CollectionBatch
                    {
                        CreatedDate = DateTimeHelper.SaNow,
                        Reference = message.BatchReference,
                    };
                    _collectionBatchRepository.Create(batchEntity);
                    collectionEntity.CollectionBatch = batchEntity;
                    _collectionRepository.Update(collectionEntity);
                    await scope.SaveChangesAsync();
                }
                collection = Mapper.Map<Collection>(collectionEntity);
            }

            await DoCollect(collection, message.BatchReference);
        }

        private async Task<List<billing_AdhocPaymentInstruction>> GetAdhocPaymentInstructionsReadyToCollect(int numberOfDaysInAdvance)
        {
            var effectiveDate = DateTime.Now.AddDays(numberOfDaysInAdvance).StartOfTheDay();
            var dateToday = DateTime.Now.StartOfTheDay();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await (from instructions in _adhocCollectionRepository
                                      join collections in _collectionRepository on instructions.AdhocPaymentInstructionId equals collections.AdhocPaymentInstructionId
                                      into results
                                      from collections in results.DefaultIfEmpty()
                                      where collections.AdhocPaymentInstructionId == null && instructions.AdhocPaymentInstructionStatus == AdhocPaymentInstructionStatusEnum.Pending
                                      && effectiveDate >= instructions.DateToPay && instructions.Amount > 0 && instructions.DateToPay >= dateToday
                                      select instructions).Take(200).ToListAsync();

                return entities;
            }
        }

        public async Task GenerateCollections()
        {
            try
            {
                var numberOfDaysInAdvance =
                           await _configurationService.GetModuleSetting(SystemSettings
                               .DebitOrderDaysInAdvance);
                var effectiveDate = DateTime.Now.StartOfTheDay().AddDays(int.Parse(numberOfDaysInAdvance));

                var invoices = new List<Invoice>();
                if (await _configurationService.IsFeatureFlagSettingEnabled(autoDebitOrdersNoDataTransformations))
                    invoices = await _invoiceService.GetInvoicesReadyToCollect();

                foreach (var invoice in invoices)
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var entity = await _collectionRepository
                            .Where(s => s.InvoiceId == invoice.InvoiceId)
                            .FirstOrDefaultAsync();

                        if (entity != null) continue;

                        var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId);

                        if (policy == null) continue;

                        var bankingDetails = await _rolePlayerService.GetActiveBankingDetails(policy.PolicyPayeeId);

                        if (bankingDetails == null) continue;

                        if (policy.PaymentMethod != PaymentMethodEnum.DebitOrder) continue;

                        // DO NOT REMOVE
                        // var policyOwner = await _rolePlayerService.GetRolePlayerWithoutReferenceData(policy.PolicyOwnerId);
                        /* if (!policyOwner.IsNatural && policy.InstallmentPremium != invoice.TotalInvoiceAmount)
                        {
                            var finPaye = await _rolePlayerService.GetFinPayee(policyOwner.RolePlayerId);

                            // create adhoc debit order wizard
                            var adhocPaymentInstruction = new AdhocPaymentInstruction
                            {
                                Amount = invoice.TotalInvoiceAmount,
                                AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Pending,
                                FinPayeNumber = finPaye.FinPayeNumber,
                                RolePlayerName = policyOwner.DisplayName
                            };

                            await CreateAdhocDebitOrderWizard(adhocPaymentInstruction);
                            continue;
                        } */

                        if (invoice.Balance > 0)
                        {
                            entity = new billing_Collection
                            {
                                CollectionStatus = CollectionStatusEnum.Pending,
                                InvoiceId = invoice.InvoiceId,
                                MaxSubmissionCount = 10, //   should there be a max?
                                PolicyId = invoice.PolicyId,
                                RolePlayerBankingId = bankingDetails.RolePlayerBankingId,
                                BankReference = policy.PolicyNumber,
                                Amount = invoice.Balance,
                                CollectionType = CollectionTypeEnum.Normal,
                                CollectionsDebtorBankAccountSource = CollectionsDebtorBankAccountSourceEnum.ClientRoleplayerBanking,
                                EffectiveDate = invoice.CollectionDate
                            };

                            _collectionRepository.Create(entity);
                        }

                        await scope.SaveChangesAsync();
                    }
                }

                var adhocPaymentInstructions = await GetAdhocPaymentInstructionsReadyToCollect(int.Parse(numberOfDaysInAdvance));

                foreach (var adhocPaymentInstruction in adhocPaymentInstructions)
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var entity = await _collectionRepository
                            .Where(s => s.AdhocPaymentInstructionId == adhocPaymentInstruction.AdhocPaymentInstructionId)
                            .FirstOrDefaultAsync();

                        if (entity != null) continue;

                        var finPayee =
                            await _rolePlayerService.GetFinPayee(adhocPaymentInstruction
                                .RolePlayerId);

                        if (finPayee == null) continue;

                        var bankingDetails = await _rolePlayerService.GetBankDetailByBankAccountId(adhocPaymentInstruction.RolePlayerBankingId.Value);

                        if (bankingDetails == null)
                        {
                            adhocPaymentInstruction.ErrorDescription = "No active banking details found for the rolePlayerBankingId";
                            _adhocCollectionRepository.Update(adhocPaymentInstruction);
                            await scope.SaveChangesAsync();
                            continue;
                        }

                        entity = new billing_Collection
                        {
                            CollectionStatus = CollectionStatusEnum.Pending,
                            MaxSubmissionCount = 10, //   should there be a max?
                            RolePlayerBankingId = bankingDetails.RolePlayerBankingId,
                            BankReference = finPayee.FinPayeNumber,
                            Amount = adhocPaymentInstruction.Amount,
                            CollectionType = CollectionTypeEnum.Adhoc,
                            AdhocPaymentInstructionId = adhocPaymentInstruction.AdhocPaymentInstructionId,
                            CollectionsDebtorBankAccountSource = CollectionsDebtorBankAccountSourceEnum.ClientRoleplayerBanking,
                            EffectiveDate = adhocPaymentInstruction.DateToPay
                        };
                        _collectionRepository.Create(entity);

                        await scope.SaveChangesAsync();
                    }
                }


                var termSchedules = await GetTermArrangementsReadyToCollect(int.Parse(numberOfDaysInAdvance));

                foreach (var termSchedule in termSchedules)
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var entity = await _collectionRepository
                     .Where(s => s.TermArrangementScheduleId == termSchedule.TermArrangementScheduleId)
                     .FirstOrDefaultAsync();
                        if (entity != null) continue;

                        var termArrangement = termSchedule.TermArrangement;
                        if (termArrangement != null)
                        {
                            var finPayee =
                               await _rolePlayerService.GetFinPayee((int)termSchedule.TermArrangement
                                   .RolePlayerId);

                            if (finPayee == null) continue;

                            var termDebitOrderRolePlayerBankingDetail = await _termDebitOrderRolePlayerBankingDetailRepository.FirstOrDefaultAsync(t => t.TermArrangementId == termArrangement.TermArrangementId);

                            if (termDebitOrderRolePlayerBankingDetail == null)
                            {
                                //skip if no active debit order banking details found for the termArrangementId
                                continue;
                            }

                            entity = new billing_Collection
                            {
                                CollectionStatus = CollectionStatusEnum.Pending,
                                MaxSubmissionCount = 10,
                                RolePlayerBankingId = termDebitOrderRolePlayerBankingDetail.RolePlayerBankingId,
                                BankReference = finPayee.FinPayeNumber,
                                Amount = termSchedule.CollectBalance ? (termSchedule.Amount - termSchedule.AdhocPaymentInstructionsTermArrangementSchedules.Where(x => x.IsActive && !x.IsDeleted).Select(x => x.Amount).Sum()) : termSchedule.Amount,
                                CollectionType = CollectionTypeEnum.TermsArrangement,
                                TermArrangementScheduleId = termSchedule.TermArrangementScheduleId,
                                CollectionsDebtorBankAccountSource = CollectionsDebtorBankAccountSourceEnum.BillingTermDebitOrderBanking,
                                EffectiveDate = termSchedule.PaymentDate
                            };

                            _collectionRepository.Create(entity);
                            await scope.SaveChangesAsync();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Generating Collections - Error Message {ex.Message}");
            }
        }

        public async Task<Collection> GetById(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _collectionRepository
                    .Where(s => s.CollectionsId == id)
                    .SingleOrDefaultAsync();
                return Mapper.Map<Collection>(result);
            }
        }

        private static string GenerateBatchReferenceNumber()
        {
            var date = DateTimeHelper.SaNow.ToString("yyMMddHHmmss");
            return $"B{date}";
        }

        private async Task DoCollect(Collection collection, string batchReference)
        {
            //Confirm that collection is not already submitted
            var existingCollection = await GetById(collection.CollectionsId);
            if (existingCollection.CollectionStatus == CollectionStatusEnum.Submitted)
            {
                throw new TechnicalException(
                    $"Duplicate Collection Request. Collection ID - {collection.CollectionsId}");
            }

            try
            {
                RootBankFACSConfirmation collectionResponse = null;

                using (var scope = _dbContextScopeFactory.Create())
                {
                    BankAccount accountDetail = null;
                    int rolePlayerId = 0;
                    RolePlayerPolicy policy = null;
                    if (collection.PolicyId.HasValue)
                    {
                        policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(collection.PolicyId.Value);
                    }
                    else if (collection.AdhocPaymentInstructionId.HasValue)
                    {
                        var entity = Mapper.Map<billing_Collection>(collection);
                        await _collectionRepository.LoadAsync(entity, c => c.AdhocPaymentInstruction);
                        collection.AdhocPaymentInstruction = Mapper.Map<AdhocPaymentInstruction>(entity.AdhocPaymentInstruction);

                        var debtorPolicies = await
                            _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(entity.AdhocPaymentInstruction.RolePlayerId);

                        if (debtorPolicies.Count == 0)
                        {
                            return;
                        }

                        policy = debtorPolicies[0];
                    }
                    else if (collection.TermArrangementScheduleId.HasValue)
                    {
                        var entity = Mapper.Map<billing_Collection>(collection);
                        var termarrangementSchedule = await _termArrangementScheduleRepository.FirstOrDefaultAsync(c => c.TermArrangementScheduleId == collection.TermArrangementScheduleId);
                        var termarrangement = await _termArrangementRepository.FirstOrDefaultAsync(c => c.TermArrangementId == termarrangementSchedule.TermArrangementId);
                        rolePlayerId = termarrangement.RolePlayerId.Value;
                        if (termarrangement.BankAccountId.HasValue)
                        {
                            accountDetail = await _bankAccountService.GetBankAccountByAccountNumber(termarrangement.BankAccountId.Value);
                        }
                        else
                        {
                            var debtorPolicies = await _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(termarrangement.RolePlayerId.Value);
                            if (debtorPolicies.Count == 0)
                            {
                                return;
                            }

                            policy = debtorPolicies[0];
                        }

                    }

                    if (accountDetail == null)
                    {
                        var debtor = await _rolePlayerService.GetFinPayee(policy.PolicyPayeeId);

                        rolePlayerId = policy.PolicyPayeeId;

                        var industry = await _industryService.GetIndustry(debtor.IndustryId);

                        var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                        var productBankAccount =
                            product.ProductBankAccounts.FirstOrDefault(p =>
                                p.IndustryClass == industry.IndustryClass);

                        accountDetail = await _bankAccountService.GetBankAccountByAccountNumber(productBankAccount.BankAccountId);
                    }


                    if (accountDetail != null)
                    {
                        var response = await _bankFacsRequestService.SubmitCollection(collection, accountDetail, rolePlayerId);
                        if (response.statusCode == ((int)HttpStatusCode.InternalServerError).ToString())
                        {
                            var sender =
                                await _configurationService.GetModuleSetting(SystemSettings
                                    .PaymentManagerEmailNotificationSender);
                            var recipient =
                                await _configurationService.GetModuleSetting(SystemSettings
                                    .PaymentManagerHyphenServiceErrorRecipients);

                            collection.CollectionRejectionType = CollectionRejectionTypeEnum.HyphenService;
                            collection.ErrorCode = "500";
                            collection.ErrorDescription = "Internal Server Error";
                            collection.SubmissionDate = null;
                            collection.CollectionStatus = CollectionStatusEnum.Rejected;
                            collection.CanResubmit = true;

                            var isLiveEnvironmentSettingAsString =
                                await _configurationService.GetModuleSetting(SystemSettings
                                    .PaymentManagerIsLiveEnvironment);
                            var isLiveEnvironment = isLiveEnvironmentSettingAsString.ToBoolean(false);

                            var emailRequest = new SendMailRequest
                            {
                                ItemId = collection.CollectionsId,
                                ItemType = "Collection",
                                Recipients = recipient,
                                Body = isLiveEnvironment
                                    ? $"Error encountered while trying to submit a debit order with Collection ID {collection.CollectionsId} to the Hyphen FACS service on PRODUCTION environment"
                                    : $"Error encountered while trying to submit a debit order with Collection ID {collection.CollectionsId} to the Hyphen FACS service on Test environment",
                                IsHtml = false,
                                FromAddress = sender,
                                Subject = "Collections - Hyphen FACS service error (500)"
                            };

                            await _emailService.SendEmail(emailRequest);

                        }
                        else
                        {
                            var rolePlayerBankingDetail = await _rolePlayerBankingDetailRepository.FirstOrDefaultAsync(x => x.RolePlayerBankingId == collection.RolePlayerBankingId);
                            collectionResponse = response;
                            if (collectionResponse.statusCode == (((int)HttpStatusCode.OK).ToString()))
                            {
                                collection.ErrorCode = string.Empty;
                                collection.ErrorDescription = string.Empty;
                                collection.CanResubmit = null;
                                collection.SubmissionDate = DateTimeHelper.SaNow;
                                collection.CollectionRejectionType = null;
                                collection.CollectionStatus = CollectionStatusEnum.Submitted;
                                collection.RejectionDate = null;

                                //log audit notes
                                string text = $"Debit Order Collection Instruction submittion to Hyphen was successfully";
                                if (rolePlayerBankingDetail != null)
                                {
                                    var note = new BillingNote
                                    {
                                        ItemId = rolePlayerBankingDetail.RolePlayerId,
                                        ItemType = BillingNoteTypeEnum.Collection.GetDescription(),
                                        Text = text
                                    };
                                    await _billingService.AddBillingNote(note);
                                }
                            }
                            else
                            {
                                collection.ErrorCode = collectionResponse.bankFACSConfirmation.errorCode;
                                collection.ErrorDescription =
                                    FACSErrorCodes.GetRequestErrorDescription(collection.ErrorCode);
                                collection.SubmissionDate = null;
                                collection.CollectionStatus = CollectionStatusEnum.Rejected;
                                collection.RejectionDate = DateTimeHelper.SaNow;

                                collection = await ProcessCollectionErrorResponse(collection);

                                //log audit notes
                                string text = $"Debit Order Collection Instruction submittion to Hyphen was rejected.  Amount:{collection.Amount}, Date to Pay: {collection.EffectiveDate} ";
                                if (rolePlayerBankingDetail != null)
                                {
                                    var note = new BillingNote
                                    {
                                        ItemId = rolePlayerBankingDetail.RolePlayerId,
                                        ItemType = BillingNoteTypeEnum.Collection.GetDescription(),
                                        Text = text
                                    };
                                    await _billingService.AddBillingNote(note);
                                }
                            }

                            collection.SubmissionCount += 1;
                        }

                        collection.BatchReference = batchReference;

                        var batch = await _collectionBatchRepository.Where(b => b.Reference == batchReference)
                            .FirstOrDefaultAsync();
                        if (batch != null)
                        {
                            if (collection.CollectionBatchId == null)
                                collection.CollectionBatchId = batch.CollectionBatchId;
                        }

                        collection.SubmittedClientAccount = await GetCollectionDebtorBankAccount(existingCollection);
                        _collectionRepository.Update(Mapper.Map<billing_Collection>(collection));

                        await scope.SaveChangesAsync();
                    }
                }

                if (collectionResponse != null)
                {
                    var facsTransactionResult = new payment_FacsTransactionResult
                    {
                        ActionDate = collectionResponse.bankFACSConfirmation.actionDate,
                        AgencyNumber = collectionResponse.bankFACSConfirmation.agencyNumber,
                        AgencyPrefix = collectionResponse.bankFACSConfirmation.agencyPrefix,
                        Amount = collectionResponse.bankFACSConfirmation.amount,
                        BankAccountNumber = collectionResponse.bankFACSConfirmation.bankAccountNumber,
                        ChequeClearanceCode = collectionResponse.bankFACSConfirmation.chequeClearanceCode,
                        ChequeNumber = collectionResponse.bankFACSConfirmation.chequeNumber,
                        DepositType = collectionResponse.bankFACSConfirmation.depositType,
                        DocumentNumber = collectionResponse.bankFACSConfirmation.documentNumber,
                        DocumentType = collectionResponse.bankFACSConfirmation.documentType,
                        CollectionId = collection.CollectionsId,
                        Reference1 = collectionResponse.bankFACSConfirmation.reference1,
                        Reference2 = collectionResponse.bankFACSConfirmation.reference2,
                        RequisitionNumber = collectionResponse.bankFACSConfirmation.requisitionNumber,
                        TransactionType = collectionResponse.bankFACSConfirmation.transactionType,
                        UniqueUserCode = collectionResponse.bankFACSConfirmation.uniqueUserCode,
                        IsActive = true
                    };

                    await AddFacsTransactioResult(facsTransactionResult);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error Submitting Collection Request. Collection ID - {collection.CollectionsId}: message {ex.Message}");
                throw;
            }
        }

        private async Task AddFacsTransactioResult(payment_FacsTransactionResult facsTransactionResult)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                //Deactivate ald
                var previousResults = await _facsResultRepository
                    .Where(d => d.CollectionId == facsTransactionResult.CollectionId && d.IsActive && !d.IsDeleted)
                    .ToListAsync();

                foreach (var previousResult in previousResults)
                {
                    var entity = previousResult;
                    entity.IsActive = false;
                    _facsResultRepository.Update(entity);
                }

                //Add new
                _facsResultRepository.Create(facsTransactionResult);
                await scope.SaveChangesAsync();
            }
        }

        private async Task<Collection> ProcessCollectionErrorResponse(Collection collection)
        {
            if (collection.PolicyId.HasValue)
            {
                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicy(collection.PolicyId.Value);

                if (BankFacsUtils.BankingDetailsRejectionCodes.Contains(collection.ErrorCode))
                {
                    collection.CollectionRejectionType = CollectionRejectionTypeEnum.BankingDetails;
                    collection.CanResubmit = false;

                    await _rolePlayerPolicyService.ProcessCollectionBankingDetailRejection(collection.PolicyId.Value,
                        collection.ErrorDescription, collection.AccountNo, collection.Bank, collection.BankBranch, policy.PolicyOwner.DisplayName);
                }
                else if (BankFacsUtils.PayeeDetailsRejectionCodes.Contains(collection.ErrorCode))
                {
                    collection.CollectionRejectionType = CollectionRejectionTypeEnum.DebtorDetails;
                    collection.CanResubmit = false;

                    await _rolePlayerPolicyService.ProcessCollectionBankingDetailRejection(collection.PolicyId.Value,
                        collection.ErrorDescription, collection.AccountNo, collection.Bank, collection.BankBranch, policy.PolicyOwner.DisplayName);
                }
                else if (BankFacsUtils.PayoutAmountRejectionCodes.Contains(collection.ErrorCode))
                {
                    collection.CollectionRejectionType = CollectionRejectionTypeEnum.CollectionAmount;
                    collection.CanResubmit = false;

                    await _rolePlayerPolicyService.ProcessCollectionBankingDetailRejection(collection.PolicyId.Value,
                        collection.ErrorDescription, collection.AccountNo, collection.Bank, collection.BankBranch, policy.PolicyOwner.DisplayName);
                }
                else if (BankFacsUtils.SenderAccountConfigRejectionCodes.Contains(collection.ErrorCode))
                {
                    collection.CollectionRejectionType = CollectionRejectionTypeEnum.CollectionAccountConfiguration;
                    collection.CanResubmit = false;

                    var sender =
                        await _configurationService.GetModuleSetting(SystemSettings
                            .PaymentManagerEmailNotificationSender);
                    var recipient =
                        await _configurationService.GetModuleSetting(SystemSettings
                            .PaymentManagerSenderAccountConfigErrorRecipients);

                    var emailRequest = new SendMailRequest
                    {
                        ItemId = collection.CollectionsId,
                        ItemType = "Collection",
                        Recipients = recipient,
                        Body =
                            $"Error encountered while trying to collect for Policy with policy number: {policy.PolicyNumber}. The collection account configuration is incorrect.",
                        IsHtml = false,
                        FromAddress = sender,
                        Subject = "Collections - Collection Account Configuration Error"
                    };

                    try
                    {
                        await _emailService.SendEmail(emailRequest);
                    }
                    catch (Exception e)
                    {
                        //Failure to send a notification should not affect the payout response handling process
                        e.LogException();
                    }
                }
                else if (BankFacsUtils.HyphenServiceRejectionCodes.Contains(collection.ErrorCode))
                {
                    collection.CollectionRejectionType = CollectionRejectionTypeEnum.HyphenService;
                    collection.CanResubmit = true;

                    var sender =
                        await _configurationService.GetModuleSetting(SystemSettings
                            .PaymentManagerEmailNotificationSender);
                    var recipient =
                        await _configurationService.GetModuleSetting(SystemSettings
                            .PaymentManagerHyphenServiceErrorRecipients);

                    var emailRequest = new SendMailRequest
                    {
                        ItemId = collection.CollectionsId,
                        ItemType = "Collection",
                        Recipients = recipient,
                        Body =
                            $"Error encountered while trying to sending a transaction with Collection ID {collection.CollectionsId} to the Hyphen FACS service.",
                        IsHtml = false,
                        FromAddress = sender,
                        Subject = "Collections - Hyphen FACS service error (500)"
                    };

                    try
                    {
                        await _emailService.SendEmail(emailRequest);
                    }
                    catch (Exception e)
                    {
                        //Failure to send a notification should not affect the payout response handling process
                        e.LogException();
                    }
                }
            }
            else
            {
                var entity = Mapper.Map<billing_Collection>(collection);
                await _collectionRepository.LoadAsync(entity, c => c.AdhocPaymentInstruction);
                collection.AdhocPaymentInstruction = Mapper.Map<AdhocPaymentInstruction>(entity.AdhocPaymentInstruction);
                collection.AdhocPaymentInstruction.AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Unpaid;
                collection.AdhocPaymentInstruction.ErrorDescription = collection.ErrorDescription;
            }

            return collection;
        }

        public async Task QueuePendingCollections(DateTime? startDate = null, DateTime? endDate = null)
        {   //recent file changes not deployed. Old code is still executing despite recent file changes.

            try
            {
                var collections = new List<Collection>();
                var batchReference = GenerateBatchReferenceNumber();

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var processingDate = DateTime.Now.StartOfTheDay();
                    var entities = startDate.HasValue && endDate.HasValue ?
                                       await _collectionRepository
                                        .Where(d => ((d.CollectionStatus == CollectionStatusEnum.Pending && d.EffectiveDate > processingDate) ||
                                             (d.CollectionStatus == CollectionStatusEnum.Rejected && d.CanResubmit.Value))
                                             && d.CreatedDate >= startDate && d.CreatedDate <= endDate)
                                        .OrderBy(d => d.CreatedDate).ToListAsync()
                        : await _collectionRepository
                              .Where(d => (d.CollectionStatus == CollectionStatusEnum.Pending && d.EffectiveDate > processingDate) ||
                                           (d.CollectionStatus == CollectionStatusEnum.Rejected && d.CanResubmit.Value))
                              .OrderBy(d => d.CreatedDate).ToListAsync();

                    if (entities.Count > 0)
                    {
                        var batchEntity = new billing_CollectionBatch
                        {
                            CreatedDate = DateTimeHelper.SaNow,
                            Reference = batchReference,
                        };

                        _collectionBatchRepository.Create(batchEntity);


                        foreach (var entity in entities)
                        {
                            entity.CollectionBatch = batchEntity;
                        }
                        await scope.SaveChangesAsync();
                        collections = Mapper.Map<List<Collection>>(entities);
                    }
                }

                if (collections.Count > 0)
                {
                    foreach (var collection in collections)
                    {
                        await QueueCollection(collection, batchReference);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Queueing Pending Collections - Error Message {ex.Message}");
            }
        }

        public async Task<PagedRequestResult<Collection>> Search(PagedRequest request, int searchFilterTypeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankBranches = await _bankBranchService.GetBranches();
                var banks = await _bankService.GetBanks();

                var data = await _collectionRepository.Where(x => x.BankReference.Contains(request.SearchCriteria)).ToPagedResult<billing_Collection, Collection>(request);
                foreach (var collection in data.Data)
                {
                    if (collection.PolicyId.HasValue)
                    {
                        var policy = await _policyRepository.Where(s => s.PolicyId == collection.PolicyId)
                            .FirstOrDefaultAsync();
                        if (policy != null)
                        {
                            var bankDetailList = await _rolePlayerBankingDetailRepository
                                .Where(b => b.RolePlayerId == policy.PolicyPayeeId).ToListAsync();
                            var bankingDetails = bankDetailList.Where(b => b.EffectiveDate <= DateTimeHelper.SaNow)
                                .OrderByDescending(r => r.EffectiveDate).FirstOrDefault();
                            if (bankingDetails != null)
                            {
                                collection.AccountNo = bankingDetails.AccountNumber;
                                var bankBranch = bankBranches.FirstOrDefault(b => b.Id == bankingDetails.BankBranchId);
                                if (bankBranch != null)
                                {
                                    collection.BankBranch = bankBranch.Name;
                                    var bank = banks.FirstOrDefault(b => b.Id == bankBranch.BankId);
                                    if (bank != null)
                                    {
                                        collection.Bank = bank.Name;
                                    }
                                }

                                var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(s => s.RolePlayerId == policy.PolicyPayeeId);
                                if (rolePlayer != null)
                                {
                                    collection.Debtor = rolePlayer.DisplayName;
                                }
                            }
                        }
                        else if (collection.AdhocPaymentInstructionId.HasValue)
                        {
                            var adhocCollection = await _adhocCollectionRepository.FirstOrDefaultAsync(a => a.AdhocPaymentInstructionId == collection.AdhocPaymentInstructionId);
                            if (adhocCollection != null)
                            {
                                collection.AdhocPaymentInstruction = new AdhocPaymentInstruction()
                                {
                                    AdhocPaymentInstructionId = adhocCollection.AdhocPaymentInstructionId,
                                    RolePlayerId = adhocCollection.RolePlayerId
                                };

                                var bankDetailList = await _rolePlayerBankingDetailRepository
                                    .Where(b => b.RolePlayerId == collection.AdhocPaymentInstruction.RolePlayerId)
                                    .ToListAsync();
                                var bankingDetails = bankDetailList.Where(b => b.EffectiveDate <= DateTimeHelper.SaNow)
                                    .OrderByDescending(r => r.EffectiveDate).FirstOrDefault();
                                if (bankingDetails != null)
                                {
                                    collection.AccountNo = bankingDetails.AccountNumber;
                                    var bankBranch = bankBranches.FirstOrDefault(b => b.Id == bankingDetails.BankBranchId);
                                    if (bankBranch != null)
                                    {
                                        collection.BankBranch = bankBranch.Name;
                                        var bank = banks.FirstOrDefault(b => b.Id == bankBranch.BankId);
                                        if (bank != null)
                                        {
                                            collection.Bank = bank.Name;
                                        }
                                    }

                                    var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(s => s.RolePlayerId == collection.AdhocPaymentInstruction.RolePlayerId);
                                    if (rolePlayer != null)
                                    {
                                        collection.Debtor = rolePlayer.DisplayName;
                                    }
                                }
                            }
                        }
                    }
                }

                return data;
            }
        }

        public async Task<Collection> QueueCollection(Collection collection, string batchReference)
        {
            Contract.Requires(collection != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var collectionEntity = await _collectionRepository.FindByIdAsync(collection.CollectionsId);
                if (collectionEntity == null || (collectionEntity.CollectionStatus != CollectionStatusEnum.Pending &&
                                        (collectionEntity.CollectionStatus != CollectionStatusEnum.Rejected)))
                {
                    return collection;
                }

                if (collectionEntity.SubmissionCount >= collectionEntity.MaxSubmissionCount && collectionEntity.MaxSubmissionCount != 0)
                {
                    return collection;
                }

                if (string.IsNullOrEmpty(batchReference))
                {
                    batchReference = GenerateBatchReferenceNumber();
                    var batchEntity = new billing_CollectionBatch
                    {
                        CreatedDate = DateTimeHelper.SaNow,
                        Reference = batchReference,
                    };
                    _collectionBatchRepository.Create(batchEntity);
                    collectionEntity.CollectionBatch = batchEntity;
                    _collectionRepository.Update(collectionEntity);
                }

                collectionEntity.CollectionStatus = CollectionStatusEnum.Queued;
                _collectionRepository.Update(collectionEntity);
                await scope.SaveChangesAsync();
                var updatedCollection = Mapper.Map<Collection>(collectionEntity);

                var producer = new ServiceBusQueueProducer<CollectionMessage, CollectionQueueListener>(CollectionQueueListener.QueueName);
                await producer.PublishMessageAsync(new CollectionMessage()
                {
                    CollectionId = updatedCollection.CollectionsId,
                    BatchReference = batchReference
                });

                //log audit notes
                var text = $"Debit Order Collection Instruction Queued.  Amount:{collection.Amount}, Date to Pay: {collection.EffectiveDate} ";

                var rolePlayerBankingDetail = await _rolePlayerBankingDetailRepository.FirstOrDefaultAsync(x => x.RolePlayerBankingId == collection.RolePlayerBankingId);

                if (rolePlayerBankingDetail != null)
                {
                    var note = new BillingNote
                    {
                        ItemId = rolePlayerBankingDetail.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.Collection.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }

                return updatedCollection;
            }

        }

        public async Task ProcessBankResponse(Contracts.Integration.Hyphen.HyphenFACSResponse bankResponse)
        {
            if (bankResponse == null)
                return;
            using (var scope = _dbContextScopeFactory.Create())
            {
                // Process response
                var requisitionNumber = bankResponse.RequisitionNumber.PadLeft(9, '0');
                var facsTransactionResult = await _facsResultRepository.Where(d => d.RequisitionNumber == requisitionNumber
                                                                                   && d.IsActive
                                                                                   && d.TransactionType == bankResponse.TransactionType
                                                                                   && d.DocumentType == bankResponse.DocumentType)
                    .Select(t => new
                    {
                        t.Collection,
                        t.TransactionType,
                        t.DocumentType
                    }).SingleOrDefaultAsync();

                if (facsTransactionResult != null)
                {
                    var collection = facsTransactionResult.Collection;

                    var valid = false;
                    var bankingDetails = new RolePlayerBankingDetail();
                    if (collection.RolePlayerBankingId.HasValue && collection.RolePlayerBankingId.Value > 0 && collection.CollectionsDebtorBankAccountSource == CollectionsDebtorBankAccountSourceEnum.ClientRoleplayerBanking)
                    {
                        var rolePlayerBankingDetail = await _rolePlayerService.GetBankDetailByBankAccountId((int)collection.RolePlayerBankingId);
                        bankingDetails.AccountNumber = rolePlayerBankingDetail.AccountNumber.Trim();
                        bankingDetails.BankBranchId = rolePlayerBankingDetail.BankBranchId;
                        bankingDetails.BankAccountType = rolePlayerBankingDetail.BankAccountType;
                        bankingDetails.BranchCode = rolePlayerBankingDetail.BranchCode.Trim();
                        bankingDetails.BankBranchName = rolePlayerBankingDetail.BankBranchName;
                    }

                    if (collection.TermArrangementScheduleId.HasValue && collection.CollectionsDebtorBankAccountSource == CollectionsDebtorBankAccountSourceEnum.BillingTermDebitOrderBanking)
                    {
                        var termsBankingDetail = await _termsArrangementService.GetTermsDebitOrderDetailsByTermSchedule(collection.TermArrangementScheduleId.Value);
                        bankingDetails = await _rolePlayerService.GetBankDetailByBankAccountId((int)termsBankingDetail.RolePlayerBankingId);
                    }

                    if (bankResponse.BankAccountNumber.TrimStart('0') == bankingDetails.AccountNumber.Trim().TrimStart('0')
                        && bankResponse.BranchCode == bankingDetails.BranchCode.Trim()
                        && Convert.ToInt32(bankResponse.AccountType) == BankFacsUtils.ConvertToHyphenBankAccount(bankingDetails.BankAccountType)
                        && bankResponse.TransactionType == facsTransactionResult.TransactionType)
                        valid = bankResponse.DocumentType == facsTransactionResult.DocumentType;

                    if (valid)
                    {
                        if (!string.IsNullOrEmpty(bankResponse.ErrorCode))
                        {
                            collection.ErrorCode = bankResponse.ErrorCode;
                            collection.ErrorDescription =
                                FACSErrorCodes.GetResponseErrorDescription(collection.ErrorCode);
                            collection.CollectionStatus = CollectionStatusEnum.Rejected;
                            collection.CanResubmit = false;
                            collection.RejectionDate = DateTimeHelper.SaNow;

                            await _collectionRepository.LoadAsync(collection, x => x.Invoice);
                            collection.Invoice.InvoiceStatus = InvoiceStatusEnum.Unpaid;

                            if (collection.PolicyId.HasValue)
                            {
                                await _rolePlayerPolicyService.ProcessCollectionBankingDetailRejection(collection.PolicyId.Value, collection.ErrorDescription, bankingDetails.AccountNumber, bankingDetails.BankName, bankingDetails.BankBranchName, bankingDetails.AccountHolderName);
                            }
                            else
                            {
                                await _collectionRepository.LoadAsync(collection, c => c.AdhocPaymentInstruction);
                                collection.AdhocPaymentInstruction.AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Unpaid;
                                collection.AdhocPaymentInstruction.ErrorDescription = collection.ErrorDescription;
                            }
                        }
                        else
                        {
                            collection.ErrorCode = string.Empty;
                            collection.ErrorDescription = string.Empty;
                            collection.CollectionConfirmationDate = DateTimeHelper.SaNow;
                            collection.CollectionStatus = CollectionStatusEnum.Collected;
                            collection.RejectionDate = null;
                        }

                        _collectionRepository.Update(collection);
                    }
                }
                await scope.SaveChangesAsync();
            }
        }

        // PLEASE DO NOT MODIFY THIS METHOD WITHOUT IMMEDIATE DEV TESTING, TESTING INVOLVES GETTING STATEMENT RESPONSE FROM HYPHEN
        public async Task DoCollectionReconciliations()
        {
            try
            {
                var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var bankStatementProcessingCount = await _configurationService.GetModuleSetting(SystemSettings.BankStatementProcessingCount);
                    if (string.IsNullOrEmpty(bankStatementProcessingCount))
                    {
                        bankStatementProcessingCount = "50";
                    }

                    var entities = await _facsStatementRepository
                        .Where(d => !d.Proccessed && d.DocumentType.Trim() == "DO" && d.RequisitionNumber != "0"
                                    && d.RequisitionNumber != null && !string.IsNullOrEmpty(d.RequisitionNumber) && d.ClaimCheckReference.HasValue)
                        .Take(bankStatementProcessingCount.ToInt().Value).OrderBy(d => d.CreatedDate).ToListAsync();

                    foreach (var entity in entities)
                    {
                        var amount = 0.00M;
                        var unAllocatedAmount = 0.00M;
                        if (entity.NettAmount.HasValue)
                        {
                            amount = (decimal)((long)entity.NettAmount / 100.0);
                            amount = Math.Abs(amount);
                        }

                        unAllocatedAmount = amount;

                        var requisitionNumber = entity.RequisitionNumber.PadLeft(9, '0');
                        var bankAccountNumber = entity.BankAccountNumber.TrimStart(new char[] { '0' });

                        var result = await _facsResultRepository.Where(d => d.RequisitionNumber == requisitionNumber
                                                                            && d.IsActive
                                                                            && d.TransactionType == entity.TransactionType
                                                                            && d.DocumentType == entity.DocumentType
                                                                            && d.BankAccountNumber == bankAccountNumber).FirstOrDefaultAsync();
                        if (result != null)
                        {
                            await _facsResultRepository.LoadAsync(result, r => r.Collection);
                            if (result.Collection == null)
                            {
                                continue;
                            }

                            if (result.Collection.CollectionStatus == CollectionStatusEnum.Reconciled)
                            {
                                if (entity.UserReference2 == result.Collection.BankReference && entity.TransactionType == result.TransactionType && entity.DebitCredit == "-")
                                {

                                    Transaction originalPaymentTransaction = null;

                                    FinPayee finPaye = null;

                                    if (result.Collection.InvoiceId.HasValue)
                                    {
                                        await _collectionRepository.LoadAsync(result.Collection, x => x.Invoice);
                                        await _invoiceRepository.LoadAsync(result.Collection.Invoice, x => x.Policy);

                                        var invoiceTransactions = await _transactionService.GetInvoiceTransactions(result.Collection.InvoiceId.Value);
                                        if (invoiceTransactions.Count > 0)
                                        {
                                            originalPaymentTransaction = invoiceTransactions.Where(t => t.TransactionType == TransactionTypeEnum.Payment && t.Amount == amount).OrderByDescending(t => t.CreatedDate).FirstOrDefault();
                                        }
                                    }
                                    else if (result.Collection.AdhocPaymentInstructionId.HasValue)
                                    {
                                        await _collectionRepository.LoadAsync(result.Collection, c => c.AdhocPaymentInstruction);
                                        finPaye = await _rolePlayerService.GetFinPayee(result.Collection.AdhocPaymentInstruction.RolePlayerId);

                                        originalPaymentTransaction = Mapper.Map<Transaction>(await _transactionRepository.Where(t => t.AdhocPaymentInstructionId ==
                                                        result.Collection.AdhocPaymentInstructionId.Value && t.TransactionType == TransactionTypeEnum.Payment).FirstOrDefaultAsync());
                                    }

                                    var paymentReversalTransaction = new billing_Transaction
                                    {
                                        Amount = amount,
                                        BankReference = originalPaymentTransaction.BankReference,
                                        InvoiceId = originalPaymentTransaction.InvoiceId,
                                        TransactionDate = DateTimeHelper.SaNow,
                                        TransactionType = TransactionTypeEnum.PaymentReversal,
                                        TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                        BankStatementEntryId = entity.BankStatementEntryId,
                                        RmaReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                                        RolePlayerId = result.Collection.InvoiceId.HasValue ? result.Collection.Invoice.Policy.PolicyOwnerId : result.Collection.AdhocPaymentInstruction.RolePlayerId,
                                        AdhocPaymentInstructionId = result.Collection.AdhocPaymentInstructionId,
                                        PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                                    };

                                    var debitOrderCanBeReversed = true;

                                    if (result.Collection.Invoice != null)
                                    {
                                        var invoicePeriod = await _periodService.GetPeriod(result.Collection.Invoice.InvoiceDate);
                                        var currentPeriod = await _periodService.GetCurrentPeriod();
                                        debitOrderCanBeReversed = invoicePeriod.EndDate >= currentPeriod.StartDate;
                                    }

                                    if (originalPaymentTransaction != null && debitOrderCanBeReversed)
                                    {
                                        paymentReversalTransaction.LinkedTransactionId = originalPaymentTransaction.TransactionId;

                                        //reverse original payment's invoice allocations

                                        var originalPaymentInvoiceAllocations = _invoiceAllocationRepository.Where(x => x.TransactionId == originalPaymentTransaction.TransactionId && x.LinkedTransactionId == null).ToList();
                                        foreach (var originalPaymentInvoiceAllocation in originalPaymentInvoiceAllocations)
                                        {

                                            paymentReversalTransaction.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                                            {
                                                InvoiceId = originalPaymentInvoiceAllocation.InvoiceId,
                                                Amount = originalPaymentInvoiceAllocation.Amount,
                                                BillingAllocationType = originalPaymentInvoiceAllocation.InvoiceId.HasValue ? BillingAllocationTypeEnum.InvoiceAllocationReversal : BillingAllocationTypeEnum.InterestAllocationReversal,
                                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                                LinkedTransactionId = originalPaymentInvoiceAllocation.TransactionId,
                                                ProductCategoryType = originalPaymentInvoiceAllocation.ProductCategoryType
                                            });
                                        }

                                        //to add: term arrangements allocations reversal logic
                                    }

                                    await _transactionService.AddTransaction(Mapper.Map<Transaction>(paymentReversalTransaction));

                                    if (result.Collection.InvoiceId.HasValue && result.Collection.Invoice.InvoiceStatus != InvoiceStatusEnum.Partially)
                                    {
                                        result.Collection.Invoice.InvoiceStatus = InvoiceStatusEnum.Unpaid;
                                    }

                                    result.Collection.CollectionStatus = CollectionStatusEnum.Reversed;
                                    result.Collection.ReversalDate = DateTime.Now;
                                    result.Collection.ErrorDescription = "return";

                                    if (result.Collection.AdhocPaymentInstructionId.HasValue)
                                    {
                                        result.Collection.AdhocPaymentInstruction.AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Unpaid;
                                        result.Collection.AdhocPaymentInstruction.ErrorDescription = "return";
                                    }


                                    if (result.Collection.InvoiceId.HasValue)
                                    {

                                        if (result.Collection.Invoice.Policy.CommissionPercentage > 0 || result.Collection.Invoice.Policy.AdminPercentage > 0)
                                        {
                                            var invoiceId = result.Collection.Invoice.InvoiceId;
                                            commissionAllocations.Add(new CommissionInvoicePaymentAllocation()
                                            {
                                                InvoiceId = invoiceId,
                                                Amount = amount,
                                                TransactionDate = DateTimeHelper.SaNow,
                                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                                IsProcessed = false,
                                                IsDeleted = false,
                                                CreatedBy = "autoallocation",
                                                CreatedDate = DateTimeHelper.SaNow,
                                                ModifiedBy = "autoallocation",
                                                ModifiedDate = DateTimeHelper.SaNow
                                            });
                                        }
                                    }

                                    _collectionRepository.Update(result.Collection);

                                    entity.Proccessed = true;
                                    _facsStatementRepository.Update(entity);

                                    //update UnAllocatedPayment AllocationProgressStatusId
                                    var unallocatedOriginalPayment = await _unallocatedPaymentRepository.FirstOrDefaultAsync(x => x.BankStatementEntryId == originalPaymentTransaction.BankStatementEntryId);
                                    if (unallocatedOriginalPayment != null)
                                    {
                                        unallocatedOriginalPayment.AllocationProgressStatus = AllocationProgressStatusEnum.Reversed;
                                        unallocatedOriginalPayment.UnallocatedAmount += amount;
                                        _unallocatedPaymentRepository.Update(unallocatedOriginalPayment);
                                    }
                                }
                            }
                            else if (result.Collection.CollectionStatus == CollectionStatusEnum.Collected)
                            {
                                var valid = false;

                                if (string.IsNullOrEmpty(entity.ErrorCode))
                                {
                                    var reference = result.Collection.BankReference;

                                    if (entity.UserReference2 == reference && entity.TransactionType == result.TransactionType && entity.DebitCredit == "+")
                                    {
                                        valid = entity.DocumentType == result.DocumentType;
                                    }

                                    result.Collection.CollectionStatus = valid ? CollectionStatusEnum.Reconciled : CollectionStatusEnum.NotReconciled;

                                    result.Collection.ReconciliationDate = DateTime.Now;
                                }
                                else
                                {
                                    result.Collection.CollectionStatus = CollectionStatusEnum.Rejected;
                                    result.Collection.ErrorCode = entity.ErrorCode;
                                    result.Collection.ErrorDescription = FACSErrorCodes.GetResponseErrorDescription(entity.ErrorCode);
                                }

                                if (result.Collection.CollectionStatus == CollectionStatusEnum.Reconciled)
                                {
                                    billing_Transaction paymentTransaction;

                                    if (result.Collection.InvoiceId.HasValue)
                                    {
                                        await _collectionRepository.LoadAsync(result.Collection, x => x.Invoice);
                                        await _invoiceRepository.LoadAsync(result.Collection.Invoice, x => x.Policy);
                                        var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(result.Collection.Invoice.Policy.PolicyId);

                                        var invoiceTransactionEntity = await _transactionRepository.Where(x => x.InvoiceId == result.Collection.Invoice.InvoiceId
                                        && x.TransactionType == TransactionTypeEnum.Invoice).FirstOrDefaultAsync();

                                        var invoiceTransactionBalance = await _transactionService.GetTransactionBalance(Mapper.Map<Transaction>(invoiceTransactionEntity));

                                        if (invoiceTransactionEntity == null || invoiceTransactionBalance <= 0)
                                        {
                                            //allocate to other invoices and intrerest
                                            if (invoiceTransactionEntity != null)
                                            {
                                                paymentTransaction = new billing_Transaction
                                                {
                                                    Amount = amount,
                                                    BankReference = result.Collection.Invoice.Policy.PolicyNumber,
                                                    TransactionDate = DateTimeHelper.SaNow,
                                                    TransactionType = TransactionTypeEnum.Payment,
                                                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                                    BankStatementEntryId = entity.BankStatementEntryId,
                                                    RmaReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                                                    RolePlayerId = result.Collection.Invoice.Policy.PolicyOwnerId,
                                                    CreatedBy = "autoallocation",
                                                    ModifiedBy = "autoallocation",
                                                    PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                                                };

                                                int paymentTransactionId = 0;
                                                if (unAllocatedAmount > 0)
                                                {
                                                    paymentTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(paymentTransaction));

                                                    var statementRef = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty);
                                                    await this.AllocateToDocumentsIfBalanceIsLessThanAmountPaid(result.Collection.Invoice.Policy.PolicyOwnerId, entity.BankStatementEntryId, statementRef, unAllocatedAmount, paymentTransactionId);
                                                }

                                            }
                                            else
                                            {
                                                continue;
                                            }
                                        }
                                        else
                                        {
                                            int paymentTransactionId = 0;
                                            var amountToAllocateToInvoice = invoiceTransactionBalance <= unAllocatedAmount ? invoiceTransactionBalance : 0;

                                            int? transactionInvoiceId = result.Collection.Invoice.InvoiceId;
                                            if (amountToAllocateToInvoice != amount)
                                            {
                                                transactionInvoiceId = null;
                                            }

                                            paymentTransaction = new billing_Transaction
                                            {
                                                Amount = amount,
                                                BankReference = result.Collection.Invoice.Policy.PolicyNumber,
                                                InvoiceId = transactionInvoiceId,
                                                TransactionDate = DateTimeHelper.SaNow,
                                                TransactionType = TransactionTypeEnum.Payment,
                                                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                                BankStatementEntryId = entity.BankStatementEntryId,
                                                RmaReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                                                RolePlayerId = result.Collection.Invoice.Policy.PolicyOwnerId,
                                                CreatedBy = "autoallocation",
                                                ModifiedBy = "autoallocation",
                                                PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                                            };

                                            if (amountToAllocateToInvoice > 0)
                                            {
                                                paymentTransaction.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                                                {
                                                    InvoiceId = result.Collection.Invoice.InvoiceId,
                                                    Amount = amountToAllocateToInvoice,
                                                    BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                                                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                                    ProductCategoryType = (policy != null) ? policy.ProductCategoryType : null
                                                });
                                                unAllocatedAmount = unAllocatedAmount - amountToAllocateToInvoice;
                                                paymentTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(paymentTransaction));

                                                result.Collection.Invoice.InvoiceStatus = InvoiceStatusEnum.Paid;

                                                switch (result.Collection.Invoice.Policy.PolicyStatus)
                                                {
                                                    case PolicyStatusEnum.PendingFirstPremium:
                                                        result.Collection.Invoice.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                                        break;
                                                }

                                                if (result.Collection.Invoice.Policy.CommissionPercentage > 0 || result.Collection.Invoice.Policy.AdminPercentage > 0)
                                                {
                                                    var invoiceId = result.Collection.Invoice.InvoiceId;
                                                    commissionAllocations.Add(new CommissionInvoicePaymentAllocation()
                                                    {
                                                        InvoiceId = invoiceId,
                                                        Amount = amountToAllocateToInvoice,
                                                        TransactionDate = DateTimeHelper.SaNow,
                                                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                                        IsProcessed = false,
                                                        IsDeleted = false,
                                                        CreatedBy = "autoallocation",
                                                        CreatedDate = DateTimeHelper.SaNow,
                                                        ModifiedBy = "autoallocation",
                                                        ModifiedDate = DateTimeHelper.SaNow
                                                    });
                                                }
                                            }

                                            //allocate unAllocatedAmount to any other due invoices and interest
                                            if (unAllocatedAmount > 0)
                                            {
                                                var statementRef = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty);
                                                await this.AllocateToDocumentsIfBalanceIsLessThanAmountPaid(result.Collection.Invoice.Policy.PolicyOwnerId, entity.BankStatementEntryId, statementRef, unAllocatedAmount, paymentTransactionId);
                                            }
                                        }
                                    }
                                    else if (result.Collection.AdhocPaymentInstructionId.HasValue)
                                    {
                                        await _collectionRepository.LoadAsync(result.Collection, c => c.AdhocPaymentInstruction);

                                        var finPaye = await _rolePlayerService.GetFinPayee(result.Collection.AdhocPaymentInstruction.RolePlayerId);

                                        paymentTransaction = new billing_Transaction
                                        {
                                            Amount = amount,
                                            BankReference = result.Collection.InvoiceId.HasValue ? result.Collection.Invoice.Policy.PolicyNumber : finPaye?.FinPayeNumber,
                                            TransactionDate = DateTimeHelper.SaNow,
                                            TransactionType = TransactionTypeEnum.Payment,
                                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                            BankStatementEntryId = entity.BankStatementEntryId,
                                            RmaReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                                            RolePlayerId = result.Collection.AdhocPaymentInstruction.RolePlayerId,
                                            AdhocPaymentInstructionId = result.Collection.AdhocPaymentInstructionId,
                                            CreatedBy = "autoallocation",
                                            ModifiedBy = "autoallocation",
                                            PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                                        };

                                        var createdPaymentTrsanctionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(paymentTransaction));

                                        result.Collection.AdhocPaymentInstruction.AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Paid;

                                        //allocate to any due invoices and interest
                                        if (unAllocatedAmount > 0)
                                        {
                                            var statementRef = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty);
                                            await this.AllocateToDocumentsIfBalanceIsLessThanAmountPaid(finPaye.RolePlayerId, entity.BankStatementEntryId, statementRef, unAllocatedAmount, createdPaymentTrsanctionId);
                                        }
                                        //to add: logic for adhoc term arrangement schedule debit orders payments 

                                    }
                                    else if (result.Collection.TermArrangementScheduleId.HasValue)
                                    {
                                        var termArrangementSchedule = await _termArrangementScheduleRepository.FirstOrDefaultAsync(x => x.TermArrangementScheduleId == result.Collection.TermArrangementScheduleId.Value);
                                        await _termArrangementScheduleRepository.LoadAsync(termArrangementSchedule, x => x.TermArrangement);

                                        paymentTransaction = new billing_Transaction
                                        {
                                            Amount = amount,
                                            BankReference = entity.BankAccountNumber,
                                            TransactionDate = DateTimeHelper.SaNow,
                                            TransactionType = TransactionTypeEnum.Payment,
                                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                            BankStatementEntryId = entity.BankStatementEntryId,
                                            RmaReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                                            RolePlayerId = result.Collection.AdhocPaymentInstruction.RolePlayerId,
                                            AdhocPaymentInstructionId = result.Collection.AdhocPaymentInstructionId,
                                            CreatedBy = "autoallocation",
                                            ModifiedBy = "autoallocation",
                                            PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                                        };

                                        var createdPaymentTrsanctionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(paymentTransaction));

                                        //allocate to terms Arrangement
                                        if (entity.StatementDate != null)
                                            await AllocateToTermsArrangement(termArrangementSchedule.TermArrangement.RolePlayerId.Value, amount, (DateTime)entity.StatementDate, createdPaymentTrsanctionId);

                                    }

                                    //update UnAllocatedPayment AllocationProgressStatus
                                    var unallocatedOriginalPayment = await _unallocatedPaymentRepository.FirstOrDefaultAsync(x => x.BankStatementEntryId == entity.BankStatementEntryId);
                                    if (unallocatedOriginalPayment != null)
                                    {

                                        unallocatedOriginalPayment.UnallocatedAmount -= amount;

                                        if (unallocatedOriginalPayment.UnallocatedAmount <= 0)
                                        {
                                            unallocatedOriginalPayment.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;
                                        }
                                        _unallocatedPaymentRepository.Update(unallocatedOriginalPayment);
                                    }
                                }
                                else
                                {
                                    if (result.Collection.InvoiceId.HasValue)
                                    {
                                        await _collectionRepository.LoadAsync(result.Collection, x => x.Invoice);
                                        result.Collection.Invoice.InvoiceStatus = InvoiceStatusEnum.Unpaid;
                                    }
                                    else if (result.Collection.AdhocPaymentInstructionId.HasValue)
                                    {
                                        await _collectionRepository.LoadAsync(result.Collection, x => x.AdhocPaymentInstruction);
                                        result.Collection.AdhocPaymentInstruction.AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Unpaid;
                                    }
                                }

                                _collectionRepository.Update(result.Collection);

                                entity.Proccessed = true;
                                _facsStatementRepository.Update(entity);
                            }
                        }
                    }

                    await scope.SaveChangesAsync();
                }

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
            catch (Exception ex)
            {
                ex.LogException($"Error when Doing Collection Reconciliations - Error Message {ex.Message}");
            }
        }

        private async Task<int> AllocateCfpStatementEntries(finance_BankStatementEntry entity)
        {
            var bankStatementId = 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var amount = 0.00M;
                var isPaymentTransaction = entity.DebitCredit == "+";
                var isPaymentReversalTransaction = entity.DebitCredit == "-";

                if (entity.NettAmount.HasValue)
                {
                    amount = (decimal)((long)entity.NettAmount / 100.0);
                    amount = Math.Abs(amount);
                }
                
                List<FinPayee> debtors = await SearchForDebtorByBankStatementEntryId(entity.BankStatementEntryId);

                var narrowedDebtors = debtors;
                if (debtors?.Count > 1)
                {
                    var roleplayerIds =
                        await NarrowDownDebtorSearchUsingDebtorBalances(
                            debtors.Select(c => c.RolePlayerId).ToList(), Math.Abs(amount));
                    narrowedDebtors = debtors.Where(c => roleplayerIds.Contains(c.RolePlayerId)).ToList();
                }

                if (narrowedDebtors?.Count == 1)
                {
                    var debtor = narrowedDebtors[0];
                    Industry industry = null;

                    if (debtor.IndustryId > 0)
                    {
                        industry = await _industryService.GetIndustry(debtor.IndustryId);
                    }

                    // isCorrectIndustry = await AllocateTransactionToCorrectIndustry(debtor.RolePlayerId, entity.BankAccountNumber.TrimStart(new char[] { '0' }));

                    if (industry != null)
                    {
                        var previousAllocations = await _transactionRepository.Where(t => t.Amount == amount
                                                                                          && t.RolePlayerId ==
                                                                                          debtor.RolePlayerId
                                                                                          &&
                                                                                          t.BankStatementEntryId ==
                                                                                          entity
                                                                                              .BankStatementEntryId)
                            .ToListAsync();


                        // Payment transaction
                        if (previousAllocations.All(x => x.TransactionType != TransactionTypeEnum.Payment) &&
                            isPaymentTransaction)
                        {
                            await CreateCfpPaymentTransaction(entity, debtor, amount);
                            bankStatementId = entity.BankStatementEntryId;
                        }

                        //payment reversal transaction
                        if (isPaymentReversalTransaction)
                        {
                            await CreateCfpPaymentReversalTransaction(previousAllocations, entity,
                                debtor.RolePlayerId, amount,
                                true);
                        }
                    }
                    else //null industry
                    {
                        await SaveUnAllocatedPayments(entity.BankStatementEntryId, amount);
                    }

                    await UpdateBankStatementEntry(entity.BankStatementEntryId);
                }

                await scope.SaveChangesAsync().ConfigureAwait(true);
            }

            return bankStatementId;
        }

        private async Task CreateCfpPaymentTransaction(finance_BankStatementEntry entity, FinPayee debtor, decimal amount)
        {
            var trans = new billing_Transaction
            {
                Amount = amount,
                BankReference = entity.UserReference,
                TransactionDate = DateTime.Today,
                TransactionType = TransactionTypeEnum.Payment,
                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                BankStatementEntryId = entity.BankStatementEntryId,
                RmaReference = null,
                RolePlayerId = debtor.RolePlayerId
            };

            await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
        }


        private async Task UpdateBankStatementEntry(int bankStatementEntryId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entry = await _facsStatementRepository.FirstOrDefaultAsync(x =>
                    x.BankStatementEntryId == bankStatementEntryId);

                if (entry != null)
                {
                    entry.Proccessed = true;
                    _facsStatementRepository.Update(entry);
                    await scope.SaveChangesAsync().ConfigureAwait(true);
                }

            }
        }

        private async Task CreateCfpPaymentReversalTransaction(List<billing_Transaction> previousAllocations,
              finance_BankStatementEntry entity, int debtorRolePlayerId, decimal amount,
              bool isPaymentReversalTransaction)
        {
            //Payment reversal transaction in current statement
            if (previousAllocations.Any(x => x.TransactionType == TransactionTypeEnum.Payment) &&
                isPaymentReversalTransaction)
            {
                var linkedPaymentTransaction = previousAllocations.OrderByDescending(x => x.TransactionId)
                    .FirstOrDefault();

                var trans = new billing_Transaction
                {
                    Amount = amount,
                    BankReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                    TransactionDate = DateTime.Today,
                    TransactionType = TransactionTypeEnum.PaymentReversal,
                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                    BankStatementEntryId = entity.BankStatementEntryId,
                    RmaReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                    RolePlayerId = debtorRolePlayerId,
                    LinkedTransactionId = linkedPaymentTransaction?.TransactionId,

                };

                await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
            }
            else
            {
                //this are old payments that we want to reverse 
                var previousReversedPaymentTransactions =
                    await (from paymentTran in _transactionRepository.Where(t =>
                                t.Amount == Math.Abs(amount)
                                && t.RolePlayerId == debtorRolePlayerId
                                && t.TransactionType == TransactionTypeEnum.Payment)
                           join reversalTran in _transactionRepository.Where(t =>
                                   t.Amount == Math.Abs(amount)
                                   && t.RolePlayerId == debtorRolePlayerId
                                   && t.TransactionType == TransactionTypeEnum.PaymentReversal)
                               on paymentTran.TransactionId equals reversalTran.LinkedTransactionId into
                               linkedTransactionTempTable
                           from linkedTran in linkedTransactionTempTable.DefaultIfEmpty()
                           select new
                           {
                               paymentTran,
                               linkedTran
                           }
                        ).OrderByDescending(x => x.paymentTran.TransactionId).ToListAsync();


                var notReversedPaymentTransaction =
                    previousReversedPaymentTransactions.FirstOrDefault(x => x.linkedTran == null);

                var trans = new billing_Transaction
                {
                    Amount = Math.Abs(amount),
                    BankReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                    TransactionDate = DateTime.Today,
                    TransactionType = TransactionTypeEnum.PaymentReversal,
                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                    BankStatementEntryId = entity.BankStatementEntryId,
                    RmaReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                    RolePlayerId = debtorRolePlayerId,
                    LinkedTransactionId = notReversedPaymentTransaction?.paymentTran?.TransactionId
                };

                await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
            }
        }

        public async Task<bool> ProcessCFPPayments()
        {
            var results = new List<bool>();
            try
            {
                var paymentTransaction = "+";
                var paymentReversalTransaction = "-";

                List<finance_BankStatementEntry> bankStatementEntries;
                List<int> entriesToAllocateIds = new List<int>();
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var autoAllocatableAccountIds = await _autoAllocationBankAccountRepository
                        .Select(a => a.BankAccountId).ToListAsync();

                    var bankAccounts = await _bankAccountService.GetBankAccountsByAccountIds(autoAllocatableAccountIds);
                    var accountNumbers = new List<string>();

                    bankAccounts.ForEach(c =>
                        accountNumbers.Add(c.AccountNumber.PadLeft(accountNumberPadding, '0').Trim()));

                    bankStatementEntries = await _facsStatementRepository
                        .Where(d => !d.Proccessed && accountNumbers.Contains(d.BankAccountNumber.Trim()) &&
                                    string.IsNullOrEmpty(d.DocumentType) && d.RecordId == validRecordId &&
                                    d.ClaimCheckReference.HasValue
                                    && d.BankStatementEntryType == BankStatementEntryTypeEnum.SalaryDeduction &&
                                    d.DebitCredit == paymentTransaction
                        )
                        .Take(100).OrderBy(d => d.BankStatementEntryId).ToListAsync();

                    if (bankStatementEntries.Count == 0)
                    {
                        bankStatementEntries = await _facsStatementRepository
                            .Where(d => !d.Proccessed && accountNumbers.Contains(d.BankAccountNumber.Trim()) &&
                                        string.IsNullOrEmpty(d.DocumentType) && d.RecordId == validRecordId &&
                                        d.ClaimCheckReference.HasValue
                                        && d.BankStatementEntryType == BankStatementEntryTypeEnum.SalaryDeduction &&
                                        d.DebitCredit == paymentReversalTransaction
                            )
                            .Take(100).OrderBy(d => d.BankStatementEntryId).ToListAsync();
                    }
                }

                var tasks = new List<Task>();

                foreach (var entity in bankStatementEntries)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        var bankStatementId = await AllocateCfpStatementEntries(entity);

                        if (bankStatementId > 0)
                        {
                            var result = await AllocateCFPEntries(new List<int> { bankStatementId });
                            results.Add(result);
                        }
                    }));
                }

                _ = Task.WhenAll(tasks).ConfigureAwait(true);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Processing CFP Payments");
            }

            return results.Count > 0;
        }

        private async Task<bool> AllocateCFPEntries(List<int> entriesToAllocateIds)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var processedInvoices = new List<int>();
                var bankStatementEntries = await _facsStatementRepository.Where(e => entriesToAllocateIds.Contains(e.BankStatementEntryId)).ToListAsync();

                foreach (var entry in bankStatementEntries)
                {

                    var amount = 0.00M;
                    if (entry.NettAmount.HasValue)
                    {
                        amount = (decimal)((long)entry.NettAmount / 100.0);
                    }

                    var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyByNumber(entry.UserReference);
                    var statementMonth = string.Format("{0}{1}", entry.StatementDate.Value.ToString("yyyy"),
                        entry.StatementDate.Value.ToString("MM"));

                    var policyInvoices = await _invoiceRepository.Where(i =>
                        i.PolicyId == policy.PolicyId && i.InvoiceStatus == InvoiceStatusEnum.Pending &&
                        !processedInvoices.Contains(i.InvoiceId)).ToListAsync();
                    var invoice = policyInvoices.Where(i =>
                        string.Format("{0}{1}", i.InvoiceDate.ToString("yyyy"), i.InvoiceDate.ToString("MM")) ==
                        statementMonth).FirstOrDefault();

                    if (invoice == null)
                    {
                        //Just pick any invoice and allocate to it
                        policyInvoices = policyInvoices.OrderBy(x => x.InvoiceId).ToList();
                        invoice = policyInvoices.FirstOrDefault();
                    }

                    var trans = await _transactionRepository
                        .Where(x => x.BankStatementEntryId == entry.BankStatementEntryId).FirstOrDefaultAsync();
                    var previousAllocations = await _transactionRepository.Where(t => t.Amount == amount
                                                                                      && t.RolePlayerId ==
                                                                                      trans.RolePlayerId
                                                                                      && t.BankStatementEntryId ==
                                                                                      entry.BankStatementEntryId)
                        .ToListAsync();

                    trans.RmaReference = entry.StatementNumber + "/" + entry.StatementLineNumber + " " +
                                         (entry.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty);
                    trans.BankReference = entry.StatementNumber + "/" + entry.StatementLineNumber + " " +
                                          (entry.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty);
                    trans.TransactionDate = DateTime.Now.Date;

                    if (invoice != null)
                    {
                        processedInvoices.Add(invoice.InvoiceId);

                        var allocationAmount = amount;

                        if (allocationAmount > invoice.TotalInvoiceAmount)
                        {
                            allocationAmount = invoice.TotalInvoiceAmount;

                        }
                        else if (allocationAmount < invoice.TotalInvoiceAmount)
                        {
                            allocationAmount =
                                await GetDebtorCreditBalance(trans
                                    .RolePlayerId); // Add from debtorRolePlayerId's account
                            if (allocationAmount > invoice.TotalInvoiceAmount)
                            {
                                allocationAmount = invoice.TotalInvoiceAmount;
                            }
                        }

                        trans.InvoiceId = invoice.InvoiceId;

                        var invoiceAllocation = new billing_InvoiceAllocation
                        {
                            TransactionId = trans.TransactionId,
                            InvoiceId = trans.InvoiceId,
                            Amount = allocationAmount

                        };

                        _invoiceAllocationRepository.Create(invoiceAllocation);

                        var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

                        if (invoice.TotalInvoiceAmount > trans.Amount)
                        {
                            invoice.InvoiceStatus = InvoiceStatusEnum.Partially;
                        }
                        else
                        {
                            invoice.InvoiceStatus = InvoiceStatusEnum.Paid;
                        }

                        await _invoiceRepository.LoadAsync(invoice, i => i.Policy);

                        if (invoice.Policy.CommissionPercentage > 0 || invoice.Policy.AdminPercentage > 0)
                        {
                            var commision = new CommissionInvoicePaymentAllocation()
                            {
                                InvoiceId = invoice.InvoiceId,
                                Amount = decimal.Negate(trans.Amount),
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                IsProcessed = false
                            };
                            commissionAllocations.Add(commision);
                        }

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

                        _invoiceRepository.Update(invoice);

                        await _paymentAllocationService.ReduceUnallocatedBalance(entry.BankStatementEntryId,
                            trans.Amount);
                    }

                    _transactionRepository.Update(trans);
                }

                return await scope.SaveChangesAsync().ConfigureAwait(true) > 0;
            }
        }



        public async Task ProcessEFTPayments()
        {
            try
            {
                List<BankStatementEntry> unprocessedEFtBankStatementEntries = new List<BankStatementEntry>();
                var rolePlayerIds = new List<int>();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var autoAllocatableAccountIds = await _autoAllocationBankAccountRepository.Select(a => a.BankAccountId).ToListAsync();

                    var bankAccounts = await _bankAccountService.GetBankAccountsByAccountIds(autoAllocatableAccountIds);

                    var accountNumbers = new List<string>();
                    bankAccounts.ForEach(c => accountNumbers.Add(c.AccountNumber.PadLeft(accountNumberPadding, '0').Trim()));

                    var entities = await _facsStatementRepository
                         .Where(d => !d.Proccessed && accountNumbers.Contains(d.BankAccountNumber.Trim()) &&
                                    string.IsNullOrEmpty(d.DocumentType) && d.RecordId == validRecordId && d.ClaimCheckReference.HasValue
                                    && d.BankStatementEntryType != BankStatementEntryTypeEnum.SalaryDeduction)
                    .Take(50).OrderBy(d => d.CreatedDate).ToListAsync();//small batch to avoid db lock

                    var bankentries = Mapper.Map<List<BankStatementEntry>>(entities);
                    unprocessedEFtBankStatementEntries.AddRange(bankentries);
                }

                //Process each bank statement entry one at time
                foreach (var unprocessedEFtBankStatementEntry in unprocessedEFtBankStatementEntries)
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        //ReCheck Is-Proccessed Flag - In case there are other instances of the service procesing same data set.  
                        var entities = await _facsStatementRepository
                         .Where(d => !d.Proccessed && d.BankStatementEntryId == unprocessedEFtBankStatementEntry.BankStatementEntryId)
                          .ToListAsync();

                        if (entities != null && entities.Count > 0)
                        {
                            await AllocateBankEntries(entities, rolePlayerIds);

                            await scope.SaveChangesAsync();
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Processing EFT Payments - Error Message {ex.Message} StackTrace - {ex.StackTrace}");
            }
        }

        public async Task<bool> AuthoriseRejectedCollection(Collection collection)
        {
            Contract.Requires(collection != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AuthoriseCollection);


            using (var scope = _dbContextScopeFactory.Create())
            {
                if (collection.CollectionStatus != CollectionStatusEnum.Rejected) return false;

                collection.CollectionStatus = CollectionStatusEnum.Pending;
                var entity = Mapper.Map<billing_Collection>(collection);
                _collectionRepository.Update(entity);
                await scope.SaveChangesAsync();

                return true;
            }

        }
        public async Task<Collection> GetCollectionByTermArrangementScheduleId(int termArrangementScheduleId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var collection = _collectionRepository.FirstOrDefault(x => x.TermArrangementScheduleId == termArrangementScheduleId);

                return await Task.FromResult(Mapper.Map<Collection>(collection));

            }
        }

        public async Task<List<AdhocPaymentInstructionsTermArrangementSchedule>> GetAdhocPaymentInstructionsTermArrangementSchedules(int termArrangementId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var termArrangementSchedules = await _termArrangementScheduleRepository.Where(x => x.TermArrangementId == termArrangementId).ToListAsync();
                List<int> termArrangementScheduleIds = termArrangementSchedules.Select(x => x.TermArrangementScheduleId).ToList();
                var adhocPaymentInstructionsTermArrangementSchedules = await _adhocPaymentInstructionsTermArrangementScheduleRepository.Where(x => termArrangementScheduleIds.Contains(x.TermArrangementScheduleId) && x.IsActive && !x.IsDeleted).ToListAsync();
                await _adhocPaymentInstructionsTermArrangementScheduleRepository.LoadAsync(adhocPaymentInstructionsTermArrangementSchedules, x => x.AdhocPaymentInstruction);

                return Mapper.Map<List<AdhocPaymentInstructionsTermArrangementSchedule>>(adhocPaymentInstructionsTermArrangementSchedules);
            }
        }

        public async Task<PagedRequestResult<Collection>> Get(PagedRequest request, CollectionTypeEnum? collectionType, CollectionStatusEnum? collectionStatus, DateTime? startDate,
            DateTime? endDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                PagedRequestResult<Collection> data;

                var bankBranches = await _bankBranchService.GetBranches();
                var banks = await _bankService.GetBanks();

                switch (collectionStatus)
                {
                    case null:
                    case CollectionStatusEnum.Pending:
                    case CollectionStatusEnum.Queued:
                        var invoiceCollectionData = (from collections in _collectionRepository
                                                     join inv in _invoiceRepository on collections.InvoiceId equals inv.InvoiceId
                                                     where (collectionStatus == null || collections.CollectionStatus == collectionStatus)
                                                      && (collectionType == null || collections.CollectionType == collectionType)
                                                      && (startDate == null || inv.CollectionDate >= startDate) && (endDate == null || inv.CollectionDate <= endDate)
                                                     select collections);
                        var adhocData = (from collections in _collectionRepository
                                         join adhoc in _adhocCollectionRepository on collections.AdhocPaymentInstructionId equals adhoc.AdhocPaymentInstructionId
                                         where (collectionStatus == null || collections.CollectionStatus == collectionStatus)
                                               && (collectionType == null || collections.CollectionType == collectionType)
                                               && (startDate == null || adhoc.DateToPay >= startDate) && (endDate == null || adhoc.DateToPay <= endDate)
                                         select collections);
                        invoiceCollectionData = invoiceCollectionData.Concat(adhocData);
                        data = await invoiceCollectionData.OrderBy(c => c.CreatedDate).ToPagedResult<billing_Collection, Collection>(request);
                        break;
                    case CollectionStatusEnum.Submitted:
                        data = await _collectionRepository
                            .Where(d => (d.CollectionStatus == collectionStatus)
                                        && (collectionType == null || d.CollectionType == collectionType)
                                        && (startDate == null || d.SubmissionDate >= startDate) && (endDate == null || d.SubmissionDate <= endDate))
                            .OrderBy(d => d.CreatedDate).ToPagedResult<billing_Collection, Collection>(request);
                        break;
                    case CollectionStatusEnum.Collected:
                        data = await _collectionRepository
                            .Where(d => (d.CollectionStatus == collectionStatus)
                                        && (collectionType == null || d.CollectionType == collectionType)
                                        && (startDate == null || d.CollectionConfirmationDate >= startDate) && (endDate == null || d.CollectionConfirmationDate <= endDate))
                            .OrderBy(d => d.CreatedDate).ToPagedResult<billing_Collection, Collection>(request);
                        break;
                    case CollectionStatusEnum.Rejected:
                        data = await _collectionRepository
                            .Where(d => (d.CollectionStatus == collectionStatus)
                                        && (collectionType == null || d.CollectionType == collectionType)
                                        && (startDate == null || d.RejectionDate >= startDate) && (endDate == null || d.RejectionDate <= endDate))
                            .OrderBy(d => d.CreatedDate).ToPagedResult<billing_Collection, Collection>(request);
                        break;
                    case CollectionStatusEnum.Reconciled:
                    case CollectionStatusEnum.NotReconciled:
                        data = await _collectionRepository
                            .Where(d => (d.CollectionStatus == collectionStatus)
                                        && (collectionType == null || d.CollectionType == collectionType)
                                        && (startDate == null || d.ReconciliationDate >= startDate) && (endDate == null || d.ReconciliationDate <= endDate))
                            .OrderBy(d => d.CreatedDate).ToPagedResult<billing_Collection, Collection>(request);
                        break;
                    default:
                        data = await _collectionRepository
                            .Where(d => (collectionStatus == null || d.CollectionStatus == collectionStatus)
                                        && (collectionType == null || d.CollectionType == collectionType)
                                        && (startDate == null || d.CreatedDate >= startDate) &&
                                        (endDate == null || d.CreatedDate <= endDate))
                            .OrderBy(d => d.CreatedDate).ToPagedResult<billing_Collection, Collection>(request);
                        break;
                }

                foreach (var collection in data.Data)
                {
                    if (collection.PolicyId.HasValue)
                    {
                        var policy = await _policyRepository.Where(s => s.PolicyId == collection.PolicyId)
                            .FirstOrDefaultAsync();
                        if (policy != null)
                        {
                            var bankDetailList = await _rolePlayerBankingDetailRepository
                                .Where(b => b.RolePlayerId == policy.PolicyPayeeId).ToListAsync();
                            var bankingDetails = bankDetailList.Where(b => b.EffectiveDate <= DateTimeHelper.SaNow)
                                .OrderByDescending(r => r.EffectiveDate).FirstOrDefault();
                            if (bankingDetails != null)
                            {
                                collection.AccountNo = bankingDetails.AccountNumber;
                                var bankBranch = bankBranches.FirstOrDefault(b => b.Id == bankingDetails.BankBranchId);
                                if (bankBranch != null)
                                {
                                    collection.BankBranch = bankBranch.Name;
                                    var bank = banks.FirstOrDefault(b => b.Id == bankBranch.BankId);
                                    if (bank != null)
                                    {
                                        collection.Bank = bank.Name;
                                    }
                                }

                                var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(s => s.RolePlayerId == policy.PolicyPayeeId);
                                if (rolePlayer != null)
                                {
                                    collection.Debtor = rolePlayer.DisplayName;
                                }
                            }
                        }
                        else if (collection.AdhocPaymentInstructionId.HasValue)
                        {
                            var adhocCollection = await _adhocCollectionRepository.FirstOrDefaultAsync(a => a.AdhocPaymentInstructionId == collection.AdhocPaymentInstructionId);
                            if (adhocCollection != null)
                            {
                                collection.AdhocPaymentInstruction = new AdhocPaymentInstruction()
                                {
                                    AdhocPaymentInstructionId = adhocCollection.AdhocPaymentInstructionId,
                                    RolePlayerId = adhocCollection.RolePlayerId
                                };

                                var bankDetailList = await _rolePlayerBankingDetailRepository
                                    .Where(b => b.RolePlayerId == collection.AdhocPaymentInstruction.RolePlayerId)
                                    .ToListAsync();
                                var bankingDetails = bankDetailList.Where(b => b.EffectiveDate <= DateTimeHelper.SaNow)
                                    .OrderByDescending(r => r.EffectiveDate).FirstOrDefault();
                                if (bankingDetails != null)
                                {
                                    collection.AccountNo = bankingDetails.AccountNumber;
                                    var bankBranch = bankBranches.FirstOrDefault(b => b.Id == bankingDetails.BankBranchId);
                                    if (bankBranch != null)
                                    {
                                        collection.BankBranch = bankBranch.Name;
                                        var bank = banks.FirstOrDefault(b => b.Id == bankBranch.BankId);
                                        if (bank != null)
                                        {
                                            collection.Bank = bank.Name;
                                        }
                                    }

                                    var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(s => s.RolePlayerId == collection.AdhocPaymentInstruction.RolePlayerId);
                                    if (rolePlayer != null)
                                    {
                                        collection.Debtor = rolePlayer.DisplayName;
                                    }
                                }
                            }
                        }
                    }
                }


                return data;
            }
        }

        public async Task ProcessClaimRecoveryEFTPayments()
        {
            try
            {
                var coidClaimsAcc = await _bankAccountService.GetBankAccount("COID Claims");
                var nonCoidClaimsAcc = await _bankAccountService.GetBankAccount("Non-COID Claims");

                var coidClaimsAccNum = coidClaimsAcc.AccountNumber.PadLeft(16, '0').Trim();
                var nonCoidClaimsAccNum = nonCoidClaimsAcc.AccountNumber.PadLeft(16, '0').Trim();

                const string validRecordId = "91";

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entities = await _facsStatementRepository
                        .Where(d => !d.Proccessed && (d.BankAccountNumber.Trim() == coidClaimsAccNum || d.BankAccountNumber.Trim() == nonCoidClaimsAccNum) &&
                                    string.IsNullOrEmpty(d.TransactionType) && string.IsNullOrEmpty(d.DocumentType) && d.RecordId == validRecordId && d.ClaimCheckReference.HasValue)
                        .OrderBy(d => d.CreatedDate).ToListAsync();
                    foreach (var entity in entities)
                    {
                        var amount = 0.00M;
                        if (entity.NettAmount.HasValue)
                        {
                            amount = (decimal)((long)entity.NettAmount / 100.0);
                        }
                        amount = entity.DebitCredit == "+" ? Math.Abs(amount) : -Math.Abs(amount);

                        if (entity.DebitCredit == "-")
                        {
                            var unallocatedPayment = new billing_UnallocatedPayment()
                            {
                                AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                                UnallocatedAmount = amount,
                                BankStatementEntryId = entity.BankStatementEntryId
                            };
                            _unallocatedPaymentRepository.Create(unallocatedPayment);
                            entity.Proccessed = true;
                            continue;
                        }

                        var debtor = await _rolePlayerService.GetClaimRecoveryDebtorByBankStatementReference(entity.UserReference);
                        if (debtor != null)
                        {
                            var statementReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty);

                            var searchResults = await _invoiceRepository.SqlQueryAsync<ClaimRecoveryInvoiceSearchByBankRefResult>(
                                DatabaseConstants.SearchForClaimRecoveryInvoiceByBankStatementReference,
                                new SqlParameter("StatementReference", entity.UserReference));
                            if (searchResults.Count == 1)
                            {
                                var invoice = await _claimRecoveryInvoiceService.GetInvoice(searchResults[0].ClaimRecoveryInvoiceId);
                                var invoiceEntity = Mapper.Map<billing_ClaimRecoveryInvoice>(invoice);

                                var claimRecoveryInvoiceTransaction = await _transactionRepository.Where(t => t.ClaimRecoveryInvoiceId == invoiceEntity.ClaimRecoveryInvoiceId).SingleAsync();

                                invoiceEntity.InvoiceStatus = amount < invoice.Balance ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Paid;

                                var bankTransfer = await _interBankTransferService.GetTransfer(entity.UserReference);
                                if (bankTransfer == null)
                                {
                                    var trans = new billing_Transaction
                                    {
                                        Amount = amount,
                                        BankReference = searchResults[0].ClaimReferenceNumber,
                                        ClaimRecoveryInvoiceId = null,
                                        TransactionDate = DateTimeHelper.SaNow,
                                        TransactionType = TransactionTypeEnum.ClaimRecoveryPayment,
                                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                        BankStatementEntryId = entity.BankStatementEntryId,
                                        RmaReference = statementReference,
                                        RolePlayerId = claimRecoveryInvoiceTransaction.RolePlayerId
                                    };

                                    trans.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                                    {
                                        ClaimRecoveryId = invoiceEntity.ClaimRecoveryInvoiceId,
                                        Amount = trans.Amount < invoice.Balance ? trans.Amount : invoice.Balance,
                                        BillingAllocationType = BillingAllocationTypeEnum.ClaimRecovery
                                    });

                                    await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
                                }
                                else
                                {
                                    var trans = new billing_Transaction
                                    {
                                        Amount = amount,
                                        BankReference = searchResults[0].ClaimReferenceNumber,
                                        ClaimRecoveryInvoiceId = null,
                                        TransactionDate = DateTimeHelper.SaNow,
                                        TransactionType = TransactionTypeEnum.ClaimRecoveryPayment,
                                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                        BankStatementEntryId = entity.BankStatementEntryId,
                                        RmaReference = statementReference,
                                        RolePlayerId = claimRecoveryInvoiceTransaction.RolePlayerId
                                    };

                                    trans.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                                    {
                                        ClaimRecoveryId = invoiceEntity.ClaimRecoveryInvoiceId,
                                        Amount = trans.Amount < invoice.Balance ? trans.Amount : invoice.Balance,
                                        BillingAllocationType = BillingAllocationTypeEnum.ClaimRecovery
                                    });

                                    await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));

                                    await _interBankTransferService.MarkTransferAsAllocated(bankTransfer.InterBankTransferId);
                                }
                            }
                            else
                            {
                                var unallocatedPayment = new billing_UnallocatedPayment()
                                {
                                    AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                                    UnallocatedAmount = amount,
                                    BankStatementEntryId = entity.BankStatementEntryId
                                };
                                _unallocatedPaymentRepository.Create(unallocatedPayment);

                                /* var bankTransfer = await _interBankTransferService.GetTransfer(entity.UserReference);
                                if (bankTransfer == null)
                                {
                                    var trans = new billing_Transaction()
                                    {
                                        Amount = amount,
                                        BankReference = string.Empty,
                                        ClaimRecoveryInvoiceId = null,
                                        TransactionDate = DateTimeHelper.SaNow,
                                        TransactionType = TransactionTypeEnum.ClaimRecoveryPayment,
                                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                        BankStatementEntryId = entity.BankStatementEntryId,
                                        RmaReference = statementReference,
                                        RolePlayerId = debtorRolePlayerId.RolePlayerId
                                    };

                                    await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
                                }
                                else
                                {
                                    var trans = new billing_Transaction
                                    {
                                        Amount = amount,
                                        BankReference = string.Empty,
                                        ClaimRecoveryInvoiceId = null,
                                        TransactionDate = DateTimeHelper.SaNow,
                                        TransactionType = TransactionTypeEnum.ClaimRecoveryPayment,
                                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                        BankStatementEntryId = entity.BankStatementEntryId,
                                        RmaReference = statementReference,
                                        RolePlayerId = debtorRolePlayerId.RolePlayerId
                                    };

                                    await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));

                                    await _interBankTransferService.MarkTransferAsAllocated(bankTransfer
                                        .InterBankTransferId);
                                } */
                            }
                        }
                        else
                        {
                            var unallocatedPayment = new billing_UnallocatedPayment()
                            {
                                AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                                UnallocatedAmount = amount,
                                BankStatementEntryId = entity.BankStatementEntryId
                            };
                            _unallocatedPaymentRepository.Create(unallocatedPayment);
                        }

                        entity.Proccessed = true;
                        _facsStatementRepository.Update(entity);
                    }

                    await scope.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Processing Claim Recovery EFT Payments - Error Message {ex.Message}");
            }
        }

        public async Task CreateAdhocDebitOrderWizard(AdhocPaymentInstruction debitOrder)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.CreateDebitOrder);

            if (debitOrder != null)
            {
                var startWizardRequest = new StartWizardRequest
                {
                    Type = "adhoc-collection",
                    LinkedItemId = -1,
                    Data = _serializerService.Serialize(debitOrder),
                    RequestInitiatedByBackgroundProcess = true
                };

                await _wizardService.StartWizard(startWizardRequest);
            }
        }


        public async Task DoExternalCollectionReconcilations()
        {
            try
            {
                List<finance_BankStatementEntry> entities;
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var bankStatementProcessingCount = await _configurationService.GetModuleSetting(SystemSettings.BankStatementProcessingCount);
                    if (string.IsNullOrEmpty(bankStatementProcessingCount))
                    {
                        bankStatementProcessingCount = "20";
                    }
                    var bankTransactionTypes = new[] { BankTransactionTypeEnum.RMA02, BankTransactionTypeEnum.RMA05, BankTransactionTypeEnum.RMA03, BankTransactionTypeEnum.RMA06, BankTransactionTypeEnum.RMA20 };
                    var funeralBankTransactionTypes = bankTransactionTypes
                        .Select(e => e.GetType()
                            .GetField(e.ToString())
                            .GetCustomAttributes(typeof(DisplayAttribute), false)
                            .Cast<DisplayAttribute>()
                            .FirstOrDefault()?.Name ?? e.ToString())
                        .ToArray();

                    entities = await _facsStatementRepository
                        .Where(b => !b.Proccessed && b.DocumentType.Trim() == debitOrderDocumentType && b.ClaimCheckReference.HasValue
                                    && !funeralBankTransactionTypes.Contains(b.TransactionType)).Take(bankStatementProcessingCount.ToInt().Value)
                        .OrderBy(d => d.CreatedDate).ToListAsync();

                }
       
                foreach (var entity in entities)
                {
                    var rolePlayerIds = new List<int>();
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        //ReCheck Is-Processed Flag - In case there are other instances of the service processing same data set.  
                        var entitiesToProcess = await _facsStatementRepository
                         .Where(d => !d.Proccessed && d.BankStatementEntryId == entity.BankStatementEntryId)
                         .ToListAsync();

                        if(entitiesToProcess.Count ==0)
                        {
                            continue;
                        }


                        var requisitionNumber = entity.RequisitionNumber.PadLeft(9, '0');
                        var bankAccountNumber = entity.BankAccountNumber.TrimStart(new char[] { '0' });

                        var result = await _facsResultRepository.Where(d => d.RequisitionNumber == requisitionNumber
                                                                            && d.IsActive
                                                                            && d.TransactionType == entity.TransactionType
                                                                            && d.DocumentType == entity.DocumentType
                                                                            && d.BankAccountNumber == bankAccountNumber).FirstOrDefaultAsync();

                        if (result == null)
                        {
                            try
                            {
                                await AllocateBankEntries(entitiesToProcess, rolePlayerIds);
                                await scope.SaveChangesAsync();
                            }
                            catch (Exception ex)
                            {
                                ex.LogException($"Error when Processing External Collection Reconciliation - BankStatementEntryId {entitiesToProcess[0]} -  Error Message {ex.Message}");
                            }
                        }

                    }

                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        try
                        {
                            foreach (var roleplayerId in rolePlayerIds)
                            {
                                var debtorCreditBalance = decimal.Negate(await GetDebtorCreditBalance(roleplayerId));

                                if (debtorCreditBalance >= 0)
                                {
                                    await AllocateToDebtorDocuments(roleplayerId);
                                }
                            }

                            await scope.SaveChangesAsync();
                        }
                        catch (Exception ex)
                        {
                            ex.LogException($"Error when allocating to debtor documents -  Error Message {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Doing External Collection Reconcilations - Error Message {ex.Message}");
            }
        }

        public async Task GenerateCollectionsForPeriod(DateTime periodStartDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddCollection);

            var invoices = await _invoiceService.GetUnpaidInvoicesForPeriod(periodStartDate);

            foreach (var invoice in invoices)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entity = await _collectionRepository.Where(s => s.InvoiceId == invoice.InvoiceId).FirstOrDefaultAsync();

                    if (entity != null) continue;

                    var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId);
                    var bankingDetails = await _rolePlayerService.GetActiveBankingDetails(policy.PolicyPayeeId);

                    if (bankingDetails == null) continue;

                    if (policy.PaymentMethod != PaymentMethodEnum.DebitOrder) continue;

                    if (invoice.Balance > 0)
                    {
                        entity = new billing_Collection
                        {
                            CollectionStatus = CollectionStatusEnum.Pending,
                            InvoiceId = invoice.InvoiceId,
                            MaxSubmissionCount = 10, //   should there be a max?
                            PolicyId = invoice.PolicyId,
                            RolePlayerBankingId = bankingDetails.RolePlayerBankingId,
                            BankReference = policy.PolicyNumber,
                            Amount = invoice.Balance,
                            CollectionType = CollectionTypeEnum.Normal
                        };

                        _collectionRepository.Create(entity);
                    }

                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<List<CollectionsAgeing>> GetCollectionsAgeing(int balanceTypeId, int clientTypeId, int debtorStatus, string endDate, int industryId, int productId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewCollection);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var product = await _productService.GetProduct(productId);
                var paramEndDate = DateTime.Parse(endDate).ToString("yyyy/MM/dd");
                var parameters = new List<SqlParameter>
                {
                    new SqlParameter
                    {
                        ParameterName = "@EndDate",
                        SqlDbType = System.Data.SqlDbType.DateTime,
                        Value = paramEndDate
                    },
                    new SqlParameter
                    {
                        ParameterName = "@IndustryId",
                        SqlDbType = System.Data.SqlDbType.Int,
                        Value = industryId
                    },
                    new SqlParameter
                    {
                        ParameterName = "@BalanceTypeId",
                        SqlDbType = System.Data.SqlDbType.Int,
                        Value = balanceTypeId
                    },
                    new SqlParameter
                    {
                        ParameterName = "@DebtorStatus",
                        SqlDbType = System.Data.SqlDbType.Int,
                        Value = debtorStatus
                    },
                    new SqlParameter
                    {
                        ParameterName = "@ClientTypeId",
                        SqlDbType = System.Data.SqlDbType.Int,
                        Value = clientTypeId
                    },
                    new SqlParameter
                    {
                    ParameterName = "@ProductName",
                    SqlDbType = System.Data.SqlDbType.VarChar,
                    Value = product.Name
                }
                };

                return await _collectionRepository.SqlQueryAsync<CollectionsAgeing>(DatabaseConstants.CollectionsAgeingReportStoredProcedure, parameters.ToArray());
            }
        }

        private async Task<bool> AllocateChildPayment(List<string> references, int allocatedDebtorRoleplayerId, DateTime transactionDate, decimal transactionAmount)
        {
            bool isChildPolicy = false;
            try
            {
                var childPolicy = await _policyRepository
                .Where(p => (references.Contains(p.ClientReference) || references.Contains(p.PolicyNumber)) && p.ParentPolicyId != null)
                .ToListAsync();

                if (childPolicy.Count > 0)
                    isChildPolicy = true;

                if (childPolicy != null
                    && childPolicy?.Count == 1
                    && childPolicy.FirstOrDefault()?.PolicyOwnerId != allocatedDebtorRoleplayerId)
                {
                    var policyId = childPolicy.FirstOrDefault()?.PolicyId;
                    var roleplayerId = childPolicy.FirstOrDefault()?.PolicyOwnerId;
                    var paymentMonth = transactionDate.AddMonths(-1).Month;
                    var paymentYear = transactionDate.AddMonths(-1).Year;
                    var amount = (double)transactionAmount;

                    var premiumlistingTransaction = await _premiumListingRepository
                        .FirstOrDefaultAsync(p => p.RolePlayerId == roleplayerId
                    && p.PolicyId == policyId
                    && paymentMonth == p.InvoiceDate.Month
                    && paymentYear == p.InvoiceDate.Year
                    && amount <= p.InvoiceAmount);

                    if (premiumlistingTransaction != null)
                    {
                        premiumlistingTransaction.PaymentAmount = amount;
                        premiumlistingTransaction.PaymentDate = transactionDate;
                        premiumlistingTransaction.ModifiedDate = DateTimeHelper.SaNow;

                        if (amount == premiumlistingTransaction.InvoiceAmount)
                        {
                            premiumlistingTransaction.InvoiceStatus = InvoiceStatusEnum.Paid;
                        }
                        else if (amount < premiumlistingTransaction.InvoiceAmount)
                        {
                            premiumlistingTransaction.InvoiceStatus = InvoiceStatusEnum.Partially;
                        }

                        _premiumListingRepository.Update(premiumlistingTransaction);
                    }
                }
                return isChildPolicy;
            }
            catch (Exception ex)
            {
                var refs = new StringBuilder();
                references.ForEach(r => refs.Append(r + ","));
                ex.LogException($"Error when auto allocating child policy with references : {refs}");
                return isChildPolicy;
            }
        }

        private async Task<List<int>> NarrowDownDebtorSearchUsingDebtorBalances(List<int> roleplayerIds, decimal amountBeingPaid)
        {
            var results = new List<int>();
            foreach (var roleplayerId in roleplayerIds)
            {
                var balances = await _billingService.GetDebtorProductCategoryBalances(roleplayerId);
                if (balances.Count > 0)
                {
                    var totalBalance = balances.Sum(c => c.Balance);
                    if (totalBalance == amountBeingPaid)
                    {
                        results.Add(roleplayerId);
                        continue;
                    }

                    foreach (var item in balances)
                    {
                        if (item.Balance == amountBeingPaid)
                        {
                            results.Add(roleplayerId);
                            break;
                        }
                    }
                }
            }
            return results;
        }

        private async Task<decimal> AllocateToDocumentsIfBalanceIsLessThanAmountPaid(int roleplayerId, int bankStatementEntryId, string statementReference, decimal paidAmount, int? paymentTransactionId = null)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var totalAllocated = await _collectionRepository.SqlQueryAsync<decimal>(
                    DatabaseConstants.AllocatePaymentToDebitTransactions,
                    new SqlParameter("@roleplayerId", roleplayerId),
                    new SqlParameter("@amountPaid", paidAmount),
                    new SqlParameter("@bankstatementEntryId", bankStatementEntryId),
                    new SqlParameter("@rmaReference", statementReference),
                    new SqlParameter("@paymentTransactionId", paymentTransactionId)
                     );
                return totalAllocated.FirstOrDefault();
            }

        }

        private async Task<List<FinPayee>> GetDebtorsByBankStatementReference(string userReference, string userReference2)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResults = await _collectionRepository.SqlQueryAsync<FinPayee>(
                    DatabaseConstants.SearchMultipleDebtorsByBankStatementReference,
                    new SqlParameter("@userReference", userReference),
                    new SqlParameter("@userReference2", userReference2));
                return searchResults.Count > 0 ? searchResults : null;
            }
        }


        private async Task<bool> AllocateTransactionToCorrectIndustry(int rolePlayerId, string bankAccountNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResults = await _collectionRepository.SqlQueryAsync<FinPayee>(
                    DatabaseConstants.AllocateTransactionToCorrectIndustry,
                    new SqlParameter("@rolePlayerId", rolePlayerId),
                    new SqlParameter("@bankAccountNumber", bankAccountNumber));
                return searchResults.Count > 0 ? true : false;
            }
        }

        private async Task<List<FinPayee>> SearchForDebtorByBankStatementEntryId(int bankStatementEntryId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResults = await _collectionRepository.SqlQueryAsync<FinPayee>(
                    DatabaseConstants.SearchForDebtorByBankStatementEntryId,
                    new SqlParameter("@bankStatementEntryId", bankStatementEntryId));
                return searchResults;
            }
        }

        private async Task AllocateDebitOrderCheckingForDuplicateTransactions(finance_BankStatementEntry entity, FinPayee debtor, Industry industry, decimal amount, List<CommissionInvoicePaymentAllocation> commissionAllocations)
        {
            var statementReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " +
                                                                    (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ??
                                                                     string.Empty);

            var searchResults = await _invoiceRepository.SqlQueryAsync<InvoiceSearchByBankRefResult>(
                DatabaseConstants.SearchForInvoiceByBankStatementReference,
                new SqlParameter("StatementReference", entity.UserReference2));
            if (searchResults.Count == 1)
            {
                var invoice = await _invoiceService.GetInvoice(searchResults[0].InvoiceId);
                var invoiceEntity = Mapper.Map<billing_Invoice>(invoice);
                await _invoiceRepository.LoadAsync(invoiceEntity, x => x.Policy);

                var product =
                    await _productOptionService.GetProductByProductOptionId(invoiceEntity.Policy
                        .ProductOptionId);
                var productBankAccount =
                    product.ProductBankAccounts.FirstOrDefault(p =>
                        p.IndustryClass == industry.IndustryClass);
                if (productBankAccount != null)
                {
                    var bankAccount =
                        await _bankAccountService.GetBankAccountByAccountNumber(productBankAccount
                            .BankAccountId);
                    var productBankAccountNumber = bankAccount.AccountNumber;
                    productBankAccountNumber = productBankAccountNumber.PadLeft(16, '0').Trim();
                    if (entity.BankAccountNumber.Trim() == productBankAccountNumber)
                    {
                        var previousAllocations = await _transactionRepository.Where(t => t.Amount == entity.Amount
          && t.RolePlayerId == debtor.RolePlayerId
          && t.BankStatementEntryId == entity.BankStatementEntryId).ToListAsync();
                        if (previousAllocations.Count == 0)
                        {

                            var invoiceBalance = invoice.Balance;

                            invoiceEntity.InvoiceStatus = amount < invoiceBalance
                                ? InvoiceStatusEnum.Partially
                                : InvoiceStatusEnum.Paid;

                            var trans = new billing_Transaction
                            {
                                Amount = amount,
                                BankReference = searchResults[0].PolicyNumber,
                                InvoiceId = null,
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionType = TransactionTypeEnum.Payment,
                                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                BankStatementEntryId = entity.BankStatementEntryId,
                                RmaReference = statementReference,
                                RolePlayerId = invoiceEntity.Policy.PolicyOwnerId
                            };
                            await _paymentAllocationService.ReduceUnallocatedBalance(entity.BankStatementEntryId, amount);

                            //do interest allocai

                            trans.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                            {
                                InvoiceId = invoiceEntity.InvoiceId,
                                Amount = trans.Amount < invoiceBalance ? trans.Amount : invoiceBalance,
                                BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                                TransactionTypeLinkId = (int)TransactionActionType.Credit
                            });

                            var createdTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));

                            if (entity.StatementDate != null)
                                await AllocateToTermsArrangement(debtor.RolePlayerId, amount, (DateTime)entity.StatementDate, createdTransactionId);


                            if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid)
                            {
                                switch (invoiceEntity.Policy.PolicyStatus)
                                {
                                    case PolicyStatusEnum.PendingFirstPremium:
                                        invoiceEntity.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                        break;
                                }
                            }

                            if (invoiceEntity.Policy.CommissionPercentage > 0 ||
                                invoiceEntity.Policy.AdminPercentage > 0)
                            {
                                var invoiceId = invoiceEntity.InvoiceId;
                                commissionAllocations.Add(new CommissionInvoicePaymentAllocation()
                                {
                                    InvoiceId = invoiceId,
                                    Amount = invoiceEntity.TotalInvoiceAmount,
                                    TransactionDate = DateTimeHelper.SaNow,
                                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                    IsProcessed = false,
                                    IsDeleted = false,
                                    CreatedBy = "autoallocation",
                                    CreatedDate = DateTimeHelper.SaNow,
                                    ModifiedBy = "autoallocation",
                                    ModifiedDate = DateTimeHelper.SaNow
                                });
                            }
                        }
                    }
                    else
                    {
                        var previousAllocations = await _unallocatedPaymentRepository
                       .Where(t => t.BankStatementEntryId == entity.BankStatementEntryId).ToListAsync();
                        if (previousAllocations.Count == 0)
                        {
                            var unallocatedPayment = new billing_UnallocatedPayment()
                            {
                                AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                                UnallocatedAmount = amount,
                                BankStatementEntryId = entity.BankStatementEntryId
                            };
                            _unallocatedPaymentRepository.Create(unallocatedPayment);
                        }
                    }
                }
                else
                {
                    var previousAllocations = await _unallocatedPaymentRepository
                        .Where(t => t.BankStatementEntryId == entity.BankStatementEntryId).ToListAsync();
                    if (previousAllocations.Count == 0)
                    {
                        var unallocatedPayment = new billing_UnallocatedPayment()
                        {
                            AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                            UnallocatedAmount = amount,
                            BankStatementEntryId = entity.BankStatementEntryId
                        };
                        _unallocatedPaymentRepository.Create(unallocatedPayment);
                    }
                }
            }
            else
            {
                var previousAllocations = await _transactionRepository.Where(t => t.Amount == entity.Amount
           && t.RolePlayerId == debtor.RolePlayerId
           && t.BankStatementEntryId == entity.BankStatementEntryId).ToListAsync();
                if (previousAllocations.Count == 0)
                {
                    var trans = new billing_Transaction()
                    {
                        Amount = amount,
                        BankReference = string.Empty,
                        InvoiceId = null,
                        TransactionDate = DateTimeHelper.SaNow,
                        TransactionType = TransactionTypeEnum.Payment,
                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                        BankStatementEntryId = entity.BankStatementEntryId,
                        RmaReference = statementReference,
                        RolePlayerId = debtor.RolePlayerId
                    };

                    var createdTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
                    await _paymentAllocationService.ReduceUnallocatedBalance(entity.BankStatementEntryId, amount);
                    if (entity.StatementDate != null)
                        await AllocateToTermsArrangement(debtor.RolePlayerId, amount, (DateTime)entity.StatementDate, createdTransactionId);
                }
            }
        }

        private async Task AllocateDebitOrderTransaction(finance_BankStatementEntry entity, FinPayee debtor, Industry industry, decimal amount, List<CommissionInvoicePaymentAllocation> commissionAllocations)
        {
            var statementReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " +
                                                                    (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ??
                                                                     string.Empty);

            var searchResults = await _invoiceRepository.SqlQueryAsync<InvoiceSearchByBankRefResult>(
                DatabaseConstants.SearchForInvoiceByBankStatementReference,
                new SqlParameter("StatementReference", entity.UserReference2));
            if (searchResults.Count == 1)
            {
                var invoice = await _invoiceService.GetInvoice(searchResults[0].InvoiceId);
                var invoiceEntity = Mapper.Map<billing_Invoice>(invoice);
                await _invoiceRepository.LoadAsync(invoiceEntity, x => x.Policy);

                var product =
                    await _productOptionService.GetProductByProductOptionId(invoiceEntity.Policy
                        .ProductOptionId);
                var productBankAccount =
                    product.ProductBankAccounts.FirstOrDefault(p =>
                        p.IndustryClass == industry.IndustryClass);
                if (productBankAccount != null)
                {
                    var bankAccount =
                        await _bankAccountService.GetBankAccountByAccountNumber(productBankAccount
                            .BankAccountId);
                    var productBankAccountNumber = bankAccount.AccountNumber;
                    productBankAccountNumber = productBankAccountNumber.PadLeft(16, '0').Trim();
                    if (entity.BankAccountNumber.Trim() == productBankAccountNumber)
                    {
                        var invoiceBalance = invoice.Balance;

                        invoiceEntity.InvoiceStatus = amount < invoiceBalance
                            ? InvoiceStatusEnum.Partially
                            : InvoiceStatusEnum.Paid;

                        var trans = new billing_Transaction
                        {
                            Amount = amount,
                            BankReference = searchResults[0].PolicyNumber,
                            InvoiceId = null,
                            TransactionDate = DateTimeHelper.SaNow,
                            TransactionType = TransactionTypeEnum.Payment,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            BankStatementEntryId = entity.BankStatementEntryId,
                            RmaReference = statementReference,
                            RolePlayerId = invoiceEntity.Policy.PolicyOwnerId
                        };

                        trans.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                        {
                            InvoiceId = invoiceEntity.InvoiceId,
                            Amount = trans.Amount < invoiceBalance ? trans.Amount : invoiceBalance,
                            BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit
                        });

                        var createdTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
                        await _paymentAllocationService.ReduceUnallocatedBalance(entity.BankStatementEntryId, amount);
                        if (entity.StatementDate != null)
                            await AllocateToTermsArrangement(debtor.RolePlayerId, amount, (DateTime)entity.StatementDate, createdTransactionId);

                        if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid)
                        {
                            switch (invoiceEntity.Policy.PolicyStatus)
                            {
                                case PolicyStatusEnum.PendingFirstPremium:
                                    invoiceEntity.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                    break;
                            }
                        }

                        if (invoiceEntity.Policy.CommissionPercentage > 0 ||
                            invoiceEntity.Policy.AdminPercentage > 0)
                        {
                            var invoiceId = invoiceEntity.InvoiceId;
                            commissionAllocations.Add(new CommissionInvoicePaymentAllocation()
                            {
                                InvoiceId = invoiceId,
                                Amount = invoiceEntity.TotalInvoiceAmount,
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                IsProcessed = false,
                                IsDeleted = false,
                                CreatedBy = "autoallocation",
                                CreatedDate = DateTimeHelper.SaNow,
                                ModifiedBy = "autoallocation",
                                ModifiedDate = DateTimeHelper.SaNow
                            });
                        }
                    }
                    else
                    {
                        var unallocatedPayment = new billing_UnallocatedPayment()
                        {
                            AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                            UnallocatedAmount = amount,
                            BankStatementEntryId = entity.BankStatementEntryId
                        };
                        _unallocatedPaymentRepository.Create(unallocatedPayment);
                    }
                }
                else
                {
                    var unallocatedPayment = new billing_UnallocatedPayment()
                    {
                        AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                        UnallocatedAmount = amount,
                        BankStatementEntryId = entity.BankStatementEntryId
                    };
                    _unallocatedPaymentRepository.Create(unallocatedPayment);
                }
            }
            else
            {
                var trans = new billing_Transaction()
                {
                    Amount = amount,
                    BankReference = string.Empty,
                    InvoiceId = null,
                    TransactionDate = DateTimeHelper.SaNow,
                    TransactionType = TransactionTypeEnum.Payment,
                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                    BankStatementEntryId = entity.BankStatementEntryId,
                    RmaReference = statementReference,
                    RolePlayerId = debtor.RolePlayerId
                };
                var createdTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
                await _paymentAllocationService.ReduceUnallocatedBalance(entity.BankStatementEntryId, amount);
                if (entity.StatementDate != null)
                    await AllocateToTermsArrangement(debtor.RolePlayerId, amount, (DateTime)entity.StatementDate, createdTransactionId);
            }
        }

        private async Task AllocateToTermsArrangement(int roleplayerId, decimal amount, DateTime statementdate, int transactionId)
        {
            await _paymentAllocationService.AllocateToTermsArrangement(roleplayerId, amount, statementdate, transactionId);
        }

        private async Task AllocateBankEntries(List<finance_BankStatementEntry> entities, List<int> rolePlayerIds)
        {
            foreach (var entity in entities)
            {
                var amount = 0.00M;
                if (entity.NettAmount.HasValue)
                {
                    amount = (decimal)((long)entity.NettAmount / 100.0);
                }
                amount = entity.DebitCredit == "+" ? Math.Abs(amount) : -Math.Abs(amount);

                var debtors = await SearchForDebtorByBankStatementEntryId(entity.BankStatementEntryId);

                var narrowedDebtors = debtors;
                if (debtors?.Count > 1)
                {
                    var roleplayerIds = await NarrowDownDebtorSearchUsingDebtorBalances(debtors.Select(c => c.RolePlayerId).ToList(), amount);
                    narrowedDebtors = debtors.Where(c => roleplayerIds.Contains(c.RolePlayerId)).ToList();
                }

                if (narrowedDebtors?.Count == 1)
                {

                    var debtor = narrowedDebtors[0];
                    Industry industry = null;
                    if (!rolePlayerIds.Contains(debtor.RolePlayerId))
                    {
                        rolePlayerIds.Add(debtor.RolePlayerId);
                    }

                    if (entity.DebitCredit == "-")
                    {
                        var previousAllocations = await _transactionRepository.Where(t => t.Amount == amount
                        && t.RolePlayerId == debtor.RolePlayerId
                                && t.BankStatementEntryId == entity.BankStatementEntryId).ToListAsync();
                        if (previousAllocations.Count == 0)
                        {
                            var paymentReversalTransaction = new billing_Transaction
                            {
                                Amount = decimal.Negate(amount),
                                BankReference = entity.UserReference2,
                                InvoiceId = null,
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionType = TransactionTypeEnum.PaymentReversal,
                                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                BankStatementEntryId = entity.BankStatementEntryId,
                                RmaReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " + (entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty),
                                RolePlayerId = debtor.RolePlayerId,
                                AdhocPaymentInstructionId = null,
                                IsLogged = true
                            };
                            var createdTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(paymentReversalTransaction));


                            if (debtor != null)
                            {
                                var debtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);
                                var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                var bankaccount = await _bankAccountService.GetBankAccountByStringAccountNumber(entity.BankAccountNumber.TrimStart(new char[] { '0' }));
                                _ = await PostItemToGeneralLedger(debtor.RolePlayerId, createdTransactionId, decimal.Negate(amount), bankaccount.Id, bankChart, string.Empty, true, debtorIndustry.IndustryClass, null);
                            }
                            await _paymentAllocationService.ReduceUnallocatedBalance(entity.BankStatementEntryId, decimal.Negate(amount));
                            if (entity.StatementDate != null)
                                await AllocateToTermsArrangement(debtor.RolePlayerId, decimal.Negate(amount), (DateTime)entity.StatementDate, createdTransactionId);
                            //TODO: reverse payment if it was allocated to documents(interest + invoices)
                        }

                        entity.Proccessed = true;
                        _facsStatementRepository.Update(entity);
                        continue;
                    }

                    if (debtor.IndustryId > 0)
                    {
                        industry = await _industryService.GetIndustry(debtor.IndustryId);
                    }

                    await AllocateTransactionToCorrectIndustry(debtor.RolePlayerId, entity.BankAccountNumber.TrimStart(new char[] { '0' }));

                    if (industry != null)
                    {
                        var statementReference = entity.StatementNumber + "/" + entity.StatementLineNumber + " " +
                                                 (entity.StatementDate?.Date.FormatDaySlashMonthSlashYear() ??
                                                  string.Empty);


                        var references = new List<string> { entity.UserReference, entity.UserReference2 };
                        var bankTransfer = new InterBankTransfer();
                        int transferId = 0;
                        if (entity.UserReference.IndexOf("-o:t", StringComparison.CurrentCultureIgnoreCase) > 0)
                        {
                            var tokens = entity.UserReference.Split(' ');
                            if (int.TryParse(tokens.LastOrDefault(), out transferId))
                                if (transferId > 0)
                                {
                                    bankTransfer = await _interBankTransferService.GetInterbankTransferById(transferId);
                                    string fromAccountNumber = String.IsNullOrEmpty(bankTransfer.FromAccountNumber) ? Suspence : bankTransfer.FromAccountNumber;
                                    var creditTransaction = new billing_Transaction
                                    {
                                        Amount = amount,
                                        BankReference = string.Empty,
                                        InvoiceId = null,
                                        TransactionDate = DateTime.Now.ToSaDateTime(),
                                        PeriodId = await GetPeriodId(bankTransfer.PeriodStatus),
                                        TransactionType = TransactionTypeEnum.Payment,
                                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                        BankStatementEntryId = entity.BankStatementEntryId,
                                        RmaReference = $"{statementReference} Trf From {fromAccountNumber}",
                                        RolePlayerId = debtor.RolePlayerId,
                                        IsLogged = true
                                    };

                                    var instertedCreditTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(creditTransaction));
                                    if (debtor != null)
                                    {
                                        var debtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);
                                        var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                        var bankaccount = await _bankAccountService.GetBankAccountByStringAccountNumber(entity.BankAccountNumber.TrimStart(new char[] { '0' }));
                                        _ = await PostItemToGeneralLedger(debtor.RolePlayerId, instertedCreditTransactionId, amount, bankaccount.Id, bankChart, string.Empty, true, debtorIndustry.IndustryClass, null);
                                    }
                                    var transferDetails = await _interBankTransferService.GetTransferDetaislByInterbankId(transferId);

                                    //Deduct From Suspence: InterBank Transfer from Suspense to Debtor
                                    if (!bankTransfer.FromRolePlayerId.HasValue && creditTransaction.BankStatementEntryId.HasValue && transferDetails != null)
                                    {
                                        var bankTransferFromBankAccount = await _bankAccountService.GetBankAccountById(bankTransfer.FromRmaBankAccountId);
                                        foreach (var transferDetail in transferDetails)
                                        {
                                            var unallocatedPayment = await _unallocatedPaymentRepository
                                            .Where(t => t.BankStatementEntryId == transferDetail.BankStatementEntryId).FirstOrDefaultAsync();
                                            if (unallocatedPayment != null)
                                            {
                                                var suspenseDebtor = await GetSuspenseAccountDebtorDetailsByBankAccount(bankTransferFromBankAccount.AccountNumber.TrimStart(new char[] { '0' }));

                                                if (suspenseDebtor != null)
                                                {
                                                    var unallocatedItemId = unallocatedPayment.UnallocatedPaymentId;
                                                    var suspenseBSChart = await _configurationService.GetModuleSetting(SystemSettings.SuspenseBSChart);
                                                    var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                                    if (suspenseDebtor.IndustryClass.HasValue)
                                                    {
                                                        //deduct from suspence
                                                        _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, unallocatedItemId, (transferDetail.Amount * -1), suspenseDebtor.BankAccountId, string.Empty, suspenseBSChart, false, suspenseDebtor.IndustryClass.Value, instertedCreditTransactionId);

                                                        //deduct from source bank
                                                        _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, unallocatedItemId, (transferDetail.Amount * -1), bankTransferFromBankAccount.Id, bankChart, string.Empty, false, suspenseDebtor.IndustryClass.Value, instertedCreditTransactionId);
                                                    }

                                                }
                                            }
                                        }

                                    }

                                    //InterBank Transfer from Debtor to Debtor
                                    if (bankTransfer.FromRolePlayerId.HasValue && bankTransfer.FromRolePlayerId.Value > 0 && transferDetails != null)
                                    {
                                        var debitTransaction = new billing_Transaction
                                        {
                                            Amount = amount,
                                            BankReference = string.Empty,
                                            InvoiceId = null,
                                            TransactionDate = DateTime.Now.ToSaDateTime(),
                                            PeriodId = await GetPeriodId(bankTransfer.PeriodStatus),
                                            TransactionType = TransactionTypeEnum.Payment,
                                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                            BankStatementEntryId = entity.BankStatementEntryId,
                                            RmaReference = $"{statementReference} Trf To {bankTransfer.ToAccountNumber}",
                                            RolePlayerId = bankTransfer.FromRolePlayerId.Value,
                                            IsLogged = true
                                        };
                                        var insertedDebitTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(debitTransaction));

                                        foreach (var transferDetail in transferDetails)
                                        {
                                            var allocation = new billing_InvoiceAllocation { InvoiceId = null, TransactionId = insertedDebitTransactionId, Amount = transferDetail.Amount, TransactionTypeLinkId = (int)TransactionActionType.Debit, BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocationReversal, LinkedTransactionId = transferDetail.TransactionId };
                                            //todo get product category                                            
                                            debitTransaction.InvoiceAllocations_TransactionId.Add(allocation);
                                        }
                                        if (debtor != null)
                                        {
                                            var debtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);
                                            var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                            var bankaccount = await _bankAccountService.GetBankAccountByStringAccountNumber(entity.BankAccountNumber.TrimStart(new char[] { '0' }));
                                            _ = await PostItemToGeneralLedger(debtor.RolePlayerId, insertedDebitTransactionId, amount, bankaccount.Id, bankChart, string.Empty, true, debtorIndustry.IndustryClass, null);
                                        }
                                    }
                                    await _interBankTransferService.MarkTransferAsAllocated(transferId);
                                }
                        }

                        if (transferId == 0)
                        {
                            var previousAllocations = await _transactionRepository.Where(t => t.Amount == amount
                        && t.RolePlayerId == debtor.RolePlayerId
                        && t.BankStatementEntryId == entity.BankStatementEntryId).ToListAsync();
                            if (previousAllocations.Count == 0)
                            {
                                var trans = new billing_Transaction()
                                {
                                    Amount = amount,
                                    BankReference = string.Empty,
                                    InvoiceId = null,
                                    TransactionDate = DateTimeHelper.SaNow,
                                    TransactionType = TransactionTypeEnum.Payment,
                                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                    BankStatementEntryId = entity.BankStatementEntryId,
                                    RmaReference = statementReference,
                                    RolePlayerId = debtor.RolePlayerId,
                                    IsLogged = true
                                };

                                var createdTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
                                if (debtor != null)
                                {
                                    var debtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);
                                    var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                    var bankaccount = await _bankAccountService.GetBankAccountByStringAccountNumber(entity.BankAccountNumber.TrimStart(new char[] { '0' }));
                                    _ = await PostItemToGeneralLedger(debtor.RolePlayerId, createdTransactionId, amount, bankaccount.Id, bankChart, string.Empty, true, debtorIndustry.IndustryClass, null);
                                }
                                await AllocateChildPayment(references, debtor.RolePlayerId, entity.StatementDate.Value, amount);
                                await _paymentAllocationService.ReduceUnallocatedBalance(entity.BankStatementEntryId, amount);
                                if (entity.StatementDate != null)
                                    await AllocateToTermsArrangement(debtor.RolePlayerId, amount, (DateTime)entity.StatementDate, createdTransactionId);
                            }
                        }
                    }
                    else //null industry
                    {
                        var previousAllocations = await _unallocatedPaymentRepository
                            .Where(t => t.BankStatementEntryId == entity.BankStatementEntryId).ToListAsync();
                        if (previousAllocations.Count == 0)
                        {
                            var unallocatedPayment = new billing_UnallocatedPayment()
                            {
                                AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                                UnallocatedAmount = amount,
                                BankStatementEntryId = entity.BankStatementEntryId
                            };

                            int unallocatedItemId = await AddUnallocatedItem(unallocatedPayment);

                            var billingDisableCoidFeatureFlag = await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag);
                            if (!billingDisableCoidFeatureFlag)
                            {
                                var suspenseDebtor = await GetSuspenseAccountDebtorDetailsByBankAccount(entity.BankAccountNumber.TrimStart(new char[] { '0' }));
                                if (suspenseDebtor != null)
                                {
                                    unallocatedPayment.RoleplayerId = suspenseDebtor.RoleplayerId;
                                    var suspenseBSChart = await _configurationService.GetModuleSetting(SystemSettings.SuspenseBSChart);
                                    var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                    if (suspenseDebtor.IndustryClass.HasValue)

                                        //post to bank leg
                                        _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, unallocatedItemId, amount, suspenseDebtor.BankAccountId, bankChart, string.Empty, false, suspenseDebtor.IndustryClass.Value, null);

                                    //post to suspense leg
                                    _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, unallocatedItemId, amount, suspenseDebtor.BankAccountId, suspenseBSChart, string.Empty, false, suspenseDebtor.IndustryClass.Value, null);
                                }
                            }
                        }
                    }
                }
                else
                {
                    var previousAllocations = await _unallocatedPaymentRepository
                        .Where(t => t.BankStatementEntryId == entity.BankStatementEntryId).ToListAsync();
                    if (previousAllocations.Count == 0)
                    {
                        var unallocatedPayment = new billing_UnallocatedPayment()
                        {
                            AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                            UnallocatedAmount = amount,
                            BankStatementEntryId = entity.BankStatementEntryId,
                        };
                        int unallocatedItemId = await AddUnallocatedItem(unallocatedPayment);

                        var billingDisableCoidFeatureFlag = await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BillingDisableCoidFeatureFlag);
                        if (!billingDisableCoidFeatureFlag)
                        {
                            var suspenseDebtor = await GetSuspenseAccountDebtorDetailsByBankAccount(entity.BankAccountNumber.TrimStart(new char[] { '0' }));

                            if (suspenseDebtor != null)
                            {
                                unallocatedPayment.RoleplayerId = suspenseDebtor.RoleplayerId;
                                var suspenseBSChart = await _configurationService.GetModuleSetting(SystemSettings.SuspenseBSChart);
                                var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
                                if (suspenseDebtor.IndustryClass.HasValue)

                                    //post to bank leg
                                    _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, unallocatedItemId, amount, suspenseDebtor.BankAccountId, bankChart, string.Empty, false, suspenseDebtor.IndustryClass.Value, null);

                                //post to suspense leg
                                _ = await PostItemToGeneralLedger(suspenseDebtor.RoleplayerId, unallocatedItemId, amount, suspenseDebtor.BankAccountId, suspenseBSChart, string.Empty, false, suspenseDebtor.IndustryClass.Value, null);
                            }
                        }
                    }
                }

                entity.Proccessed = true;
                _facsStatementRepository.Update(entity);
            }
        }

        private async Task HandleUnallocatedPayment(finance_BankStatementEntry entity, decimal amount)
        {
            // Mark the bank entry as unallocated
            entity.Proccessed = false;
            _facsStatementRepository.Update(entity);

            // Log an unallocated transaction for reference
            var unallocatedTransaction = new billing_Transaction
            {
                Amount = amount,
                TransactionDate = DateTimeHelper.SaNow,
                TransactionType = TransactionTypeEnum.Payment,
                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                BankStatementEntryId = entity.BankStatementEntryId,
                RmaReference = $"{entity.StatementNumber}/{entity.StatementLineNumber} {(entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty)}",
                RolePlayerId = 0, // No role player since it's unallocated
                IsLogged = true
            };

            await _transactionService.AddTransaction(Mapper.Map<Transaction>(unallocatedTransaction));

            // Optionally notify the finance team about unallocated funds
            //await NotifyFinanceTeam(entity, amount);
        }

        private decimal CalculateAmount(finance_BankStatementEntry entity)
        {
            decimal amount = entity.NettAmount.HasValue ? (decimal)((long)entity.NettAmount / 100.0) : 0.00M;
            return entity.DebitCredit == "+" ? Math.Abs(amount) : -Math.Abs(amount);
        }

        private async Task<List<FinPayee>> NarrowDebtorSearch(List<FinPayee> debtors, decimal amount)
        {
            if (debtors?.Count > 1)
            {
                var roleplayerIds = await NarrowDownDebtorSearchUsingDebtorBalances(debtors.Select(c => c.RolePlayerId).ToList(), amount);
                return debtors.Where(c => roleplayerIds.Contains(c.RolePlayerId)).ToList();
            }
            return debtors;
        }

        private async Task ProcessDebtorAllocation(finance_BankStatementEntry entity, FinPayee debtor, decimal amount, List<int> rolePlayerIds)
        {
            if (!rolePlayerIds.Contains(debtor.RolePlayerId))
                rolePlayerIds.Add(debtor.RolePlayerId);

            if (entity.DebitCredit == "-")
            {
                await ProcessPaymentReversal(entity, debtor, amount);
                return;
            }

            var industry = debtor.IndustryId > 0 ? await _industryService.GetIndustry(debtor.IndustryId) : null;

            if (industry != null)
            {
                await AllocateToIndustry(entity, debtor, amount);
            }
            else
            {
                await HandleUnallocatedPayment(entity, amount);
            }
        }

        private async Task ProcessPaymentReversal(finance_BankStatementEntry entity, FinPayee debtor, decimal amount)
        {
            var previousAllocations = await _transactionRepository.Where(t =>
                t.Amount == amount && t.RolePlayerId == debtor.RolePlayerId && t.BankStatementEntryId == entity.BankStatementEntryId)
                .ToListAsync();

            if (!previousAllocations.Any())
            {
                var reversalTransaction = new billing_Transaction
                {
                    Amount = decimal.Negate(amount),
                    BankReference = entity.UserReference2,
                    TransactionDate = DateTimeHelper.SaNow,
                    TransactionType = TransactionTypeEnum.PaymentReversal,
                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                    BankStatementEntryId = entity.BankStatementEntryId,
                    RmaReference = $"{entity.StatementNumber}/{entity.StatementLineNumber} {(entity.StatementDate?.Date.ToString("dd/MM/yyyy") ?? string.Empty)}",
                    RolePlayerId = debtor.RolePlayerId,
                    IsLogged = true
                };

                var createdTransactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(reversalTransaction));
                await HandleGeneralLedgerPosting(entity, debtor, createdTransactionId, amount);
                await _paymentAllocationService.ReduceUnallocatedBalance(entity.BankStatementEntryId, decimal.Negate(amount));

                if (entity.StatementDate != null)
                    await AllocateToTermsArrangement(debtor.RolePlayerId, decimal.Negate(amount), entity.StatementDate.Value, createdTransactionId);
            }

            entity.Proccessed = true;
            _facsStatementRepository.Update(entity);
        }

        private async Task AllocateToIndustry(finance_BankStatementEntry entity, FinPayee debtor, decimal amount)
        {
            string statementReference = $"{entity.StatementNumber}/{entity.StatementLineNumber} {(entity.StatementDate?.Date.FormatDaySlashMonthSlashYear() ?? string.Empty)}";
            var references = new List<string> { entity.UserReference, entity.UserReference2 };

            var bankTransfer = await HandleBankTransfer(entity, debtor, amount, statementReference);
            if (bankTransfer == null)
            {
                await AllocateStandardPayment(entity, debtor, amount, statementReference);
            }
        }

        private async Task<InterBankTransfer> HandleBankTransfer(finance_BankStatementEntry entity, FinPayee debtor, decimal amount, string statementReference)
        {
            int transferId = ExtractTransferId(entity.UserReference);
            if (transferId > 0)
            {
                var bankTransfer = await _interBankTransferService.GetInterbankTransferById(transferId);
                var fromAccountNumber = string.IsNullOrEmpty(bankTransfer.FromAccountNumber) ? Suspence : bankTransfer.FromAccountNumber;

                var creditTransaction = new billing_Transaction
                {
                    Amount = amount,
                    TransactionDate = DateTimeHelper.SaNow,
                    TransactionType = TransactionTypeEnum.Payment,
                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                    BankStatementEntryId = entity.BankStatementEntryId,
                    RmaReference = $"{statementReference} Trf From {fromAccountNumber}",
                    RolePlayerId = debtor.RolePlayerId,
                    IsLogged = true
                };

                var transactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(creditTransaction));
                await HandleGeneralLedgerPosting(entity, debtor, transactionId, amount);
                await _interBankTransferService.MarkTransferAsAllocated(transferId);

                return bankTransfer;
            }
            return null;
        }

        private int ExtractTransferId(string userReference)
        {
            var tokens = userReference.Split(' ');
            return int.TryParse(tokens.LastOrDefault(), out int transferId) ? transferId : 0;
        }

        private async Task AllocateStandardPayment(finance_BankStatementEntry entity, FinPayee debtor, decimal amount, string statementReference)
        {
            var previousAllocations = await _transactionRepository.Where(t =>
                t.Amount == amount && t.RolePlayerId == debtor.RolePlayerId && t.BankStatementEntryId == entity.BankStatementEntryId)
                .ToListAsync();

            if (!previousAllocations.Any())
            {
                var trans = new billing_Transaction
                {
                    Amount = amount,
                    TransactionDate = DateTimeHelper.SaNow,
                    TransactionType = TransactionTypeEnum.Payment,
                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                    BankStatementEntryId = entity.BankStatementEntryId,
                    RmaReference = statementReference,
                    RolePlayerId = debtor.RolePlayerId,
                    IsLogged = true
                };

                var transactionId = await _transactionService.AddTransaction(Mapper.Map<Transaction>(trans));
                await HandleGeneralLedgerPosting(entity, debtor, transactionId, amount);
                await AllocateChildPayment(new List<string> { entity.UserReference, entity.UserReference2 }, debtor.RolePlayerId, entity.StatementDate.Value, amount);
                await _paymentAllocationService.ReduceUnallocatedBalance(entity.BankStatementEntryId, amount);
            }
        }

        private async Task HandleGeneralLedgerPosting(finance_BankStatementEntry entity, FinPayee debtor, int transactionId, decimal amount)
        {
            var debtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);
            var bankChart = await _configurationService.GetModuleSetting(SystemSettings.BillingBankChart);
            var bankAccount = await _bankAccountService.GetBankAccountByStringAccountNumber(entity.BankAccountNumber.TrimStart(new char[] { '0' }));

            _ = await PostItemToGeneralLedger(debtor.RolePlayerId, transactionId, amount, bankAccount.Id, bankChart, string.Empty, true, debtorIndustry.IndustryClass, null);
        }


        private async Task SaveUnAllocatedPayments(int statementEntryId, decimal amount)
        {
            var previousAllocations = await _unallocatedPaymentRepository
                           .Where(t => t.BankStatementEntryId == statementEntryId).ToListAsync();
            if (previousAllocations.Count == 0)
            {
                var unallocatedPayment = new billing_UnallocatedPayment()
                {
                    AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                    UnallocatedAmount = amount,
                    BankStatementEntryId = statementEntryId
                };
                _unallocatedPaymentRepository.Create(unallocatedPayment);
            }
        }
        private async Task<decimal> GetDebtorCreditBalance(int roleplayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _collectionRepository.SqlQueryAsync<decimal>(
                    DatabaseConstants.GetDebtorCreditBalance,
                    new SqlParameter("@roleplayerId", roleplayerId));
                return result.FirstOrDefault();
            }
        }

        private async Task AllocateToDebtorDocuments(int roleplayerId)
        {
            using (_dbContextScopeFactory.Create())
            {
                await _collectionRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.AllocateCreditBalanceToDebitTransactions,
                    new SqlParameter("@roleplayerId", roleplayerId));
            }
        }

        private async Task<List<billing_TermArrangementSchedule>> GetTermArrangementsReadyToCollect(int numberOfDaysInAdvance)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var effectiveDate = DateTime.Now.AddDays(numberOfDaysInAdvance).StartOfTheDay();
                var dateToday = DateTime.Now.StartOfTheDay();
                var entities = await _termArrangementScheduleRepository.Where(a =>
                   a.TermArrangement.PaymentMethod == PaymentMethodEnum.DebitOrder &&
                 effectiveDate >= a.PaymentDate && a.Amount > 0 && (a.IsCollectionDisabled == false || a.IsCollectionDisabled == null) && a.PaymentDate >= dateToday
                 && ((a.CollectBalance == false)
                 || (a.CollectBalance == true && a.AdhocPaymentInstructionsTermArrangementSchedules.Where(x => x.IsActive && !x.IsDeleted).Select(x => x.Amount).Sum() < a.Amount)
                 ))
               .ToListAsync();

                await _termArrangementScheduleRepository.LoadAsync(entities, c => c.TermArrangement);
                await _termArrangementScheduleRepository.LoadAsync(entities, c => c.AdhocPaymentInstructionsTermArrangementSchedules);
                return entities;
            }
        }

        public async Task QueuePendingCollectionsDaysInAdvance()
        {
            try
            {
                var collections = new List<Collection>();

                var numberOfDaysInAdvance =
                            await _configurationService.GetModuleSetting(SystemSettings
                                .DebitOrderDaysInAdvance);

                var batchReference = GenerateBatchReferenceNumber();
                var startDate = DateTime.Now.AddDays(-(int.Parse(numberOfDaysInAdvance)));
                var endDate = DateTime.Now.EndOfTheDay();
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entities = await _collectionRepository
                                        .Where(d => (d.CollectionStatus == CollectionStatusEnum.Pending ||
                                             (d.CollectionStatus == CollectionStatusEnum.Rejected && d.CanResubmit.Value))
                                             && d.EffectiveDate >= startDate && d.EffectiveDate <= endDate)
                                        .OrderBy(d => d.CreatedDate).ToListAsync();

                    if (entities.Count > 0)
                    {
                        var batchEntity = new billing_CollectionBatch
                        {
                            CreatedDate = DateTimeHelper.SaNow,
                            Reference = batchReference,
                            Collections = entities
                        };

                        _collectionBatchRepository.Create(batchEntity);

                        await scope.SaveChangesAsync();

                        foreach (var entity in entities)
                        {
                            collections.Add(Mapper.Map<Collection>(entity));
                        }
                    }
                }

                if (collections.Count > 0)
                {
                    foreach (var collection in collections)
                    {
                        await QueueCollection(collection, batchReference);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Queueing Pending Collections - Error Message {ex.Message}");
            }
        }

        public async Task<int> CreateAdhocCollection(AdhocPaymentInstruction collection)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddCollection);
            Contract.Requires(collection != null);

            Contract.Requires(collection.RolePlayerBankingId != null);
            try
            {
                var unDistributedPaymentInstructionAmount = collection.Amount;
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var rolePlayerBankingDetails = await _rolePlayerBankingDetailRepository.Where(x => x.RolePlayerBankingId == collection.RolePlayerBankingId).FirstOrDefaultAsync();

                    var paymentInstruction = new billing_AdhocPaymentInstruction
                    {
                        DateToPay = collection.DateToPay.ToSaDateTime(),
                        AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Pending,
                        Amount = collection.Amount,
                        RolePlayerId = collection.RolePlayerId,
                        RolePlayerName = collection.RolePlayerName,
                        Reason = collection.Reason,
                        RolePlayerBankingDetail = rolePlayerBankingDetails
                    };
                    _adhocCollectionRepository.Create(paymentInstruction);

                    //check if term arrangement has existing queued collections
                    if (collection.TargetedTermArrangementScheduleIds != null && collection.TargetedTermArrangementScheduleIds.Count > 0)
                    {
                        var queuedCollection = _collectionRepository.FirstOrDefault(x => collection.TargetedTermArrangementScheduleIds.Contains((int)x.TermArrangementScheduleId));
                        if (queuedCollection != null)
                        {
                            throw new Exception("Can not create Adhoc Debit Order. One of the selected term arrangement schedules has a queued collection");
                        }

                        //distribute adhoc payment amounts to term arrangement scheduled debit orders
                        foreach (var termArrangementScheduleId in collection.TargetedTermArrangementScheduleIds.OrderBy(x => x))
                        {
                            var termArrangementSchedule = await _termArrangementScheduleRepository.FindByIdAsync(termArrangementScheduleId);

                            if (termArrangementSchedule != null && termArrangementSchedule.IsCollectionDisabled == true)
                            {
                                continue;
                            }

                            var adhocPaymentInstructionsTermArrangementScheduleAmountTotal = _adhocPaymentInstructionsTermArrangementScheduleRepository.Where(x => x.TermArrangementScheduleId == termArrangementScheduleId && x.IsActive && !x.IsDeleted).ToList().Sum(x => x.Amount);

                            var termArrangementScheduleCollectableBalance = termArrangementSchedule.Amount - adhocPaymentInstructionsTermArrangementScheduleAmountTotal;

                            decimal amountToDistributeTermSchedule = 0;
                            if (unDistributedPaymentInstructionAmount <= termArrangementScheduleCollectableBalance)
                            {
                                amountToDistributeTermSchedule = unDistributedPaymentInstructionAmount;
                            }
                            else
                            {
                                amountToDistributeTermSchedule = termArrangementScheduleCollectableBalance;
                            }

                            var adhocPaymentInstructionsTermArrangementSchedule = new billing_AdhocPaymentInstructionsTermArrangementSchedule()
                            {
                                TermArrangementSchedule = termArrangementSchedule,
                                AdhocPaymentInstruction = paymentInstruction,
                                Amount = amountToDistributeTermSchedule
                            };
                            _adhocPaymentInstructionsTermArrangementScheduleRepository.Create(adhocPaymentInstructionsTermArrangementSchedule);

                            unDistributedPaymentInstructionAmount -= amountToDistributeTermSchedule;

                            if (unDistributedPaymentInstructionAmount <= 0)
                            {
                                //no more money to distibute to targeted term schedules
                                break;
                            }

                        }
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    //udpate debit order mandate documents keys
                    await _documentIndexService.UpdateDocumentKeys(Common.Enums.DocumentSystemNameEnum.BillingManager, "tempAdhocPaymentInstructionId", collection.TempDocumentKeyValue, "adhocPaymentInstructionId", $"{paymentInstruction.AdhocPaymentInstructionId.ToString()}");

                    //add audit note
                    var text = $"Adhoc Debit order collection instructions captured. Amount:{collection.Amount}, Date to Pay: {collection.DateToPay} ";
                    var note = new BillingNote
                    {
                        ItemId = collection.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.Collection.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);

                    return paymentInstruction.AdhocPaymentInstructionId;
                }
            }


            catch (Exception ex)
            {
                ex.LogException($"Error creating adhoc collection - Error Message {ex.Message} - Stack Trace {ex.StackTrace}");
                return await Task.FromResult(0);
            }

        }

        public async Task ProcessDebitOrderCollectionResponse(Contracts.Integration.Hyphen.HyphenFACSResponse bankResponse)
        {
            if (bankResponse != null)
            {
                int requistionNumber = 0;
                string requistionNumberString = "";
                if (int.TryParse(bankResponse.RequisitionNumber, out requistionNumber) == false)
                {
                    return;
                }

                requistionNumberString = requistionNumber.ToString("000000000");

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var facResult = await _facsResultRepository.Where(d => d.RequisitionNumber == requistionNumberString && d.IsActive && !d.IsDeleted)
                     .FirstOrDefaultAsync();

                    if (facResult == null) { return; }

                    var actionDate = DateTime.Parse(bankResponse?.ActionDate);
                    var amount = decimal.Parse(bankResponse.TransactionAmount, CultureInfo.InvariantCulture);
                    var entities = await _collectionRepository
                        .Where(c => (DateTime)c.EffectiveDate == actionDate
                        && c.SubmittedClientAccount == bankResponse.BankAccountNumber && c.Amount == amount && c.CollectionsId == facResult.CollectionId)
                        .ToListAsync();
                    if (entities.Count > 0)
                    {
                        if (entities.Count == 1)
                        {
                            var collection = entities.First();
                            if (collection != null)
                            {
                                var valid = false;
                                var bankingDetails = new RolePlayerBankingDetail();
                                if (collection.RolePlayerBankingId.HasValue && collection.RolePlayerBankingId.Value > 0 && collection.CollectionsDebtorBankAccountSource == CollectionsDebtorBankAccountSourceEnum.ClientRoleplayerBanking)
                                {
                                    var rolePlayerBankingDetail = await _rolePlayerService.GetBankDetailByBankAccountId((int)collection.RolePlayerBankingId);
                                    bankingDetails.AccountNumber = rolePlayerBankingDetail.AccountNumber.Trim();
                                    bankingDetails.BankBranchId = rolePlayerBankingDetail.BankBranchId;
                                    bankingDetails.BankAccountType = rolePlayerBankingDetail.BankAccountType;
                                    bankingDetails.BranchCode = rolePlayerBankingDetail.BranchCode.Trim();
                                    bankingDetails.BankBranchName = rolePlayerBankingDetail.BankBranchName;
                                }

                                if (collection.TermArrangementScheduleId.HasValue && collection.CollectionsDebtorBankAccountSource == CollectionsDebtorBankAccountSourceEnum.BillingTermDebitOrderBanking)
                                {
                                    var termsBankingDetail = await _termsArrangementService.GetTermsDebitOrderDetailsByTermSchedule(collection.TermArrangementScheduleId.Value);
                                    bankingDetails = await _rolePlayerService.GetBankDetailByBankAccountId((int)termsBankingDetail.RolePlayerBankingId);
                                }

                                if (bankResponse.BankAccountNumber.TrimStart('0') == bankingDetails.AccountNumber.Trim().TrimStart('0')
                                    && bankResponse.BranchCode == bankingDetails.BranchCode.Trim()
                                    && Convert.ToInt32(bankResponse.AccountType) == BankFacsUtils.ConvertToHyphenBankAccount(bankingDetails.BankAccountType)
                                    && bankResponse.TransactionType == bankResponse.TransactionType)
                                    valid = bankResponse.DocumentType == bankResponse.DocumentType;

                                if (valid)
                                {
                                    if (!string.IsNullOrEmpty(bankResponse.ErrorCode))
                                    {
                                        collection.ErrorCode = bankResponse.ErrorCode;
                                        collection.ErrorDescription =
                                            FACSErrorCodes.GetResponseErrorDescription(collection.ErrorCode);
                                        collection.CollectionStatus = CollectionStatusEnum.Rejected;
                                        collection.CanResubmit = false;
                                        collection.RejectionDate = DateTimeHelper.SaNow;

                                        await _collectionRepository.LoadAsync(collection, x => x.Invoice);
                                        if (collection.Invoice != null)
                                            collection.Invoice.InvoiceStatus = InvoiceStatusEnum.Unpaid;

                                        if (collection.AdhocPaymentInstructionId.HasValue)
                                        {
                                            await _collectionRepository.LoadAsync(collection, c => c.AdhocPaymentInstruction);
                                            collection.AdhocPaymentInstruction.AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Unpaid;
                                            collection.AdhocPaymentInstruction.ErrorDescription = collection.ErrorDescription;
                                        }
                                    }
                                    else
                                    {
                                        collection.ErrorCode = string.Empty;
                                        collection.ErrorDescription = string.Empty;
                                        collection.CollectionConfirmationDate = DateTimeHelper.SaNow;
                                        collection.CollectionStatus = CollectionStatusEnum.Collected;
                                        collection.RejectionDate = null;
                                    }

                                    _collectionRepository.Update(collection);
                                }
                            }
                            await scope.SaveChangesAsync();
                        }
                        else
                        {
                            return;
                        }
                    }
                }
            }
        }

        public async Task<string> GetCollectionDebtorBankAccount(Collection collection)
        {
            Contract.Requires(collection != null);
            if (collection.RolePlayerBankingId.HasValue && collection.CollectionsDebtorBankAccountSource == CollectionsDebtorBankAccountSourceEnum.ClientRoleplayerBanking)
            {
                var rolePlayerBankingDetail = await _rolePlayerService.GetBankDetailByBankAccountId(collection.RolePlayerBankingId.Value);
                return rolePlayerBankingDetail.AccountNumber.Trim();
            }

            if (collection.TermArrangementScheduleId.HasValue && collection.CollectionsDebtorBankAccountSource == CollectionsDebtorBankAccountSourceEnum.BillingTermDebitOrderBanking)
            {
                var termsBankingDetail = await _termsArrangementService.GetTermsDebitOrderDetailsByTermSchedule(collection.TermArrangementScheduleId.Value);
                var rolePlayerBankingDetail = await _rolePlayerService.GetBankDetailByBankAccountId(termsBankingDetail.RolePlayerBankingId.Value);
                return rolePlayerBankingDetail.AccountNumber.Trim();
            }

            return await Task.FromResult(string.Empty);
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

        private async Task<bool> PostItemToGeneralLedger(int roleplayerId, int itemId, decimal amount, int bankAccountId, string incomeStatementChart, string balanceSheetChart, bool isAllocated, IndustryClassEnum industryClass, int? contraTransactionId)
        {
            await _abilityTransactionsAuditService.PostItemToGeneralLedger(roleplayerId, itemId, amount, bankAccountId, incomeStatementChart, balanceSheetChart, isAllocated, industryClass, contraTransactionId);
            return await Task.FromResult(true);
        }

        private async Task<billing_SuspenseDebtorBankMapping> GetSuspenseAccountDebtorDetailsByBankAccount(string bankAccountNumber)
        {
            var bankAccount = await _bankAccountService.GetBankAccountByStringAccountNumber(bankAccountNumber);
            var suspenseAccountDebtor = await _suspenseDebtorBankMappingRepository.FirstOrDefaultAsync(c => c.BankAccountId == bankAccount.Id);
            return suspenseAccountDebtor;
        }

        public async Task<int> AddUnallocatedItem(billing_UnallocatedPayment unallocatedPayment)
        {
            Contract.Requires(unallocatedPayment != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                unallocatedPayment.PeriodId = await GetPeriodIdBasedOnOpenPeriod();
                _unallocatedPaymentRepository.Create(unallocatedPayment);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                if (unallocatedPayment != null)
                    return unallocatedPayment.UnallocatedPaymentId;

                return await Task.FromResult(0);
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

        private async Task<FinPayee> GetDebtorByBankStatementReference(string statementReference)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResults = await _collectionRepository.SqlQueryAsync<FinPayee>(
                    DatabaseConstants.SearchForDebtorByBankStatementReference,
                    new SqlParameter("statementReference", statementReference));
                if (searchResults.Count > 0)
                {
                    return searchResults[0];
                }

                return null;
            }
        }

        public async Task DoExternalLifeCollectionReconcilations()
        {
            try
            {
                List<finance_BankStatementEntry> bankStatementEntries;
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    int processingCount = await GetExternalDebitOrderProcessingCount();
                    var bankTransactionTypes = new[]
                    {
                        BankTransactionTypeEnum.RMA02, BankTransactionTypeEnum.RMA05, BankTransactionTypeEnum.RMA03,
                        BankTransactionTypeEnum.RMA06, BankTransactionTypeEnum.RMA20
                    };
                    var funeralBankTransactionTypes = bankTransactionTypes
                        .Select(e => e.GetType()
                            .GetField(e.ToString())
                            .GetCustomAttributes(typeof(DisplayAttribute), false)
                            .Cast<DisplayAttribute>()
                            .FirstOrDefault()?.Name ?? e.ToString())
                        .ToArray();

                    bankStatementEntries = await _facsStatementRepository
                        .Where(b => !b.Proccessed && b.DocumentType.Trim() == debitOrderDocumentType &&
                                    b.ClaimCheckReference.HasValue && b.RecordId == validRecordId
                                    && funeralBankTransactionTypes.Contains(b.TransactionType))
                        .OrderBy(d => d.CreatedDate)
                        .Take(processingCount)
                        .ToListAsync();
                }

                foreach (var bankStatementEntry in bankStatementEntries)
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var bankStatementEntryToProcess = await _facsStatementRepository
                            .Where(d => !d.Proccessed && d.BankStatementEntryId == bankStatementEntry.BankStatementEntryId)
                            .FirstOrDefaultAsync();
                        await ProcessExternalLifeDebitOrder(bankStatementEntryToProcess);
                        await scope.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException("Error during External Life Collection Reconcilations");
            }
        }

        private async Task<int> GetExternalDebitOrderProcessingCount()
        {
            var countSetting = await _configurationService.GetModuleSetting(SystemSettings.BankStatementProcessingCount);
            return int.TryParse(countSetting, out var count) ? count : 20;
        }

        private async Task ProcessExternalLifeDebitOrder(finance_BankStatementEntry bankStatementEntry)
        {
            try
            {
                decimal amount = bankStatementEntry.NettAmount.HasValue ? bankStatementEntry.NettAmount.Value / 100.0M : 0.00M;

                var requisitionNumber = !string.IsNullOrEmpty(bankStatementEntry.RequisitionNumber) ? bankStatementEntry.RequisitionNumber.PadLeft(9, '0') : string.Empty;
                var bankAccountNumber = !string.IsNullOrEmpty(bankStatementEntry.BankAccountNumber) ? bankStatementEntry.BankAccountNumber.TrimStart('0') : string.Empty;

                var result = await _facsResultRepository
                    .Where(d => d.RequisitionNumber == requisitionNumber
                                && d.IsActive
                                && d.TransactionType == bankStatementEntry.TransactionType
                                && d.DocumentType == bankStatementEntry.DocumentType
                                && d.BankAccountNumber == bankAccountNumber)
                    .FirstOrDefaultAsync();

                if (result == null)
                {                    
                    var debtor = await GetDebtorByBankStatementReference(bankStatementEntry.UserReference2);

                    if(debtor == null)
                    {
                        debtor = await GetDebtorByBankStatementReference(bankStatementEntry.Code2);
                    }

                    if (debtor != null)
                    {
                        if (bankStatementEntry.DebitCredit == "-")
                        {
                            await CreatePaymentReversalTransaction(bankStatementEntry, debtor, amount);
                        }
                        else
                        {
                            await ProcessLifeDebitOrder(bankStatementEntry, debtor, amount);
                        }
                    }
                    else
                    {
                        await CreateUnallocatedPayment(bankStatementEntry, amount);
                    }

                    bankStatementEntry.Proccessed = true;
                    _facsStatementRepository.Update(bankStatementEntry);
                }
            }
            catch(Exception ex)
            {
                ex.LogException($"Error during ProcessExternalLifeDebitOrder:{ex.Message}");
            }
        }

        private async Task CreatePaymentReversalTransaction(finance_BankStatementEntry entity, FinPayee debtor, decimal amount)
        {
            var transaction = new billing_Transaction
            {
                Amount = amount,
                BankReference = entity.UserReference2,
                TransactionDate = DateTimeHelper.SaNow,
                TransactionType = TransactionTypeEnum.PaymentReversal,
                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                BankStatementEntryId = entity.BankStatementEntryId,
                RmaReference = GenerateStatementReference(entity),
                RolePlayerId = debtor.RolePlayerId,
            };
            int periodId = 0;
            var latestPeriod = await _periodService.GetLatestPeriod();
            if (latestPeriod != null)
                periodId = latestPeriod.Id;
            else
            {
                var currentPeriod = await _periodService.GetCurrentPeriod();
                if (currentPeriod != null)
                    periodId = currentPeriod.Id;
            }
            transaction.PeriodId = periodId;

            _transactionRepository.Create(transaction);
        }

        private async Task ProcessLifeDebitOrder(finance_BankStatementEntry bankStatementEntry, FinPayee debtor, decimal amount)
        {
            var industry = debtor.IndustryId > 0 ? await _industryService.GetIndustry(debtor.IndustryId) : null;

            if (industry != null)
            {
                var transaction = new billing_Transaction
                {
                    Amount = amount,
                    BankReference = string.Empty,
                    InvoiceId = null,
                    TransactionDate = DateTimeHelper.SaNow,
                    TransactionType = TransactionTypeEnum.Payment,
                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                    BankStatementEntryId = bankStatementEntry.BankStatementEntryId,
                    RmaReference = GenerateStatementReference(bankStatementEntry),
                    RolePlayerId = debtor.RolePlayerId
                };

                var invoicesSearch = await GetInvoicesByBankReferenceAsync(bankStatementEntry.UserReference2);                
                
                await AllocatePaymentToLifeInvoices(bankStatementEntry, industry, invoicesSearch, amount, transaction);                

                int periodId = 0;
                var latestPeriod = await _periodService.GetLatestPeriod();
                if (latestPeriod != null)
                    periodId = latestPeriod.Id;
                else
                {
                    var currentPeriod = await _periodService.GetCurrentPeriod();
                    if (currentPeriod != null)
                        periodId = currentPeriod.Id;
                }
                transaction.PeriodId = periodId;

                _transactionRepository.Create(transaction);
            }
            else
            {
                await CreateUnallocatedPayment(bankStatementEntry, amount);
            }
        }

        private async Task AllocatePaymentToLifeInvoices(finance_BankStatementEntry bankStatement, Industry industry, List<InvoiceSearchByBankRefResult> invoices, decimal amount, billing_Transaction transaction)
        {            
            decimal totalOutstanding = 0;            
            
            totalOutstanding = invoices.Sum(s => s.TotalInvoiceAmount);
            
            // Rule 1: If payment zeroes out or overpays, allocate to all invoices
            if (amount >= totalOutstanding)
            {
                foreach (var invoice in invoices)
                {
                    await AllocatePaymentToLifeInvoice(bankStatement.BankAccountNumber, industry, invoice, amount, transaction);
                    amount -= invoice.TotalInvoiceAmount;
                }
            }
            else
            {
                // Rule 2: Match DO StatementDate with InvoiceDate and DO amount with Invoice amount
                var invoiceInSameMonth =
                invoices.Where(inv => inv.InvoiceDate.Year == bankStatement.StatementDate.Value.Year
                && inv.InvoiceDate.Month == bankStatement.StatementDate.Value.Month
                && inv.TotalInvoiceAmount == amount).ToList();

                if (invoiceInSameMonth != null && invoiceInSameMonth.Count == 1)
                {                    
                    
                    await AllocatePaymentToLifeInvoice(bankStatement.BankAccountNumber, industry, invoiceInSameMonth.FirstOrDefault(), amount, transaction);                    
                }
                else
                {
                    // Rule 3: Match payment amount to one invoice
                    var matchingInvoice = invoices.Where(inv => inv.TotalInvoiceAmount == amount).ToList();
                    if (matchingInvoice != null && matchingInvoice.Count == 1)
                    {
                        await AllocatePaymentToLifeInvoice(bankStatement.BankAccountNumber, industry, matchingInvoice.First(), amount, transaction);
                    }
                }
            }
        }

        private async Task AllocatePaymentToLifeInvoice(string bankAccountNumber, Industry industry, InvoiceSearchByBankRefResult invoiceEntity, decimal amount, billing_Transaction transaction)
        {
            var billingInvoice = await _invoiceRepository.FindByIdAsync(invoiceEntity.InvoiceId);
            await _invoiceRepository.LoadAsync(billingInvoice, x => x.Policy);

            var product = await _productOptionService.GetProductByProductOptionId(billingInvoice.Policy.ProductOptionId);

            var productBankAccount = product.ProductBankAccounts.FirstOrDefault(p => p.IndustryClass == industry.IndustryClass);
            if (productBankAccount != null)
            {
                var bankAccount = await _bankAccountService.GetBankAccountByAccountNumber(productBankAccount.BankAccountId);

                var productBankAccountNumber = bankAccount.AccountNumber;

                productBankAccountNumber = productBankAccountNumber.PadLeft(16, '0').Trim();

                if (bankAccountNumber.Trim() == productBankAccountNumber)
                {
                    var invoice = Mapper.Map<Invoice>(billingInvoice);
                    var invoiceBalance = invoice.Balance;

                    billingInvoice.InvoiceStatus = amount < invoiceBalance
                        ? InvoiceStatusEnum.Partially
                        : InvoiceStatusEnum.Paid;

                   
                    transaction.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                    {
                        InvoiceId = invoiceEntity.InvoiceId,
                        Amount = amount < invoiceBalance ? amount : invoiceBalance
                    });

                    if (invoice.InvoiceStatus == InvoiceStatusEnum.Paid)
                    {
                        switch (billingInvoice.Policy.PolicyStatus)
                        {
                            case PolicyStatusEnum.PendingFirstPremium:
                                billingInvoice.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                break;
                        }
                    }
                    
                    _invoiceRepository.Update(billingInvoice);

                    if (billingInvoice.Policy.CommissionPercentage > 0 ||
                        billingInvoice.Policy.AdminPercentage > 0)
                    {
                        var commissionAllocations = new List<CommissionInvoicePaymentAllocation>
                        {
                            new CommissionInvoicePaymentAllocation()
                            {
                                InvoiceId = invoiceEntity.InvoiceId,
                                Amount = invoiceEntity.TotalInvoiceAmount,
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                IsProcessed = false,
                                IsDeleted = false,
                                CreatedBy = "autoallocation",
                                CreatedDate = DateTimeHelper.SaNow,
                                ModifiedBy = "autoallocation",
                                ModifiedDate = DateTimeHelper.SaNow
                            }
                        };

                        await ProcessCommissionAllocations(commissionAllocations);
                    }
                }
            }
        }

        private async Task<List<InvoiceSearchByBankRefResult>> GetInvoicesByBankReferenceAsync(string reference)
        {
            return await _invoiceRepository.SqlQueryAsync<InvoiceSearchByBankRefResult>(
                DatabaseConstants.SearchForInvoiceByBankStatementReference,
                new SqlParameter("StatementReference", reference));
        }

        private async Task CreateUnallocatedPayment(finance_BankStatementEntry entity, decimal amount)
        {
            var unallocatedPayment = new billing_UnallocatedPayment
            {
                AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                UnallocatedAmount = entity.DebitCredit == "-" ? decimal.Negate(amount) : amount,
                BankStatementEntryId = entity.BankStatementEntryId
            };
            _unallocatedPaymentRepository.Create(unallocatedPayment);
        }

        private string GenerateStatementReference(finance_BankStatementEntry entity)
        {
            return $"{entity.StatementNumber}/{entity.StatementLineNumber} {entity.StatementDate?.ToString("dd/MM/yyyy")}";
        }

        private async Task ProcessCommissionAllocations(List<CommissionInvoicePaymentAllocation> commissionAllocations)
        {
            if (commissionAllocations.Count > 0)
            {
                try
                {
                    await _commissionService.AddCommissions(commissionAllocations);
                }
                catch (Exception ex)
                {
                    ex.LogException("Error adding commission allocations");
                }
            }
        }

        private async Task AllocateReceipt(finance_BankStatementEntry entity, List<billing_Invoice> debtorInvoices)
        {
            decimal receiptAmount = entity.Amount;
            decimal totalOutstanding = debtorInvoices.Sum(inv => inv.TotalInvoiceAmount);

            // 1. Zero or Credit Balance Rule: Allocate to all invoices
            if (receiptAmount >= totalOutstanding)
            {
                foreach (var invoice in debtorInvoices)
                {
                    await AllocateToInvoice(entity, invoice, invoice.TotalInvoiceAmount);
                }
                return;
            }

            // 2. Exact Period Match Rule: Allocate to a single invoice in the same period
            var matchingInvoice = debtorInvoices
                .FirstOrDefault(inv => inv.TotalInvoiceAmount == receiptAmount && inv.CollectionDate.Month == entity.StatementDate?.Month);

            if (matchingInvoice != null)
            {
                await AllocateToInvoice(entity, matchingInvoice, receiptAmount);
                return;
            }

            // 3. Multiple Invoice Match Rule: Allocate at debtor level
            var matchingInvoices = debtorInvoices.Where(inv => inv.TotalInvoiceAmount == receiptAmount).ToList();

            if (matchingInvoices.Count > 1)
            {
                await AllocateToDebtor(entity, receiptAmount);
                return;
            }

            // 4. No Match Rule: Allocate to debtor level
            await AllocateToDebtor(entity, receiptAmount);
        }

        // Allocate amount to an invoice
        private async Task AllocateToInvoice(finance_BankStatementEntry entity, billing_Invoice invoice, decimal amount)
        {
            invoice.TotalInvoiceAmount -= amount; // Deduct allocated amount
            entity.Proccessed = true;
            _invoiceRepository.Update(invoice);

            var transaction = new billing_Transaction
            {
                Amount = amount,
                TransactionDate = DateTimeHelper.SaNow,
                TransactionType = TransactionTypeEnum.Payment,
                BankStatementEntryId = entity.BankStatementEntryId,
                InvoiceId = invoice.InvoiceId,
                RolePlayerId = 0, //To-Do
                IsLogged = false
            };

            await _transactionService.AddTransaction(Mapper.Map<Transaction>(transaction));
        }

        // Allocate amount at debtor level
        private async Task AllocateToDebtor(finance_BankStatementEntry entity, decimal amount)
        {
            entity.Proccessed = true;
            _facsStatementRepository.Update(entity);

            var debtorTransaction = new billing_Transaction
            {
                Amount = amount,
                TransactionDate = DateTimeHelper.SaNow,
                TransactionType = TransactionTypeEnum.Payment,
                BankStatementEntryId = entity.BankStatementEntryId,
                RolePlayerId = 0, //To-Do
                IsLogged = true
            };

            await _transactionService.AddTransaction(Mapper.Map<Transaction>(debtorTransaction));
        }


    }
}


