using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Entities.Commissions;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.FinCare.Contracts.Interfaces.Commissions;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using securityManagerContractsEntities = RMA.Service.Admin.SecurityManager.Contracts.Entities;
using Transaction = RMA.Service.Billing.Contracts.Entities.Transaction;

namespace RMA.Service.Billing.Services
{
    public class InterBankTransferFacade : RemotingStatelessService, IInterBankTransferService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const string BillingIdt = "IDT";
        private const string fnbUniversalBranch = "250655";
        private const string rmaInterBankPayee = "RMA Interbank";
        private const string rmaBank = "FNB";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_RmaBankAccount> _rmaBankAccountRepository;
        private readonly IRepository<billing_Transaction> _transactionsRepository;
        private readonly IRepository<billing_InterBankTransfer> _transferRepository;
        private readonly IRepository<billing_UnallocatedPayment> _unallocatedPaymentRepository;
        private readonly IRepository<billing_InterDebtorTransfer> _interDebtorTransferRepository;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IRepository<billing_InterBankTransferDetail> _transferDetailsRepository;
        private readonly IIndustryService _industryService;
        private readonly IProductService _productService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IBankAccountService _bankAccountService;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializerService;
        private readonly IProductOptionService _productOptionService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IConfigurationService _configurationService;
        private readonly IPeriodService _periodService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly ICommissionService _commissionService;
        private readonly IPaymentCreatorService _paymentCreatorService;
        private readonly IClaimRecoveryInvoiceService _claimRecoveryInvoiceService;
        private readonly IInvoiceService _invoiceService;
        private readonly IRepository<billing_ClaimRecoveryInvoice> _claimRecoveryInvoiceRepository;
        private readonly IBillingService _billingService;
        private readonly IUserReminderService _userReminderService;
        private readonly IUserService _userService;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly IRepository<billing_CompanyBranchBankAccount> _companyBranchBankAccountRepository;
        private readonly ISendEmailService _sendEmailService;
        private string fromAddress;

        public InterBankTransferFacade(StatelessServiceContext context,
            IRepository<billing_RmaBankAccount> rmaBankAccountRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<billing_InterBankTransfer> transferRepository,
            IRepository<billing_Transaction> transactionsRepository,
            IRepository<billing_UnallocatedPayment> unallocatedPaymentRepository,
            IRepository<billing_InterDebtorTransfer> interDebtorTransferRepository,
            IWizardService wizardService,
            IIndustryService industryService,
            IProductService productService,
            IRolePlayerService rolePlayerService,
            IBankAccountService bankAccountService,
            ISerializerService serializerService,
            IProductOptionService productOptionService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IConfigurationService configurationService,
            IPeriodService periodService,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<billing_Invoice> invoiceRepository,
            ICommissionService commissionService,
            IClaimRecoveryInvoiceService claimRecoveryInvoiceService,
            IInvoiceService invoiceService,
            IRepository<billing_ClaimRecoveryInvoice> claimRecoveryInvoiceRepository,
            IBillingService billingService,
            IPaymentCreatorService paymentCreatorService,
            IUserReminderService userReminderService,
            IUserService userService,
            IRepository<billing_Transaction> transactionRepository,
            IRepository<billing_InterBankTransferDetail> transferDetailsRepository,
            IRepository<billing_CompanyBranchBankAccount> companyBranchBankAccountRepository,
            ISendEmailService sendEmailService
            ) : base(context)
        {
            _rmaBankAccountRepository = rmaBankAccountRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _transferRepository = transferRepository;
            _transactionsRepository = transactionsRepository;
            _unallocatedPaymentRepository = unallocatedPaymentRepository;
            _interDebtorTransferRepository = interDebtorTransferRepository;
            _wizardService = wizardService;
            _rolePlayerService = rolePlayerService;
            _productService = productService;
            _industryService = industryService;
            _bankAccountService = bankAccountService;
            _serializerService = serializerService;
            _productOptionService = productOptionService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _configurationService = configurationService;
            _periodService = periodService;
            _documentGeneratorService = documentGeneratorService;
            _invoiceRepository = invoiceRepository;
            _commissionService = commissionService;
            _claimRecoveryInvoiceService = claimRecoveryInvoiceService;
            _invoiceService = invoiceService;
            _claimRecoveryInvoiceRepository = claimRecoveryInvoiceRepository;
            _billingService = billingService;
            _paymentCreatorService = paymentCreatorService;
            _userReminderService = userReminderService;
            _userService = userService;
            _transactionRepository = transactionRepository;
            _transferDetailsRepository = transferDetailsRepository;
            _companyBranchBankAccountRepository = companyBranchBankAccountRepository;
            Task.Run(this.SetupPolicyCommunicationVariables).Wait();
            _sendEmailService = sendEmailService;
        }

        private async Task SetupPolicyCommunicationVariables()
        {
            fromAddress = await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
        }

        public async Task<List<RmaBankAccount>> GetRmaBankAccounts()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankAccounts = await _rmaBankAccountRepository.ToListAsync();
                return Mapper.Map<List<RmaBankAccount>>(bankAccounts);
            }
        }

        public async Task<List<CompanyBranchBankAccount>> GetCompanyBranchBankAccounts()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankAccounts = await _companyBranchBankAccountRepository.ToListAsync();
                return Mapper.Map<List<CompanyBranchBankAccount>>(bankAccounts);
            }
        }

        public async Task<RmaBankAccount> GetRmaBankAccount(int rmaBankAccountId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankAccount = await _rmaBankAccountRepository.FindByIdAsync(rmaBankAccountId);
                return Mapper.Map<RmaBankAccount>(bankAccount);
            }
        }

        public async Task<RmaBankAccount> AddRmaBankAccount(RmaBankAccount rmaBankAccount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddRMABankAccount);

            Contract.Requires(rmaBankAccount != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var mapped = Mapper.Map<billing_RmaBankAccount>(rmaBankAccount);

                _rmaBankAccountRepository.Create(mapped);
                await scope.SaveChangesAsync();
                return rmaBankAccount;
            }
        }

        public async Task<RmaBankAccount> EditRmaBankAccount(RmaBankAccount rmaBankAccount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditRMABankAccount);

            Contract.Requires(rmaBankAccount != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var mapped = Mapper.Map<billing_RmaBankAccount>(rmaBankAccount);

                _rmaBankAccountRepository.Update(mapped);
                await scope.SaveChangesAsync();
                return rmaBankAccount;
            }
        }

        public async Task<RmaBankAccountTransaction> GetTransactionByBank(RmaBankAccount rmaBankAccount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewRMABankAccountTransactions);

            Contract.Requires(rmaBankAccount != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactionsMapped = new RmaBankAccountTransaction
                {
                    Transactions = new List<UnallocatedBankImport>(),
                    AccountNumber = rmaBankAccount.AccountNumber,
                    Description = rmaBankAccount.Description,
                    Product = rmaBankAccount.Product,
                    RmaBankAccountId = rmaBankAccount.RmaBankAccountId
                };
                var searchResults = await _transactionsRepository.SqlQueryAsync<UnallocatedBankImport>(DatabaseConstants.GetTransactionsByBank,
                        new SqlParameter("AccountNumber", rmaBankAccount.AccountNumber), new SqlParameter("SearchFilter", rmaBankAccount.SearchFilter));
                if (searchResults != null && searchResults.Count > 0)
                    transactionsMapped.Transactions.AddRange(searchResults);

                return transactionsMapped;
            }
        }

        public async Task<int> InitiateTransferToBank(InterBankTransfer interBankTransfer, int wizardId)
        {
            if (interBankTransfer == null)
            {
                return 0;
            }

            RmaIdentity.DemandPermission(Permissions.ApproveinterbanktransferWizard);
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {

                    var wizard = await _wizardService.GetWizard(wizardId);
                    //get interbanks that will no hit the bank
                    var nonBankRelatedTransfers = interBankTransfer.InterBankTransferDetails.Where(i => i.BankStatementEntryId == null && i.TransactionId.HasValue).ToList();
                    if (nonBankRelatedTransfers.Count > 0)
                    {
                        var toRoleplayerId = interBankTransfer.ToRolePlayerId.HasValue && interBankTransfer.ToRolePlayerId.Value > 0 ? interBankTransfer.ToRolePlayerId.Value : interBankTransfer.FromRolePlayerId.Value;//self transfer (eg vaps to coid) > from and to are the same
                        await CreateTransferTransactions(nonBankRelatedTransfers, interBankTransfer.FromRolePlayerId.Value, toRoleplayerId, interBankTransfer.FromAccountNumber, interBankTransfer.ToAccountNumber);
                    }

                    //get interbanks that will hit the bank
                    var bankRelatedTransfers = interBankTransfer.InterBankTransferDetails.Where(i => i.BankStatementEntryId.HasValue).ToList();
                    if (bankRelatedTransfers.Count > 0)
                    {
                        var transfer = new billing_InterBankTransfer
                        {
                            FromRmaBankAccountId = interBankTransfer.FromRmaBankAccountId,
                            ToRmaBankAccountId = interBankTransfer.ToRmaBankAccountId,
                            FromTransactionId = interBankTransfer.FromTransactionId,
                            AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                            TransferAmount = interBankTransfer.TransferAmount,
                            ReceiverDebtorNumber = interBankTransfer.ReceiverDebtorNumber,
                            TransactionType = interBankTransfer.TransactionType,
                            FromTransactionReference = interBankTransfer.FromTransactionReference,
                            CreatedBy = wizard.CreatedBy,
                            CreatedDate = DateTimeHelper.SaNow,
                            ModifiedBy = wizard.CreatedBy,
                            ModifiedDate = DateTimeHelper.SaNow,
                            FromRolePlayerId = interBankTransfer.FromRolePlayerId,
                            ToRolePlayerId = interBankTransfer.ToRolePlayerId,
                        };
                        var amount = 0m;
                        if (bankRelatedTransfers != null)
                        {
                            foreach (var item in bankRelatedTransfers)
                            {
                                item.CreatedBy = wizard.CreatedBy;
                                item.ModifiedBy = wizard.ModifiedBy;
                                item.CreatedDate = DateTimeHelper.SaNow;
                                item.ModifiedDate = DateTimeHelper.SaNow;
                            }
                            var interBankTransferDetails = Mapper.Map<List<billing_InterBankTransferDetail>>(bankRelatedTransfers);
                            transfer.InterBankTransferDetails = interBankTransferDetails;
                            amount = bankRelatedTransfers.Sum(x => x.Amount);
                        }

                        var text = $"Transfer of ({interBankTransfer.TransferAmount}) from ({interBankTransfer.FromAccountNumber}) to ({interBankTransfer.ToAccountNumber}) for the amount of {interBankTransfer.TransferAmount} queued for bank submission";
                        var toRoleplayer = await _rolePlayerService.GetFinPayeeByFinpayeNumber(interBankTransfer.ReceiverDebtorNumber);
                        if (toRoleplayer != null)
                        {
                            var note = new BillingNote
                            {
                                ItemId = toRoleplayer.RolePlayerId,
                                ItemType = BillingNoteTypeEnum.InterBankTransfer.GetDescription().SplitCamelCaseText(),
                                Text = text
                            };
                            await _billingService.AddBillingNote(note);
                        }


                        _transferRepository.Create(transfer, true);
                        await scope.SaveChangesAsync();

                        var interbankTransfer = Mapper.Map<InterBankTransfer>(transfer);
                        var bankAccounts = await _rmaBankAccountRepository.ToListAsync();

                        if (interbankTransfer != null)
                        {
                            var fromAccount = bankAccounts.FirstOrDefault(c => c.RmaBankAccountId == interBankTransfer.FromRmaBankAccountId);
                            interbankTransfer.FromAccountNumber = fromAccount?.AccountNumber;

                            var toAccount = bankAccounts.FirstOrDefault(c => c.RmaBankAccountId == interBankTransfer.ToRmaBankAccountId);
                            interbankTransfer.ToAccountNumber = toAccount?.AccountNumber;
                        }

                        interbankTransfer.TransferAmount = amount;
                        await QueueInterbankOnPaymentPool(interbankTransfer, $"{toRoleplayer.FinPayeNumber} -o:t {transfer.InterBankTransferId}");
                        await SendQueuedNotification(transfer.InterBankTransferId, text, interbankTransfer);
                    }
                }
                return await Task.FromResult(0);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured when creating interbank transfer notification for wizardId - {wizardId} - {ex.Message}");
                throw;
            }
        }

        public async Task<bool> CompleteTransferToBank(int interBankTransferId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessBankTransfer);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var interbank = await _transferRepository.FindByIdAsync(interBankTransferId);

                interbank.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;

                if (interbank.InterDebtorTransferId.HasValue)
                {
                    await _transferRepository.LoadAsync(interbank, i => i.InterDebtorTransfer);
                    if (interbank.InterDebtorTransfer != null)
                    {
                        interbank.InterDebtorTransfer.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;
                    }
                }

                var text = $"transfer of ({interbank.TransferAmount}) with bank reference ({interbank.FromTransactionReference}) notification acknowledged";
                var toRoleplayer = await _rolePlayerService.GetFinPayeeByFinpayeNumber(interbank.ReceiverDebtorNumber);
                if (toRoleplayer != null)
                {
                    var note = new BillingNote
                    {
                        ItemId = toRoleplayer.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.InterBankTransfer.GetDescription().SplitCamelCaseText(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }

                var originalTransaction = await _transactionsRepository.FirstOrDefaultAsync(c => c.TransactionId == interbank.FromTransactionId);
                if (originalTransaction != null)
                {
                    var fromRoleplayer = await _rolePlayerService.GetFinPayeeByRolePlayerId(originalTransaction.RolePlayerId);

                    var note = new BillingNote
                    {
                        ItemId = originalTransaction.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.InterBankTransfer.GetDescription().SplitCamelCaseText(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }

                _transferRepository.Update(interbank);
                await scope.SaveChangesAsync();

                var transfer = Mapper.Map<InterBankTransfer>(interbank);

                await QueueInterbankOnPaymentPool(transfer, toRoleplayer.FinPayeNumber);

                return true;
            }
        }

        public async Task<List<InterBankTransfer>> GetAllBankTransfers()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTransfer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var interBanks = await _transferRepository.ToListAsync();
                return Mapper.Map<List<InterBankTransfer>>(interBanks);
            }
        }

        public async Task<InterBankTransfer> GetTransfer(string statementReference)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTransfer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var interBankTransfer = await _transferRepository.OrderByDescending(x => x.CreatedDate)
                    .FirstOrDefaultAsync(x => statementReference.Contains(x.ReceiverDebtorNumber) && x.AllocationProgressStatus != AllocationProgressStatusEnum.Allocated);
                if (interBankTransfer != null)
                {
                    return Mapper.Map<InterBankTransfer>(interBankTransfer);
                }
                else
                {
                    return null;
                }
            }
        }

        public async Task MarkTransferAsAllocated(int interBankTransferId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditTransfer);

            billing_InterBankTransfer interBankTransfer;
            var approveWizard = false;

            using (var scope = _dbContextScopeFactory.Create())
            {
                interBankTransfer = await _transferRepository.SingleOrDefaultAsync(x => x.InterBankTransferId == interBankTransferId);
                if (interBankTransfer != null)
                {
                    if (interBankTransfer.AllocationProgressStatus != AllocationProgressStatusEnum.Allocated)
                    {
                        approveWizard = true;
                        interBankTransfer.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;
                        if (interBankTransfer.InterDebtorTransferId.HasValue)
                        {
                            await _transferRepository.LoadAsync(interBankTransfer, i => i.InterDebtorTransfer);
                            if (interBankTransfer.InterDebtorTransfer != null)
                            {
                                interBankTransfer.InterDebtorTransfer.AllocationProgressStatus =
                                    AllocationProgressStatusEnum.Allocated;
                            }
                        }

                        _transferRepository.Update(interBankTransfer);
                        await scope.SaveChangesAsync();
                    }
                    if (approveWizard)
                    {
                        try
                        {
                            const int interbankCompletedWizardConfigId = 40;
                            var wizard = await _wizardService.GetWizardByLinkedItemAndConfigId(interBankTransfer.InterBankTransferId, interbankCompletedWizardConfigId);
                            if (wizard != null)
                            {
                                await _wizardService.BackgroundProcessApproveWizard(wizard.Id, false);
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.LogException();
                        }
                    }
                }
            }
        }

        public async Task<List<RmaBankAccount>> GetDebtorBankAccounts(string debtorNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTransfer);

            var results = new List<RmaBankAccount>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var debtor = await _rolePlayerService.GetFinPayeeByFinpayeNumber(debtorNumber);
                if (debtor != null)
                {
                    var debtorPolicies = await _rolePlayerPolicyService.GetPoliciesByPolicyPayeeIdNoRefData(debtor.RolePlayerId);
                    var industry = await _industryService.GetIndustry(debtor.IndustryId);
                    var productBankAccounts = new List<ClientCare.Contracts.Entities.Product.ProductBankAccount>();
                    foreach (var policy in debtorPolicies.Where(c => c.ParentPolicyId == null))
                    {
                        var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                        var bankAccounts = await _productService.GetProductBankAccountsByProductId(product.Id);

                        var productBankAccount = bankAccounts.Where(c => c.IndustryClass == industry.IndustryClass).FirstOrDefault();
                        if (productBankAccount != null)
                            productBankAccounts.Add(productBankAccount);
                    }
                    foreach (var productBankAccount in productBankAccounts)
                    {
                        var bankAccount = await _bankAccountService.GetBankAccountByAccountNumber(
                            productBankAccount.BankAccountId);
                        var rmaBankAccount = await _rmaBankAccountRepository
                            .Where(b => b.AccountNumber == bankAccount.AccountNumber).FirstOrDefaultAsync();
                        if (rmaBankAccount != null && results.All(b => b.AccountNumber != rmaBankAccount.AccountNumber))
                        {
                            results.Add(Mapper.Map<RmaBankAccount>(rmaBankAccount));
                        }
                    }

                    return results;
                }
                else
                {
                    return results;
                }
            }
        }

        public async Task TransferPremiumPayableFromClaim(int policyId, decimal premiumPayable,
            string claimsBankAccountNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessBankTransfer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);

                var debtor = await _rolePlayerService.GetFinPayee(policy.PolicyOwnerId);

                var industry = await _industryService.GetIndustry(debtor.IndustryId);

                var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                var productBankAccount =
                    product.ProductBankAccounts.FirstOrDefault(p =>
                        p.IndustryClass == industry.IndustryClass);
                if (productBankAccount != null)
                {
                    var accountDetail = await _bankAccountService.GetBankAccountByAccountNumber(
                        productBankAccount.BankAccountId);
                    var toRmaBankAccount = await _rmaBankAccountRepository
                        .Where(b => b.AccountNumber == accountDetail.AccountNumber).SingleOrDefaultAsync();
                    var fromRmaBankAccount = await _rmaBankAccountRepository
                        .Where(b => b.AccountNumber == claimsBankAccountNumber).SingleOrDefaultAsync();
                    if (toRmaBankAccount != null && fromRmaBankAccount != null)
                    {
                        var interBankTransfer = new InterBankTransfer
                        {
                            ToRmaBankAccountId = toRmaBankAccount.RmaBankAccountId,
                            ToAccountNumber = toRmaBankAccount.AccountNumber,
                            TransferAmount = premiumPayable,
                            AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated,
                            ReceiverDebtorNumber = debtor.FinPayeNumber,
                            FromRmaBankAccountId = fromRmaBankAccount.RmaBankAccountId,
                            FromAccountNumber = claimsBankAccountNumber,
                            IsInitiatedByClaimPayment = true
                        };

                        await CreateInterBankTransferWizard(interBankTransfer);
                    }
                }
            }
        }

        public async Task CreateInterBankTransferWizard(InterBankTransfer interBankTransfer)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddTransfer);

            Contract.Requires(interBankTransfer != null);

            var startWizardRequest = new StartWizardRequest
            {
                Type = "inter-bank-transfer",
                LinkedItemId = -1,
                Data = _serializerService.Serialize(interBankTransfer)
            };

            if (interBankTransfer.IsInitiatedByClaimPayment)
            {
                // Lets insert the supermagic claim here so we can force creation of interbank transfer wizard for claims
                RemotingContext.SetData($"{RemotingContext.Keys.Count() + 1}_permission", "SuperMagicSecretClaim");
            }

            await _wizardService.StartWizard(startWizardRequest);
        }

        private async Task CreateInterBankTransferCompleteNotification(InterBankTransfer interBankTransfer, int wizardId)
        {
            if (interBankTransfer != null)
            {
                var toEntity = await _rmaBankAccountRepository.FirstOrDefaultAsync(b =>
                    b.RmaBankAccountId == interBankTransfer.ToRmaBankAccountId);
                var fromEntity = await _rmaBankAccountRepository.FirstOrDefaultAsync(b =>
                    b.RmaBankAccountId == interBankTransfer.FromRmaBankAccountId);
                if (toEntity == null || fromEntity == null) return;
                var interbankTransferDescription =
                    $"{string.Format("{0:0.00}", interBankTransfer.TransferAmount)} transferred from: {fromEntity.AccountNumber} to: {toEntity.AccountNumber}";

                var actionLink = await _configurationService.GetModuleSetting(SystemSettings.InterBankTransferActionLink);
                actionLink += wizardId;

                var notification = new Notification
                {
                    Title = interbankTransferDescription,
                    Message = "Interbank transfer has been completed",
                    HasBeenReadAndUnderstood = false,
                    ActionLink = actionLink
                };

                var startWizardRequest = new StartWizardRequest
                {
                    Type = "inter-bank-complete-notification",
                    LinkedItemId = interBankTransfer.InterBankTransferId,
                    Data = _serializerService.Serialize(notification)
                };

                await _wizardService.StartWizard(startWizardRequest);
            }
        }

        private async Task<DateTime> DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum periodStatus)
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
        private async Task<string> GenerateRmaReference()
        {
            var transactionPrev = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
            return $"{BillingIdt}{DateTime.Now.ToString("yyyyMMdd")}0{transactionPrev}";
        }

        private async Task AllocateDebitTransaction(Transaction debitTransaction, int rolePlayerId, decimal amountToAllocate, int? linkedTransactionId)
        {
            if (debitTransaction == null)
            {
                throw new BusinessException("AllocateDebitTransaction Error: debitTransaction is null or empty");
            }

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            if (amountToAllocate <= 0)
            {
                throw new TechnicalException(
                    $"AllocateDebitTransaction Error: Debit allocation for debtor with id: {rolePlayerId} failed. Amount must be greater than zero");
            }

            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                var transactionEntity = Mapper.Map<billing_Transaction>(debitTransaction);
                transactionEntity.LinkedTransactionId = linkedTransactionId;
                transactionEntity.RolePlayerId = rolePlayerId;
                transactionEntity.Amount = amountToAllocate;
                transactionEntity.InvoiceId = null;
                transactionEntity.Balance = debitTransaction.Balance;

                var linkedTransactionEntity = await _transactionsRepository.Where(t => t.TransactionId == linkedTransactionId).SingleOrDefaultAsync();
                if (amountToAllocate == linkedTransactionEntity?.Amount)
                {
                    await _transactionsRepository.LoadAsync(linkedTransactionEntity, t => t.InvoiceAllocations_TransactionId);
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
                        }
                    }

                    _transactionsRepository.Update(linkedTransactionEntity);
                }

                _transactionsRepository.Create(transactionEntity);

                if (commissionAllocations.Count > 0)
                {
                    await _commissionService.AddCommissions(commissionAllocations);
                }

                await scope.SaveChangesAsync();
            }
        }

        public async Task AllocateCreditTransaction(Transaction creditTransaction, int rolePlayerId, decimal amountToAllocate, int? invoiceId, int? claimRecoveryInvoiceId)
        {
            Contract.Requires(creditTransaction != null);
            if (amountToAllocate <= 0)
            {
                throw new TechnicalException(
                    $"AllocateCreditTransaction Error: Credit allocation for debtor with id: {rolePlayerId} failed. Amount must be greater than zero");
            }

            if (!invoiceId.HasValue && !claimRecoveryInvoiceId.HasValue)
            {
                await AllocateCreditTransactionToDebtor(creditTransaction, rolePlayerId, amountToAllocate);
            }
        }

        private async Task AllocateCreditTransactionToDebtor(Transaction transaction, int rolePlayerId, decimal amountToAllocate)
        {
            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                transaction.RolePlayerId = rolePlayerId;
                transaction.Amount = amountToAllocate;
                var transactionEntity = Mapper.Map<billing_Transaction>(transaction);
                transactionEntity.InvoiceId = null;
                transactionEntity.ClaimRecoveryInvoiceId = null;

                if (transactionEntity.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment)
                {
                    var unsettledInvoices = await _invoiceService.GetUnsettledInvoices(rolePlayerId, null);

                    if (unsettledInvoices.Count == 1)
                    {
                        var allocationAmount = amountToAllocate < unsettledInvoices[0].Balance
                            ? amountToAllocate
                            : unsettledInvoices[0].Balance;

                        transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                        {
                            InvoiceId = unsettledInvoices[0].InvoiceId,
                            Amount = allocationAmount,
                            BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation
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
                    var unsettledInvoices = await _claimRecoveryInvoiceService.GetUnsettledInvoices(rolePlayerId);

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

                _transactionsRepository.Create(transactionEntity);

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

        public async Task<int> TransferFromBankToBank(Payment payment)
        {
            Contract.Requires(payment != null);

            payment.PaymentMethod = PaymentMethodEnum.EFT;
            payment.IsReversed = false;
            payment.ClaimInvoiceId = null;
            payment.MedicalInvoiceId = null;
            return await _paymentCreatorService.CreatePaymentWithAllocations(payment);
        }
        public async Task<bool> QueueInterbankOnPaymentPool(InterBankTransfer interBankTransfer, string toRoleplayerReference)
        {
            Contract.Requires(interBankTransfer != null);
            try
            {
                var bankAccounts = await _rmaBankAccountRepository.ToListAsync();
                var fromAccountNumber = string.Empty;
                var toAccountNumber = string.Empty;

                var fromAccount = bankAccounts.FirstOrDefault(c => c.RmaBankAccountId == interBankTransfer.FromRmaBankAccountId);
                fromAccountNumber = fromAccount?.AccountNumber;

                var toAccount = bankAccounts.FirstOrDefault(c => c.RmaBankAccountId == interBankTransfer.ToRmaBankAccountId);
                toAccountNumber = toAccount?.AccountNumber;
                var accountDestription = !string.IsNullOrEmpty(toAccount?.Description) ? $"{toAccount?.Product} {toAccount?.Description}" : string.Empty;

                var BranchCompanyMap = MapCompanyAndProduct(accountDestription);

                var payment = new Payment()
                {
                    Company = BranchCompanyMap.Company.ToString(),
                    Branch = BranchCompanyMap.Branch.ToString(),
                    SenderAccountNo = fromAccountNumber,
                    SubmissionCount = 1,
                    MaxSubmissionCount = 10,
                    PaymentStatus = PaymentStatusEnum.Pending
                };

                payment.Product = BranchCompanyMap.Product;
                payment.AccountNo = toAccountNumber;
                payment.Bank = rmaBank;
                payment.ClientType = ClientTypeEnum.Company;
                payment.BankAccountType = BankAccountTypeEnum.CurrentAccount;
                payment.BankBranch = fnbUniversalBranch;
                payment.IdNumber = string.Empty;
                payment.EmailAddress = string.Empty;
                payment.Payee = rmaInterBankPayee;
                payment.Reference = toRoleplayerReference;
                payment.Amount = (decimal)interBankTransfer.TransferAmount;
                payment.IsDebtorCheck = false;
                payment.IsForex = false;
                payment.PaymentType = PaymentTypeEnum.InterBankTransfer;
                payment.IsReversed = false;

                var results = await _paymentCreatorService.Create(payment);
                if (results > 1)
                    return true;
                return false;
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured when queueing interbank transfer to payment pool - {ex.Message}");
                return false;
            }
        }

        private BranchCompanyMap MapCompanyAndProduct(string accountDescription)
        {
            var branchCompanyMap = new BranchCompanyMap { Company = 3, Branch = 1, Product = "FUN" };
            if (accountDescription.IndexOf("coid", StringComparison.InvariantCultureIgnoreCase) > -1 && accountDescription.IndexOf("metal", StringComparison.InvariantCultureIgnoreCase) > -1)
            {
                branchCompanyMap = new BranchCompanyMap { Company = 1, Branch = 2, Product = "EMP" };
            }
            else if (accountDescription.IndexOf("coid", StringComparison.InvariantCultureIgnoreCase) > -1 && accountDescription.IndexOf("mining", StringComparison.InvariantCultureIgnoreCase) > -1)
            {
                branchCompanyMap = new BranchCompanyMap { Company = 1, Branch = 1, Product = "EMP" };
            }
            return branchCompanyMap;
        }

        private async Task SendQueuedNotification(int itemId, string transferText, InterBankTransfer interBankTransfer)
        {
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var userReminders = new List<UserReminder>();
                    var audience = new List<securityManagerContractsEntities.User>();

                    var authoriserRoleId = await _configurationService.GetModuleSetting(SystemSettings.InterbankAuthorizerRoleId);
                    var implementerRoleId = await _configurationService.GetModuleSetting(SystemSettings.BankandCashSpecialistRoleId);

                    var authorisers = String.IsNullOrEmpty(authoriserRoleId) ? new List<securityManagerContractsEntities.User>() : await _userService.GetUsersInRoles(new List<int> { int.Parse(authoriserRoleId) });
                    var implementers = String.IsNullOrEmpty(implementerRoleId) ? new List<securityManagerContractsEntities.User>() : await _userService.GetUsersInRoles(new List<int> { int.Parse(implementerRoleId) });

                    audience.AddRange(authorisers);
                    audience.AddRange(implementers);

                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.InterBankTransferQueuedEmailNotification);

                    emailBody = emailBody.Replace("{0}", interBankTransfer.TransferAmount.ToString("C2", CultureInfo.GetCultureInfo("en-ZA"))).
                        Replace("{1}", interBankTransfer.FromAccountNumber).
                        Replace("{2}", interBankTransfer.ToAccountNumber).
                        Replace("{3}", interBankTransfer.TransferAmount.ToString("C2", CultureInfo.GetCultureInfo("en-ZA")));

                    if (authorisers.Count > 0)
                    {
                        foreach (var user in audience)
                        {
                            //Create Reminder Request
                            var userReminder = new UserReminder
                            {
                                ItemId = itemId,
                                UserReminderType = UserReminderTypeEnum.SystemNotification,
                                AssignedToUserId = user.Id,
                                Text = transferText
                            };
                            userReminders.Add(userReminder);

                            //Create SendEmail Request
                            var emailRequest = new SendMailRequest
                            {
                                Recipients = user.Email,
                                Body = emailBody,
                                IsHtml = true,
                                Attachments = null,
                                FromAddress = fromAddress,
                                Subject = $"Interbank Transfer Queued To: {interBankTransfer.ToAccountNumber}",
                            };
                            await _sendEmailService.SendEmail(emailRequest);
                        }
                    }

                    foreach (var userReminder in userReminders)
                    {
                        await _userReminderService.CreateUserReminder(userReminder);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured when creating interbank transfer notification for itemId - {itemId} - {ex.Message}");
            }
        }



        private async Task CreateTransferTransactions(List<InterBankTransferDetail> nonBankRelatedTransfers, int fromRoleplayerId, int toRoleplayerId, string fromAccountNumber, string toAccountNumber)
        {
            try
            {
                int periodId = 0;
                var transactionDate = DateTime.Now.ToSaDateTime();
                var latestPeriod = await _periodService.GetLatestPeriod();
                if (latestPeriod != null)
                    periodId = latestPeriod.Id;
                else
                    periodId = await GetPeriodId(PeriodStatusEnum.Current);
                using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    var bankAccounts = await _rmaBankAccountRepository.ToListAsync();

                    foreach (var transferDetail in nonBankRelatedTransfers)
                    {
                        var debitTransaction = new billing_Transaction()
                        {
                            Amount = transferDetail.Amount,
                            TransactionDate = transactionDate,
                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                            TransactionType = TransactionTypeEnum.Payment,
                            RolePlayerId = fromRoleplayerId,
                            RmaReference = $"{transferDetail.StatementReference} Trf To {toAccountNumber}",
                            PeriodId = periodId,
                            BankReference = fromAccountNumber,//source bank for posting
                            TransactionReason = TransactionReasonEnum.InterbankCreditTransfer
                        };

                        var creditTransaction = new billing_Transaction()
                        {
                            Amount = transferDetail.Amount,
                            TransactionDate = transactionDate,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            TransactionType = TransactionTypeEnum.Payment,
                            RolePlayerId = toRoleplayerId,
                            RmaReference = $"{transferDetail.StatementReference} Trf From {fromAccountNumber}",
                            PeriodId = periodId,
                            BankReference = toAccountNumber,//destination bank for posting
                            TransactionReason = TransactionReasonEnum.InterbankCreditTransfer
                        };
                        var toAccountDescription = bankAccounts.FirstOrDefault(c => c.AccountNumber == toAccountNumber)?.Description;
                        var productCategory = await _billingService.GetProductCategoryByRmaBankAccount(toAccountDescription);

                        if (transferDetail.TransactionId.HasValue)
                        {
                            var transactionId = transferDetail.TransactionId.Value;
                            var allocation = new billing_InvoiceAllocation { InvoiceId = null, TransactionId = debitTransaction.TransactionId, Amount = transferDetail.Amount, TransactionTypeLinkId = (int)TransactionActionType.Debit, BillingAllocationType = BillingAllocationTypeEnum.InterbankCreditReallocation, LinkedTransactionId = transactionId, ProductCategoryType = productCategory };
                            debitTransaction.InvoiceAllocations_TransactionId.Add(allocation);
                        }

                        _transactionRepository.Create(debitTransaction);
                        _transactionRepository.Create(creditTransaction);
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured when creating credit note interbank transfer - {ex.Message}");
                throw;
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


        public async Task<InterBankTransfer> GetInterbankTransferById(int transferId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var interBankTransfer = await _transferRepository
                    .FirstOrDefaultAsync(x => x.InterBankTransferId == transferId);
                if (interBankTransfer != null)
                {
                    return Mapper.Map<InterBankTransfer>(interBankTransfer);
                }
                else
                {
                    return null;
                }
            }
        }


        public async Task<List<InterBankTransferDetail>> GetTransferDetaislByInterbankId(int transferId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var interBankTransferDetails = await _transferDetailsRepository
                    .Where(x => x.InterBankTransferId == transferId).ToListAsync();
                if (interBankTransferDetails.Count > 0)
                {
                    return Mapper.Map<List<InterBankTransferDetail>>(interBankTransferDetails);
                }
                else
                {
                    return null;
                }
            }
        }
    }
}
