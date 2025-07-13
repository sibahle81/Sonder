using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
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
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;

using FinPayee = RMA.Service.Billing.Contracts.Entities.FinPayee;

namespace RMA.Service.Billing.Services
{
    public class TermsArrangementFacade : RemotingStatelessService, ITermsArrangementService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const string WizardType = "terms-arrangements-inadequate-payment";
        private const string MissedPaymentWizardType = "terms-arrangements-missed-payments";
        private const string TwoMissedPaymentstWizardType = "terms-arrangements-two-missed-payments";
        private const string debtorsClerkTeamLeader = "Debtors Clerk Team Leader";
        private const string financeManager = "Finance Manager";
        private const string collectionAgent = "Collection Agent";
        private string fromAddress;
        private string reportServerUrl;
        private WebHeaderCollection _headerCollection;
        private string fincareportServerUrl;
        private const string memoOfAgreementEmailType = "Memorandum Of Understanding";
        private const string termArrangementEmailType = "Term Arrangement";
        private const string coid = "coid";
        private const string emp = "emp";
        private const int termsWizardConfig = 86;

        private readonly IRepository<billing_TermArrangement> _termArrangementRepository;
        private readonly IRepository<billing_TermArrangementSchedule> _termArrangementScheduleRepository;
        private readonly IRepository<billing_TermsArrangementNote> _termsArrangementNoteRepository;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializerService;
        private readonly ILetterOfGoodStandingService _letterOfGoodStandingService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly ISendEmailService _sendEmailService;
        private readonly IRoleService _roleService;
        private readonly IRepository<billing_IndustryFinancialYear> _industryFinancialYearRepository;
        private readonly IIndustryService _industryService;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly IProductService _productService;
        private readonly IProductOptionService _productOptionService;
        private readonly IRepository<billing_TermDebitOrderRolePlayerBankingDetail> _termDebitOrderRolePlayerBankingDetailRepository;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IBillingService _billingService;
        private readonly IBankBranchService _bankBranchService;
        private readonly IRepository<billing_AdhocPaymentInstructionsTermArrangementSchedule> _adhocPaymentInstructionsTermArrangementScheduleRepository;
        private readonly IRepository<billing_TermArrangementProductOption> _termArrangementProductOptionRepository;
        private readonly IRepository<billing_TermScheduleAllocation> _termScheduleAllocationsRepository;
        private readonly IRepository<finance_BankStatementEntry> _bankstatementStatementRepository;

        public TermsArrangementFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService,
            IRepository<billing_TermArrangement> termArrangementRepository,
            IRepository<billing_TermArrangementSchedule> termArrangementScheduleRepository,
            IWizardService wizardService,
            ISerializerService serializerService,
            IRolePlayerService rolePlayerService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            ISendEmailService sendEmailService,
             IRepository<client_FinPayee> finPayeeRepository,
            ILetterOfGoodStandingService letterOfGoodStanding,
            IRoleService roleService,
            IRepository<billing_IndustryFinancialYear> industryFinancialYearRepository,
            IRepository<billing_TermsArrangementNote> termsArrangementNoteRepository,
            IIndustryService industryService,
            IRepository<billing_Transaction> transactionRepository,
            IRepository<billing_Invoice> invoiceRepository,
            IProductService productService,
            IProductOptionService productOptionService,
            IRepository<billing_TermDebitOrderRolePlayerBankingDetail> termDebitOrderRolePlayerBankingDetailRepository,
            IDocumentIndexService documentIndexService,
            IBillingService billingService,
            IBankBranchService bankBranchService,
            IRepository<billing_AdhocPaymentInstructionsTermArrangementSchedule> adhocPaymentInstructionsTermArrangementScheduleRepository,
            IRepository<billing_TermArrangementProductOption> termArrangementProductOptionRepository,
            IRepository<billing_TermScheduleAllocation> termScheduleAllocationsRepository,
            IRepository<finance_BankStatementEntry> bankstatementStatementRepository)
            : base(context)
        {
            _termArrangementRepository = termArrangementRepository;
            _configurationService = configurationService;
            _dbContextScopeFactory = dbContextScopeFactory;
            _wizardService = wizardService;
            _serializerService = serializerService;
            _termArrangementScheduleRepository = termArrangementScheduleRepository;
            _letterOfGoodStandingService = letterOfGoodStanding;
            _rolePlayerService = rolePlayerService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _sendEmailService = sendEmailService;
            _finPayeeRepository = finPayeeRepository;
            _roleService = roleService;
            _headerCollection = null;
            _industryFinancialYearRepository = industryFinancialYearRepository;
            _industryService = industryService;
            _termsArrangementNoteRepository = termsArrangementNoteRepository;
            _transactionRepository = transactionRepository;
            _invoiceRepository = invoiceRepository;
            _productService = productService;
            _productOptionService = productOptionService;
            Task.Run(this.SetupPolicyCommunicationVariables).Wait();
            _termDebitOrderRolePlayerBankingDetailRepository = termDebitOrderRolePlayerBankingDetailRepository;
            _documentIndexService = documentIndexService;
            _billingService = billingService;
            _bankBranchService = bankBranchService;
            _adhocPaymentInstructionsTermArrangementScheduleRepository = adhocPaymentInstructionsTermArrangementScheduleRepository;
            _termArrangementProductOptionRepository = termArrangementProductOptionRepository;
            _termScheduleAllocationsRepository = termScheduleAllocationsRepository;
            _bankstatementStatementRepository = bankstatementStatementRepository;
        }


        private async Task SetupPolicyCommunicationVariables()
        {
            fromAddress = await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            reportServerUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.ClientCare";
            fincareportServerUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";
        }
        public async Task<TermArrangement> GetTermsArrangement(int termsArrangementId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTermsArrangement);

            using (_dbContextScopeFactory.Create())
            {
                var termsArrangement = await _termArrangementRepository
                    .SingleAsync(t => t.TermArrangementId == termsArrangementId,
                        $"Could not find terms arrangement with id {termsArrangementId}");
                await _termArrangementRepository.LoadAsync(termsArrangement, x => x.TermArrangementSchedules);
                await _termArrangementRepository.LoadAsync(termsArrangement, x => x.TermsArrangementNotes);

                return Mapper.Map<TermArrangement>(termsArrangement);
            }
        }

        public async Task ApproveTermsArrangement(TermArrangement termsArrangement, int wizardId)
        {
            List<billing_IndustryFinancialYear> billingCycles = new List<billing_IndustryFinancialYear>();
            ClientCare.Contracts.Entities.RolePlayer.FinPayee roleplayer = new ClientCare.Contracts.Entities.RolePlayer.FinPayee();
            DateTime financialEndYearMonth = new DateTime(1900, 1, 1);

            var industry = new Admin.MasterDataManager.Contracts.Entities.Industry();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (termsArrangement != null && termsArrangement.RolePlayerId.HasValue)
                {
                    roleplayer = await _rolePlayerService.GetFinPayee(termsArrangement.RolePlayerId.Value);
                    industry = await _industryService.GetIndustry(roleplayer.IndustryId);
                    billingCycles = await _industryFinancialYearRepository.Where(i => i.IndustryClass == industry.IndustryClass && !i.IsDeleted && i.IsActive).ToListAsync();
                }
            }
            if (termsArrangement != null)
            {
                bool termTouchesMoreThanOneUnderwritingYear = false;
                var entity = new billing_TermArrangement();
                var balanceSchedules = new List<billing_TermArrangementSchedule>();
                var options = termsArrangement.TermArrangementProductOptions;

                using (var scope = _dbContextScopeFactory.Create())
                {
                    if (termsArrangement.TermMonths == 0)
                    {
                        throw new BusinessException("Terms arrangement months not set.");
                    }

                    if (termsArrangement.TotalAmount <= 0)
                    {
                        throw new BusinessException("Terms arrangement amount invalid.");
                    }

                    if (billingCycles == null || billingCycles.Count == 0)
                    {
                        throw new BusinessException("No financial year set up for industry class");
                    }

                    termsArrangement.StartDate = termsArrangement.StartDate.ToSaDateTime();
                    termsArrangement.EndDate = termsArrangement.StartDate.ToSaDateTime().AddMonths(termsArrangement.TermMonths);
                    termsArrangement.Balance = termsArrangement.TotalAmount;
                    if (termsArrangement.InstallmentDay == 0)
                    {
                        termsArrangement.InstallmentDay = termsArrangement.StartDate.Day;
                    }

                    int financialPeriodEndDayOfMonth = 0;
                    int financialPeriodStartMonth = 0;
                    int financialPeriodEndMonth = 0;
                    int financialPeriodStartDay = 1;

                    if (billingCycles.Count > 0)
                    {
                        if ((billingCycles.LastOrDefault()?.EndMonth).HasValue
                                 && (billingCycles.LastOrDefault()?.EndDay).HasValue
                                 && (billingCycles.FirstOrDefault()?.StartMonth).HasValue
                                 && (billingCycles.FirstOrDefault()?.StartDay).HasValue)
                        {
                            financialPeriodEndMonth = (billingCycles.LastOrDefault()?.EndMonth).Value;
                            financialPeriodEndDayOfMonth = (billingCycles.LastOrDefault()?.EndDay).Value;
                            financialPeriodStartMonth = (billingCycles.FirstOrDefault()?.StartMonth).Value;
                            financialPeriodStartDay = (billingCycles.FirstOrDefault()?.StartDay).Value;
                        }
                        if (financialPeriodEndMonth > 0 && financialPeriodStartMonth > 0)
                        {
                            var activeFinancialYear = billingCycles.LastOrDefault()?.IndustryFinancialYearId;
                            var financialStartYearMonth = new DateTime((billingCycles.FirstOrDefault()?.StartYear).Value, financialPeriodStartMonth, financialPeriodStartDay);
                            financialEndYearMonth = new DateTime((billingCycles.LastOrDefault()?.EndYear).Value, financialPeriodEndMonth, financialPeriodEndDayOfMonth);

                            if (termsArrangement.EndDate > financialEndYearMonth)
                                termTouchesMoreThanOneUnderwritingYear = true;
                        }
                    }

                    if (termsArrangement.TermFlexibleSchedules != null && termsArrangement.TermFlexibleSchedules.Count > 0)
                        entity = await CreateParentArrangementAndFlexibleSchedules(termsArrangement, billingCycles);
                    else
                        entity = await CreateParentArrangementAndSchedules(termsArrangement, billingCycles);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

                using (var scope = _dbContextScopeFactory.Create())
                {

                    if (termsArrangement.TermArrangementSubsidiaries != null && termsArrangement.TermArrangementSubsidiaries.Count > 1 && entity.TermArrangementId > 0)
                        foreach (var termArrangementSubsidiary in termsArrangement.TermArrangementSubsidiaries)
                        {
                            if (termsArrangement.TermFlexibleSchedules != null && termsArrangement.TermFlexibleSchedules.Count > 0)
                                await CreateSubsidiaryArrangementAndFlexibleSchedules(termArrangementSubsidiary, entity.TermArrangementId, termsArrangement, billingCycles, options);
                            else
                                await CreateSubsidiaryArrangementAndSchedules(termArrangementSubsidiary, entity.TermArrangementId, termsArrangement, billingCycles, options);
                        }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                var newTermArrangementId = entity.TermArrangementId;
                var remainingBalance = 0M;
                using (var scope = _dbContextScopeFactory.Create())
                {
                    if (termTouchesMoreThanOneUnderwritingYear && financialEndYearMonth.Year != 1900)
                    {
                        balanceSchedules = await _termArrangementScheduleRepository
                            .Where(s => s.TermArrangementId == entity.TermArrangementId && s.PaymentDate > financialEndYearMonth).ToListAsync();
                        remainingBalance = balanceSchedules.Sum(s => s.Amount);
                        var arrangement = await _termArrangementRepository.FirstOrDefaultAsync(t => t.TermArrangementId == newTermArrangementId);
                        arrangement.BalanceCarriedToNextCycle = remainingBalance;
                        _termArrangementRepository.Update(arrangement);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }
                var text = $"Terms arrangement approved";
                var note = new BillingNote
                {
                    ItemId = roleplayer.RolePlayerId,
                    ItemType = BillingNoteTypeEnum.TermsArrangement.GetDescription(),
                    Text = text
                };
                await _billingService.AddBillingNote(note);

                if (industry.IndustryClass == IndustryClassEnum.Metals)
                {
                    await _billingService.AddBillingInterestIndicator(new InterestIndicator { isActive = true, ChargeInterest = false, RolePlayerId = termsArrangement.RolePlayerId.Value, InterestDateFrom = DateTime.Now, InterestDateTo = termsArrangement.EndDate });
                }

                if (roleplayer != null && roleplayer.RolePlayerId > 0)
                {
                    var contacts = await _rolePlayerService.GetRolePlayerContactDetails(roleplayer.RolePlayerId);

                    if (contacts.LastOrDefault(c => !c.IsDeleted) != null && !string.IsNullOrEmpty(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress) && termsArrangement.SendAgreementToClient)
                    {
                        await SendTermApplicationStatusEmail(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress, entity.TermArrangementId, TermNotificationTypeEnum.Approved, string.Empty);
                        if (termTouchesMoreThanOneUnderwritingYear)
                        {
                            await SendMemoOfAgreementEmailTwoFinancials(entity.TermArrangementId, contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress, remainingBalance, termsArrangement.EndDate.Year, roleplayer.RolePlayerId, termsArrangement.BankAccountId);
                        }
                        else
                            await SendMemoOfAgreementSingleFinancialYearEmail(entity.TermArrangementId, contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress, roleplayer.RolePlayerId, termsArrangement.BankAccountId);
                    }
                    if (contacts.LastOrDefault(c => !c.IsDeleted) != null && !string.IsNullOrEmpty(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress))
                    {
                        var dateTime = DateTime.Now;
                        int daysBeforeMonthendNotice = Int32.Parse(await _configurationService.GetModuleSetting(SystemSettings.TermsDaysBeforeMonthendNotice));
                        var monthEndDate = dateTime.AddDays(daysBeforeMonthendNotice);
                        var differenceBetweenDates = (monthEndDate - DateTime.Now).TotalDays;
                        if (differenceBetweenDates < (daysBeforeMonthendNotice + 1))
                            await NotifyTwoDaysBeforeMonthEnd(dateTime, entity.TermArrangementId, contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress, roleplayer.RolePlayerId);
                    }
                }

                var bankaccountId = termsArrangement.BankAccountId;

                var parameters = string.Empty;
                var reportPath = string.Empty;
                if (termTouchesMoreThanOneUnderwritingYear)
                {
                    var showBalanceMassge = true;
                    if (industry != null && industry.IndustryClass == IndustryClassEnum.Mining)
                        showBalanceMassge = false;

                    parameters = $"&balance={remainingBalance}&year={termsArrangement.EndDate.Year}&termArrangementId={entity.TermArrangementId}&showBalanceMessage={showBalanceMassge}&bankaccountId={bankaccountId}&rs:Command=ClearSession";
                    reportPath = "RMATermsMOATwoPeriods";
                }
                else
                {
                    parameters = $"&balance={0}&year={0}&termArrangementId={entity.TermArrangementId}&showBalanceMessage={false}&bankaccountId={bankaccountId}&rs:Command=ClearSession";
                    reportPath = "RMATermsMOATwoPeriods";
                }

                var docBytes = await GetUriDocumentByteData(new Uri($"{fincareportServerUrl}/{reportPath}{parameters}&rs:Format=PDF"), _headerCollection);

                await UploadSentMOADocument
                (
                  DocumentTypeEnum.TermsArrangementAgreement,
                  "Termarrangement.pdf",
                  new Dictionary<string, string> { { "termArrangementId", entity.TermArrangementId.ToString() } },
                  "application/pdf",
                  DocumentSetEnum.TermsArrangementDocuments,
                  docBytes
                );
                await UpdateSupportingDocumentsIndexing(entity.TermArrangementId, wizardId);
            }
        }

        public async Task<List<TermArrangementSchedule>> GetTermsArrangementsSchedule()
        {

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTermsArrangement);

            using (var scope = _dbContextScopeFactory.Create())
            {
                int balanceAmount = Int32.Parse(await _configurationService.GetModuleSetting(SystemSettings.ThreshHoldAmount));

                var termsArrangementSchedules = await _termArrangementScheduleRepository.Where(x => System.Data.Entity.DbFunctions.DiffDays(x.PaymentDate, DateTime.Now) > 2
                                                                                     && x.Balance > balanceAmount
                                                                                     && x.TermArrangementScheduleStatus == TermArrangementScheduleStatusEnum.PartiallyPaid && x.InadequatePaymentProcessed != true).Take(50).ToListAsync();

                foreach (var termsArrangementSchedule in termsArrangementSchedules)
                {
                    termsArrangementSchedule.InadequatePaymentProcessed = true;
                    _termArrangementScheduleRepository.Update(termsArrangementSchedule);

                }
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<List<TermArrangementSchedule>>(termsArrangementSchedules);
            }
        }

        private async Task<FinPayee> GetFinPayee(int termsArrangementId)
        {

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTermsArrangement);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var finPayee = _finPayeeRepository.Where(_ => _.RolePlayerId == termsArrangementId).FirstOrDefault();
                return Mapper.Map<FinPayee>(finPayee);
            }
        }
        public async Task CreateTermsArrangementsInadequatePaymentWizard()
        {
            try
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                    RmaIdentity.DemandPermission(Permissions.ViewTermsArrangement);

                var termArrangementSchedules = await GetTermsArrangementsSchedule();

                var notificationMessage = await _configurationService.GetModuleSetting(SystemSettings.TermsArrangementsInadequatePaymentNotification);
                var role = await _roleService.GetRoleByName(collectionAgent);

                foreach (TermArrangementSchedule termArrangementSchedule in termArrangementSchedules)
                {
                    var termArrangement = await GetTermsArrangement(termArrangementSchedule.TermArrangementId);

                    var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)termArrangement.RolePlayerId);

                    var policy = await _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData((int)termArrangement.RolePlayerId);

                    var finPayee = await GetFinPayee((int)termArrangement.RolePlayerId);

                    notificationMessage = notificationMessage.Replace("{0}", termArrangementSchedule.Amount.ToString());

                    termArrangementSchedule.PolicyNumber = policy.Select(_ => _.PolicyNumber).FirstOrDefault();
                    termArrangementSchedule.MemberNumber = finPayee.FinPayeNumber;
                    termArrangementSchedule.NotificationMessage = notificationMessage;

                    var data = _serializerService.Serialize(termArrangementSchedule);
                    var wizard = new StartWizardRequest() { Data = data, Type = WizardType, LinkedItemId = termArrangementSchedule.TermArrangementScheduleId, CustomRoutingRoleId = role.Id, LockedToUser = null };
                    await _wizardService.StartWizard(wizard);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Creating Terms Arrangements Inadequate Payment Wizard - Error Message {ex.Message}");
            }
        }

        public async Task ProcessPaidTermAccounts()
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var groupedTermArrangementSchedules = await _termArrangementScheduleRepository.
                       Where(t => t.AllocationDate < DateTime.Now && t.LogProcessed != true && t.TermArrangementScheduleStatus == TermArrangementScheduleStatusEnum.Paid
                       && t.TermArrangement.IsActive && !t.TermArrangement.IsDeleted)
                        .GroupBy(t => t.TermArrangement.RolePlayerId).Take(100).ToListAsync();


                    var coidProductOptionIds = new List<int>();
                    var products = await _productService.GetProducts();
                    var coidProduct = products.FirstOrDefault(c => c.Code.IndexOf(coid, StringComparison.InvariantCultureIgnoreCase) >= 0);
                    if (coidProduct != null)
                    {
                        var coidProductOptions = await _productOptionService.GetProductOptionsByProductId(coidProduct.Id);
                        coidProductOptionIds = coidProductOptions.Where(c => c.Code.IndexOf(emp, StringComparison.InvariantCultureIgnoreCase) >= 0).Select(c => c.Id).ToList();
                    }

                    foreach (var group in groupedTermArrangementSchedules)
                    {
                        var termArrangementSchedules = group.AsEnumerable().OrderBy(s => s.TermArrangementScheduleId);
                        await _termArrangementScheduleRepository.LoadAsync(termArrangementSchedules, i => i.TermArrangement);
                        if (termArrangementSchedules != null && termArrangementSchedules.Any(s => s.TermArrangement.RolePlayerId.HasValue))
                        {
                            var roleplayerId = termArrangementSchedules.FirstOrDefault(t => t.TermArrangement.RolePlayerId.HasValue)?.TermArrangement?.RolePlayerId;
                            var lastScheduleAllocated = termArrangementSchedules.LastOrDefault();
                            if (lastScheduleAllocated != null && roleplayerId.HasValue)
                            {
                                if (coidProductOptionIds.Count > 0)
                                {
                                    var policies = await _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(roleplayerId.Value);
                                    var coidPolicy = policies.FirstOrDefault(c => coidProductOptionIds.Contains(c.ProductOptionId));
                                    var scheduleAgreedUponPaymentDate = lastScheduleAllocated.PaymentDate;
                                    if (scheduleAgreedUponPaymentDate != null && coidPolicy != null)
                                    {
                                        var expirationDate = await CalculateLogExpirationDate(scheduleAgreedUponPaymentDate);
                                        await _letterOfGoodStandingService.GenerateLetterOfGoodStanding(expirationDate, (int)roleplayerId, coidPolicy.PolicyId);

                                        var text = $"letter of good standing expiring {expirationDate.ToString("yyyy-MM-dd")} sent to client";
                                        var note = new BillingNote
                                        {
                                            ItemId = (int)roleplayerId,
                                            ItemType = BillingNoteTypeEnum.LetterOfGoodStanding.GetDescription(),
                                            Text = text
                                        };
                                        await _billingService.AddBillingNote(note);
                                    }
                                }
                            }
                            termArrangementSchedules.ForEach(t => t.LogProcessed = true);
                            _termArrangementScheduleRepository.Update(termArrangementSchedules.ToList());
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Processing Paid Term Accounts - Error Message {ex.Message}");
            }

        }

        public async Task SendEmailNotification(int LinkedItemId)
        {

            var termsArrangementSchedule = await GetTermArrangementSchedule(LinkedItemId);
            var isLiveEnvironmentSettingAsString = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerIsLiveEnvironment);
            var isLiveEnvironment = isLiveEnvironmentSettingAsString.ToBoolean(false);
            var overrideAddress = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerEmailNotificationOverrideAddress);

            if (termsArrangementSchedule != null)
            {
                var termArrangement = await GetTermsArrangement(termsArrangementSchedule.TermArrangementId);

                var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)termArrangement.RolePlayerId);
                var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermsArrangementsInadequatePaymentEmailNotification);
                emailBody = emailBody.Replace("{0}", termsArrangementSchedule.PaymentDate.ToShortDateString()).Replace("{1}", termsArrangementSchedule.Amount.ToString());

                var finPayee = await GetFinPayee((int)termArrangement.RolePlayerId);

                var emailRequest = new SendMailRequest
                {
                    Recipients = isLiveEnvironment ? rolePlayerContacts.Select(_ => _.EmailAddress).FirstOrDefault() : overrideAddress,
                    Body = emailBody,
                    IsHtml = true,
                    Attachments = null,
                    FromAddress = fromAddress,
                    Subject = $"RMA inadequate payment arrangement {finPayee.FinPayeNumber}",
                };

                await _sendEmailService.SendEmail(emailRequest);

                var text = $"Terms inadequate payment notification sent to client";
                var note = new BillingNote
                {
                    ItemId = (int)termArrangement.RolePlayerId,
                    ItemType = BillingNoteTypeEnum.TermInadquatePayment.GetDescription(),
                    Text = text
                };
                await _billingService.AddBillingNote(note);
            }
        }

        private async Task<List<TermArrangementSchedule>> GetTermsArrangementsMissedPayments()
        {

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTermsArrangement);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var termsArrangementSchedules = await _termArrangementScheduleRepository.Where(x => x.TermArrangementScheduleStatus == TermArrangementScheduleStatusEnum.Unpaid
                 && x.MissedPaymentProcessed == false && x.TermArrangement.IsActive && !x.IsDeleted)
                    .Take(50).ToListAsync();

                foreach (var schedule in termsArrangementSchedules)
                {
                    schedule.MissedPaymentProcessed = true;
                    _termArrangementScheduleRepository.Update(schedule);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return Mapper.Map<List<TermArrangementSchedule>>(termsArrangementSchedules);
            }
        }

        public async Task CreateTermsArrangementsMissedPaymentWizard()
        {
            try
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                    RmaIdentity.DemandPermission(Permissions.ViewTermsArrangement);

                var termArrangementSchedules = await GetTermsArrangementsMissedPayments();

                var notificationMessageTemplate = await _configurationService.GetModuleSetting(SystemSettings.TermsArrangementsMissedPaymentNotification);
                var role = await _roleService.GetRoleByName(collectionAgent);

                foreach (var termArrangementSchedule in termArrangementSchedules)
                {
                    var termArrangement = await GetTermsArrangement(termArrangementSchedule.TermArrangementId);

                    var finPayee = await GetFinPayee((int)termArrangement.RolePlayerId);

                    var notificationMessage = notificationMessageTemplate.Replace("{0}", termArrangementSchedule.Amount.ToString());

                    termArrangementSchedule.MemberNumber = finPayee.FinPayeNumber;
                    termArrangementSchedule.NotificationMessage = notificationMessage;

                    var data = _serializerService.Serialize(termArrangementSchedule);
                    var wizard = new StartWizardRequest() { Data = data, Type = MissedPaymentWizardType, LinkedItemId = termArrangementSchedule.TermArrangementScheduleId, CustomRoutingRoleId = role.Id, LockedToUser = null };
                    await _wizardService.StartWizard(wizard);

                    var text = $"Terms missed payment notification sent to client";
                    var note = new BillingNote
                    {
                        ItemId = (int)termArrangement.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.TermMissedPayment.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Creating Terms Arrangements Missed Payment Wizard - Error Message {ex.Message}");
            }
        }

        public async Task<int> AddUnsuccessfulInitiation(UnsuccessfulInitiation item)
        {
            Contract.Requires(item != null);
            if (item?.RoleplayerId > 0)
            {
                var roleplayer = await _rolePlayerService.GetFinPayeeByRolePlayerId(item.RoleplayerId);

                int financialYear = 0;
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var debtor = await _rolePlayerService.GetFinPayee(item.RoleplayerId);
                    var industry = await _industryService.GetIndustry(debtor.IndustryId);
                    if (industry != null)
                    {
                        var financialYears = await _industryFinancialYearRepository.Where(i => i.IndustryClass == industry.IndustryClass && i.IsActive && !i.IsDeleted).ToListAsync();
                        if (financialYears != null && (financialYears.LastOrDefault()?.IndustryFinancialYearId).HasValue)
                            financialYear = (financialYears.LastOrDefault()?.IndustryFinancialYearId).Value;
                    }
                }
                var debtorBalance = await GetDebtorNetBalance(roleplayer.RolePlayerId);
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var termsArrangement = new TermArrangement()
                    {
                        RolePlayerId = item.RoleplayerId,
                        Balance = debtorBalance,
                        TermArrangementStatus = TermArrangementStatusEnum.Unsuccessful,
                        TotalAmount = debtorBalance,
                        StartDate = DateTime.Now,
                        EndDate = DateTime.Now,
                        TermArrangementPaymentFrequency = TermArrangementPaymentFrequencyEnum.Monthly,
                        PaymentMethod = PaymentMethodEnum.EFT
                    };

                    var entity = Mapper.Map<billing_TermArrangement>(termsArrangement);
                    if (financialYear > 0)
                        entity.FinancialYearId = financialYear;
                    await CheckAndClosePreviousFailedInitiation(termsArrangement.RolePlayerId.Value, financialYear);
                    entity.IsActive = true;
                    entity.BankAccountId = null;
                    entity.TermApplicationDeclineReason = TermApplicationDeclineReasonEnum.OutstandingEarnings;
                    _termArrangementRepository.Create(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);


                    if (roleplayer != null && roleplayer.RolePlayerId > 0)
                    {
                        var contacts = await _rolePlayerService.GetRolePlayerContactDetails(roleplayer.RolePlayerId);

                        if (contacts.LastOrDefault(c => !c.IsDeleted) != null && !string.IsNullOrEmpty(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress))
                            await SendTermApplicationStatusEmail(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress, entity.TermArrangementId, TermNotificationTypeEnum.Declined, "because declarations are not up-to-date.");

                        var text = $"Terms unsuccessful application notification sent to client";
                        var note = new BillingNote
                        {
                            ItemId = roleplayer.RolePlayerId,
                            ItemType = BillingNoteTypeEnum.UnsuccessfulTerm.GetDescription(),
                            Text = text
                        };
                        await _billingService.AddBillingNote(note);
                    }
                    return entity.TermArrangementId;
                }
            }
            return await Task.FromResult(0);
        }

        private async Task<DateTime> CalculateLogExpirationDate(DateTime scheduleAgreedUponPaymentDate)
        {
            var expirationDate = scheduleAgreedUponPaymentDate.AddMonths(1);
            return await Task.FromResult(expirationDate);
        }

        private async Task<int> SendMemberLogsEmail(LetterOfGoodStanding letterOfGoodStanding)
        {
            try
            {
                var parameters = $"&RolePlayerId={letterOfGoodStanding.RolePlayerId}&CertificateNumber={letterOfGoodStanding.CertificateNo}&rs:Command=ClearSession";
                var reportPath = "RMAMemberLetterOfGoodStanding";

                var logs = await GetUriDocumentByteData(new Uri($"{reportServerUrl}/{reportPath}{parameters}&rs:Format=PDF"), _headerCollection);

                var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = logs, FileName = "LetterOfGoodStanding.pdf", FileType = "application/pdf"},
            };
                var emailBody = await _configurationService.GetModuleSetting(SystemSettings.LetterOfGoodStanding);

                var emailAddress = letterOfGoodStanding.MemberEmail;
                return await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = letterOfGoodStanding.LetterOfGoodStandingId,
                    ItemType = "LetterOfGoodStanding",
                    FromAddress = fromAddress,
                    Recipients = emailAddress,
                    Subject = $"RMA Letter Of Good Standing",
                    Body = emailBody.Replace("{0}", letterOfGoodStanding.MemberName).Replace("{1}", DateTimeHelper.SaNow.ToString()),
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send Letter Of Good Standing - Cert:{letterOfGoodStanding.CertificateNo} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
            return await Task.FromResult(0);
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        public async Task UpdateTermsArrangementsMissedPaymentsStatus()
        {
            try
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                    RmaIdentity.DemandPermission(Permissions.ViewTermsArrangement);

                var gracePeriod = await _configurationService.GetModuleSetting(SystemSettings.GracePeriod);

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var period = Convert.ToInt32(gracePeriod);

                    var schedules = await _termArrangementScheduleRepository
                        .Where(t => t.TermArrangementScheduleStatus == TermArrangementScheduleStatusEnum.Pending
                        && t.TermArrangement.IsActive && !t.IsDeleted
                        && t.TermArrangement.TermArrangementStatus == TermArrangementStatusEnum.Approved).Take(100)
                        .ToListAsync();


                    foreach (var schedule in schedules)
                    {
                        var termArrangemnt = await _termArrangementRepository
                            .Where(t => t.TermArrangementId == schedule.TermArrangementId)
                            .FirstOrDefaultAsync();

                        var roleplayer = await _rolePlayerService.GetFinPayeeByRolePlayerId((int)termArrangemnt.RolePlayerId);

                        if (termArrangemnt != null)
                        {
                            var paymentDate = schedule.PaymentDate.AddDays(period);

                            if (paymentDate < DateTime.Now)
                            {

                                schedule.TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.Unpaid;
                                roleplayer.DebtorStatus = DebtorStatusEnum.TermsArrangementTermDefault1;

                                if (schedule.TermArrangement.TermArrangementStatus != TermArrangementStatusEnum.TermsDefaulted)
                                    schedule.TermArrangement.TermArrangementStatus = TermArrangementStatusEnum.TermsDefaulted1;
                            }
                            await _rolePlayerService.UpdateFinPayee(roleplayer);
                            _termArrangementScheduleRepository.Update(schedule);
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Updating Terms Arrangements Missed Payments Status - Error Message {ex.Message}");
            }
        }

        public async Task<List<Wizard>> GetTermArrangementstInCompleteApplications()
        {
            var inProgressTermArrangementWizards = await _wizardService.GetWizardsByConfigurationAndStatusAndFromToDate(termsWizardConfig, new List<WizardStatusEnum> { WizardStatusEnum.InProgress, WizardStatusEnum.AwaitingApproval }, DateTime.MinValue, DateTime.MaxValue);
            return inProgressTermArrangementWizards;
        }

        private async Task<List<TermArrangementSchedule>> GetTermArrangementUpcomingCollections(int collectionDueInNumberOfDays, PaymentMethodEnum paymentMethodEnum)
        {
            List<TermArrangementSchedule> upComingCollections = new List<TermArrangementSchedule>(0); ;
            var twoMonthsAgo = DateTime.Now.StartOfTheDay().AddDays(-61);

            var termSchedules = await GetTermArrangementsReadyToCollect(collectionDueInNumberOfDays + 1);

            DateTime collectionDueDate = DateTime.Now.StartOfTheDay().AddDays(collectionDueInNumberOfDays);

            var termSchedulesCollectableOnDueDate = termSchedules.Where(x => x.PaymentDate == collectionDueDate);

            foreach (var termScheduleCollectableOnDueDate in termSchedulesCollectableOnDueDate)
            {
                if (termScheduleCollectableOnDueDate.TermArrangement != null && termScheduleCollectableOnDueDate.TermArrangement.PaymentMethod == paymentMethodEnum)
                {
                    upComingCollections.Add(Mapper.Map<TermArrangementSchedule>(termScheduleCollectableOnDueDate));
                }
            }

            return upComingCollections;
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

        public async Task ProcessTermsArrangementsPaymentsDueSoonReminders()
        {
            try
            {
                var termSchedules = await GetTermArrangementUpcomingCollections(7, PaymentMethodEnum.EFT);

                foreach (var termSchedule in termSchedules)
                {
                    var termArrangement = await GetTermsArrangement(termSchedule.TermArrangementId);
                    await SendTermsPaymentsDueSoonRemindersEmailNotification(termArrangement, termSchedule);

                    var text = $"Term Arrangement Payment Due Soon Reminder notification sent to client";
                    var note = new BillingNote
                    {
                        ItemId = (int)termArrangement.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.TermPaymentsDueSoonReminders.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }

            }
            catch (Exception ex)
            {
                ex.LogException($"Error when processing Terms Arrangement Payments Due Soon reminders- Error Message {ex.Message}");
            }
        }

        public async Task ProcessTermsArrangementsIncompleteApplications()
        {
            try
            {
                var role = await _roleService.GetRoleByName(collectionAgent);
                var inProgressTermArrangementWizards = await GetTermArrangementstInCompleteApplications();
                var notificationFrequency = await _configurationService.GetModuleSetting(SystemSettings.IncompleteApplicationReminderFrequency);
                var maxNoficationDays = await _configurationService.GetModuleSetting(SystemSettings.IncompleteApplicationReminderMaxDays);

                foreach (var termArrangementWizard in inProgressTermArrangementWizards)
                {
                    var stepData = _serializerService.Deserialize<ArrayList>(termArrangementWizard.Data);
                    var termArrangement = _serializerService.Deserialize<TermArrangement>(stepData[0].ToString());
                    termArrangement.CreatedDate = termArrangementWizard.CreatedDate;

                    var totalDays = (DateTime.Now.EndOfTheDay() - termArrangement.CreatedDate.StartOfTheDay()).TotalDays;

                    if (totalDays >= int.Parse(maxNoficationDays))
                    {
                        termArrangementWizard.WizardStatus = WizardStatusEnum.Cancelled;
                        await _wizardService.UpdateWizard(termArrangementWizard);
                        continue;
                    }

                    if (termArrangementWizard.CreatedDate.StartOfTheDay() == DateTime.Now.StartOfTheDay())
                    {
                        continue;
                    }

                    var notificationsDates = GetNotificationsDatesSchedule(termArrangementWizard.CreatedDate, int.Parse(notificationFrequency), int.Parse(maxNoficationDays));

                    if (notificationsDates.Contains(DateTime.Now.StartOfTheDay()))
                    {
                        var finPayee = await GetFinPayee((int)termArrangement.RolePlayerId);
                        await SendInCompleteApplicationsEmailNotification(termArrangement);

                        var text = $"Incomplete Term Arrangement Application notification sent to client";
                        var note = new BillingNote
                        {
                            ItemId = (int)termArrangement.RolePlayerId,
                            ItemType = BillingNoteTypeEnum.TermIncompleteApplication.GetDescription(),
                            Text = text
                        };
                        await _billingService.AddBillingNote(note);
                    }
                }

            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Creating Terms Arrangements Incomplete Applications Wizard - Error Message {ex.Message}");
            }
        }

        private List<DateTime> GetNotificationsDatesSchedule(DateTime createdDate, int frequencyInDays, int maxDays)
        {
            createdDate = createdDate.StartOfTheDay();
            List<DateTime> notificationDates = new List<DateTime>();

            int counter = frequencyInDays;
            while (counter < maxDays)
            {
                notificationDates.Add(createdDate.AddDays(counter));
                counter += frequencyInDays;
            }

            return notificationDates;
        }


        public async Task SendInCompleteApplicationsEmailNotification(TermArrangement termArrangement)
        {
            try
            {
                var isLiveEnvironmentSettingAsString = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerIsLiveEnvironment);
                var isLiveEnvironment = isLiveEnvironmentSettingAsString.ToBoolean(false);
                var overrideAddress = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerEmailNotificationOverrideAddress);

                if (termArrangement != null)
                {
                    var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)termArrangement.RolePlayerId);
                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermsArrangementsIncompleteApplicationsEmailNotification);

                    var finPayee = await GetFinPayee((int)termArrangement.RolePlayerId);

                    var emailRequest = new SendMailRequest
                    {
                        Recipients = isLiveEnvironment ? rolePlayerContacts.Select(_ => _.EmailAddress).FirstOrDefault() : overrideAddress,
                        Body = emailBody,
                        IsHtml = true,
                        Attachments = null,
                        FromAddress = fromAddress,
                        Subject = $"RMA outstanding documents - payment arrangement ({finPayee.FinPayeNumber}) ",
                    };
                    await _sendEmailService.SendEmail(emailRequest);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Sending Incomplete Applications Notification Email - Error Message {ex.Message}");
            }

        }

        public async Task SendTermsPaymentsDueSoonRemindersEmailNotification(TermArrangement termArrangement, TermArrangementSchedule termArrangementSchedule)
        {
            try
            {
                var isLiveEnvironmentSettingAsString = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerIsLiveEnvironment);
                var isLiveEnvironment = isLiveEnvironmentSettingAsString.ToBoolean(false);
                var overrideAddress = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerEmailNotificationOverrideAddress);

                if (termArrangement != null)
                {
                    var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)termArrangement.RolePlayerId);
                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermsArrangementsPaymentsDueSoonRemindersEmailNotification);
                    emailBody = emailBody.Replace("{0}", termArrangement.MemberNumber)
                                .Replace("{1}", termArrangementSchedule?.PaymentDate.ToString("dd-MM-yyyy"))
                                .Replace("{2}", termArrangement.PaymentMethod.GetDescription());

                    var finPayee = await GetFinPayee((int)termArrangement.RolePlayerId);

                    var emailRequest = new SendMailRequest
                    {
                        Recipients = isLiveEnvironment ? rolePlayerContacts.Select(_ => _.EmailAddress).FirstOrDefault() : overrideAddress,
                        Body = emailBody,
                        IsHtml = true,
                        Attachments = null,
                        FromAddress = fromAddress,
                        Subject = $"RMA term arrangement payments due soon reminder {finPayee.FinPayeNumber}",
                    };
                    await _sendEmailService.SendEmail(emailRequest);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Sending Term Arrangement Payments due soon reminder Email - Error Message {ex.Message}");
            }

        }

        public async Task SendMissedPaymentEmailNotification(int LinkedItemId)
        {
            var termsArrangementSchedule = await GetTermArrangementSchedule(LinkedItemId);
            var isLiveEnvironmentSettingAsString = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerIsLiveEnvironment);
            var isLiveEnvironment = isLiveEnvironmentSettingAsString.ToBoolean(false);

            var overrideAddress = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerEmailNotificationOverrideAddress);
            if (termsArrangementSchedule != null)
            {
                var termArrangement = await GetTermsArrangement(termsArrangementSchedule.TermArrangementId);

                var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)termArrangement.RolePlayerId);
                var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermsArrangementsMissedPaymentEmailNotification);
                emailBody = emailBody.Replace("{0}", termsArrangementSchedule.Amount.ToString()).Replace("{1}", termsArrangementSchedule.PaymentDate.ToString("MMMM")).Replace("{2}", termsArrangementSchedule.PaymentDate.ToShortDateString());

                var finPayee = await GetFinPayee((int)termArrangement.RolePlayerId);

                var emailRequest = new SendMailRequest
                {
                    Recipients = isLiveEnvironment ? rolePlayerContacts.Select(_ => _.EmailAddress).FirstOrDefault() : overrideAddress,
                    Body = emailBody,
                    IsHtml = true,
                    Attachments = null,
                    FromAddress = fromAddress,
                    Subject = $"RMA missed payment arrangement {finPayee.FinPayeNumber}",
                };

                await _sendEmailService.SendEmail(emailRequest);
            }
        }

        public async Task UpdateTermsArrangementsInadequatePaymentRole()
        {
            try
            {
                var startDate = DateTime.Now.AddDays(-3);
                var wizardConfigurationId = await _configurationService.GetModuleSetting(SystemSettings.WizardConfigurationId);
                var wizards = await _wizardService.GetWizardByWizardConfigurationIdAndWizardStatus(Int32.Parse(wizardConfigurationId), startDate);

                var role = await _roleService.GetRoleByName(debtorsClerkTeamLeader);

                foreach (var wizard in wizards)
                {
                    wizard.CustomRoutingRoleId = role.Id;
                    await _wizardService.UpdateWizard(wizard);
                }

                startDate = DateTime.Now.AddDays(-6);
                wizards = await _wizardService.GetWizardByWizardConfigurationIdAndWizardStatus(Int32.Parse(wizardConfigurationId), startDate);

                role = await _roleService.GetRoleByName(financeManager);

                foreach (var wizard in wizards)
                {
                    wizard.CustomRoutingRoleId = role.Id;
                    await _wizardService.UpdateWizard(wizard);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Updating Terms Arrangements for Inadequate Payment Role - Error Message {ex.Message}");
            }
        }

        private async Task<TermArrangementSchedule> GetTermArrangementSchedule(int TermArrangementScheduleId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var termsArrangementSchedule = await _termArrangementScheduleRepository.Where(x => x.TermArrangementScheduleId == TermArrangementScheduleId).FirstOrDefaultAsync();
                return Mapper.Map<TermArrangementSchedule>(termsArrangementSchedule);
            }
        }

        public async Task<List<string>> CanAutoApproveTermArrangementApplication(int roleplayerId, TermArrangement termsArrangement)
        {
            int termMonths = 0;
            if (termsArrangement != null)
                termMonths = termsArrangement.TermMonths;
            var termArrangementEndDate = DateTime.Now.ToSaDateTime().AddMonths(termMonths);
            var roleplayer = await _rolePlayerService.GetFinPayee(roleplayerId);
            var industry = await _industryService.GetIndustry(roleplayer.IndustryId);
            var noAutoApproveReasons = new List<string>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var billingCycles = await _industryFinancialYearRepository.Where(i => i.IndustryClass == industry.IndustryClass && i.IsActive && !i.IsDeleted).ToListAsync();

                var termArrangements = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId).ToListAsync();

                int financialPeriodEndDayOfMonth = 0;
                int financialPeriodStartMonth = 0;
                int financialPeriodEndMonth = 0;
                int financialPeriodStartDay = 1;
                if (billingCycles.Count > 0)
                {
                    if ((billingCycles.LastOrDefault()?.EndMonth).HasValue
                             && (billingCycles.LastOrDefault()?.EndDay).HasValue
                             && (billingCycles.FirstOrDefault()?.StartMonth).HasValue
                             && (billingCycles.FirstOrDefault()?.StartDay).HasValue)
                    {
                        financialPeriodEndMonth = (billingCycles.LastOrDefault()?.EndMonth).Value;
                        financialPeriodEndDayOfMonth = (billingCycles.LastOrDefault()?.EndDay).Value;
                        financialPeriodStartMonth = (billingCycles.FirstOrDefault()?.StartMonth).Value;
                        financialPeriodStartDay = (billingCycles.FirstOrDefault()?.StartDay).Value;
                    }
                    if (financialPeriodEndMonth > 0 && financialPeriodStartMonth > 0)
                    {
                        var activeFinancialYear = billingCycles.LastOrDefault()?.IndustryFinancialYearId;
                        var financialStartYearMonth = new DateTime((billingCycles.FirstOrDefault()?.StartYear).Value, financialPeriodStartMonth, financialPeriodStartDay);
                        var financialEndYearMonth = new DateTime((billingCycles.LastOrDefault()?.EndYear).Value, financialPeriodEndMonth, financialPeriodEndDayOfMonth);

                        //Rule3:It must be 1st application within the billing industry financial year               
                        if (termArrangements.Where(t => t.StartDate >= financialStartYearMonth && t.EndDate <= financialEndYearMonth && t.IsActive).ToList().Count > 0)
                            noAutoApproveReasons.Add(TermApplicationDeclineReasonEnum.ExistingTermArrangement.GetDescription());

                        //Rule1:Last instalment date must not exceed financial && should not fall between 2 financial periods                           
                        if (termArrangementEndDate > financialEndYearMonth)
                            noAutoApproveReasons.Add(TermApplicationDeclineReasonEnum.OutsideBillingPeriod.GetDescription());

                        //Rule2:The application should be 2months before the end of the billing cycle
                        if ((financialEndYearMonth - DateTime.Now).TotalDays < 60)
                            noAutoApproveReasons.Add(TermApplicationDeclineReasonEnum.TwoMonthsBeforeTheEndOfTheBillingCycle.GetDescription());

                    }
                    else
                        return noAutoApproveReasons;
                }
                //Rule4:Client has never defaulted on previous terms arrangement 
                if (termArrangements.Where(t => t.TermArrangementStatus == TermArrangementStatusEnum.TermsDefaulted).ToList().Count > 0)
                    noAutoApproveReasons.Add(TermApplicationDeclineReasonEnum.PreviousTermsArrangementDefault.GetDescription());
                if (termsArrangement != null)
                {
                    //Rule5:first payment and last payments must be the biggest
                    if (termsArrangement.TermFlexibleSchedules != null && termsArrangement.TermFlexibleSchedules.Count > 0)
                    {
                        var lastMonth = termsArrangement.TermFlexibleSchedules.LastOrDefault()?.Month;
                        var firstMonth = termsArrangement.TermFlexibleSchedules.FirstOrDefault()?.Month;
                        var topTwoHighestAmounts = termsArrangement.TermFlexibleSchedules
                            .OrderByDescending(c => c.Amount).Take(2).ToList();

                        //if the last or first month is not sitting in index 0 or index of rankedlist then                  
                        if (!topTwoHighestAmounts.Any(s => s.Month == lastMonth))
                            noAutoApproveReasons.Add(TermApplicationDeclineReasonEnum.LastMonthPaymentLowerThanOtherPayments.GetDescription());
                        if (!topTwoHighestAmounts.Any(s => s.Month == firstMonth))
                            noAutoApproveReasons.Add(TermApplicationDeclineReasonEnum.FirstMonthPaymentLowerThanOtherPayments.GetDescription());
                    }

                    //Rule6:there is a more than R100 difference between sheduled payments
                    if (termsArrangement.TermFlexibleSchedules != null && termsArrangement.TermFlexibleSchedules.Count > 0)
                    {
                        int counter = 0;
                        foreach (var flexibleSchedule in termsArrangement.TermFlexibleSchedules.OrderBy(s => s.Month))
                        {
                            if ((counter + 1) < termsArrangement.TermFlexibleSchedules.Count)
                            {
                                var nextScheduleAmount = termsArrangement.TermFlexibleSchedules[counter + 1].Amount;
                                if (flexibleSchedule.Amount - nextScheduleAmount > 100 || nextScheduleAmount - flexibleSchedule.Amount > 100)
                                {
                                    noAutoApproveReasons.Add(TermApplicationDeclineReasonEnum.ScheduleVarianceGreaterthan100.GetDescription());
                                    break;
                                }
                            }
                            counter++;
                        }
                    }
                }
            }
            return noAutoApproveReasons;
        }

        public async Task MissedTwoPayments()
        {
            try
            {
                var role = await _roleService.GetRoleByName(debtorsClerkTeamLeader);
                var unmetTermSchedules = new List<billing_TermArrangementSchedule>();

                var notificationMessageTemplate = await _configurationService.GetModuleSetting(SystemSettings.TermsArrangementTwoMissedPayment);

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var daysOverDue = DateTime.Now.AddDays(-60);
                    var thirtyDaysDue = 30;
                    var groupedOverDueTermArrangementSchedules = await _termArrangementScheduleRepository
                       .Where(t => t.PaymentDate < daysOverDue && t.TermArrangementScheduleStatus == TermArrangementScheduleStatusEnum.Unpaid
                       && t.TermArrangement.IsActive && !t.IsDeleted
                       && t.TermArrangement.TermArrangementStatus != TermArrangementStatusEnum.TermsDefaulted)
                       .GroupBy(t => t.TermArrangementId).Take(100).ToListAsync();

                    foreach (var group in groupedOverDueTermArrangementSchedules)
                    {
                        var termArrangemnt = await _termArrangementRepository
                                .Where(t => t.TermArrangementId == group.Key)
                                .FirstOrDefaultAsync();

                        var entity = await _rolePlayerService.GetFinPayeeByRolePlayerId((int)termArrangemnt.RolePlayerId);

                        if (entity != null)
                        {                           
                            var notificationMessage = notificationMessageTemplate.Replace("{0}", entity.FinPayeNumber);

                            foreach (var termArrangementSchedule in group.AsEnumerable().OrderBy(s => s.PaymentDate))
                            {
                                var paymentDate = termArrangementSchedule.PaymentDate;

                                TimeSpan timeSpan = DateTime.Today - paymentDate;
                                int numberOfDays = timeSpan.Days + 7;

                                if (numberOfDays >= thirtyDaysDue)
                                {
                                    unmetTermSchedules.Add(termArrangementSchedule);

                                }
                            }

                            if (unmetTermSchedules.Count > 1)
                            {
                                TermArrangementSchedule term = new TermArrangementSchedule
                                {
                                    MemberNumber = entity.FinPayeNumber,
                                    NotificationMessage = notificationMessage
                                };

                                var data = _serializerService.Serialize(term);
                                var wizard = new StartWizardRequest() { Data = data, Type = TwoMissedPaymentstWizardType, LinkedItemId = term.TermArrangementScheduleId, CustomRoutingRoleId = role.Id, LockedToUser = null };
                                await _wizardService.StartWizard(wizard);

                                if (termArrangemnt != null)
                                {                                   
                                    termArrangemnt.TermArrangementStatus = TermArrangementStatusEnum.TermsDefaulted;
                                    entity.DebtorStatus = DebtorStatusEnum.TermsArrangementTermDefault;

                                    var industry = new Industry();
                                    using (_dbContextScopeFactory.CreateReadOnly())
                                    {
                                        if (entity.IndustryId > 0)
                                        industry = await _industryService.GetIndustry(entity.IndustryId);
                                    }
                                    if (industry.IndustryClass == IndustryClassEnum.Metals)
                                    await _billingService.AddBillingInterestIndicator(new InterestIndicator { isActive = true, ChargeInterest = true, RolePlayerId = entity.RolePlayerId, InterestDateFrom = DateTime.Now, InterestDateTo = DateTime.MaxValue });                                    
                                }
                            }
                            await _rolePlayerService.UpdateFinPayee(entity);
                            _termArrangementRepository.Update(termArrangemnt);
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when running process for Missed Two Payments - Error Message {ex.Message}");
            }
        }

        public async Task<List<TermArrangementProductOption>> GetActiveTermArrangementsProductOptionsByRolePlayerId(int roleplayerId)
        {
            List<TermArrangementProductOption> termArrangementProductOptions = new List<TermArrangementProductOption>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var termArrangements = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId && t.ParentTermArrangementId == null && t.IsActive == true).OrderByDescending(t => t.CreatedDate).ToListAsync();
                await _termArrangementRepository.LoadAsync(termArrangements, x => x.TermArrangementProductOptions);

                if (termArrangements.Count == 0)
                {
                    return termArrangementProductOptions;
                }

                foreach (var termArrangement in termArrangements)
                {
                    //exclude re assessed terms
                    var linkedTermArrangements = await _termArrangementRepository.Where(x => x.LinkedTermArrangementId == termArrangement.TermArrangementId).ToListAsync();
                    if (linkedTermArrangements.Count > 0)
                    {
                        continue;
                    }

                    decimal totalbalance = 0;
                    var schedules = await _termArrangementScheduleRepository.Where(x => x.TermArrangementId == termArrangement.TermArrangementId && x.IsDeleted == false).ToListAsync();
                    totalbalance = schedules.Select(x => x.Balance).Sum();

                    if (totalbalance > 0)
                    {
                        termArrangementProductOptions.AddRange(Mapper.Map<List<TermArrangementProductOption>>(termArrangement.TermArrangementProductOptions));
                    }

                    foreach (var termArrangementProductOption in termArrangementProductOptions)
                    {
                        termArrangementProductOption.RoleplayerId = roleplayerId;
                    }
                }
                return termArrangementProductOptions;
            }
        }

        public async Task<List<TermArrangement>> GetTermArrangementsByRolePlayerId(int roleplayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var termArrangements = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId && t.ParentTermArrangementId == null).OrderByDescending(t => t.CreatedDate).ToListAsync();
                await _termArrangementRepository.LoadAsync(termArrangements, x => x.TermArrangementSchedules);
                await _termArrangementRepository.LoadAsync(termArrangements, x => x.TermArrangementProductOptions);
                await _termArrangementRepository.LoadAsync(termArrangements, x => x.TermDebitOrderBankingDetails);
                await _termArrangementRepository.LoadAsync(termArrangements, x => x.TermsArrangementNotes);
                await _termArrangementRepository.LoadAsync(termArrangements, x => x.TermArrangementSchedules);
                termArrangements.ForEach(y => _termArrangementScheduleRepository.Load(y.TermArrangementSchedules, x => x.AdhocPaymentInstructionsTermArrangementSchedules));

                return Mapper.Map<List<TermArrangement>>(termArrangements);
            }
        }

        public async Task<PagedRequestResult<TermsArrangementNote>> GetAllTermNotesByTermArrangementId(PagedRequest pagedRequest)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var termsArrangementId = Convert.ToInt32(pagedRequest.SearchCriteria);

                var termsArrangementNotes = await (from termsArrangementNote in _termsArrangementNoteRepository
                                                   where termsArrangementNote.TermArrangementId == termsArrangementId
                                                   select new TermsArrangementNote
                                                   {

                                                       TermArrangementId = termsArrangementNote.TermArrangementId,
                                                       ItemId = termsArrangementNote.ItemId,
                                                       ItemType = termsArrangementNote.ItemType,
                                                       Text = termsArrangementNote.Text,
                                                       IsActive = termsArrangementNote.IsActive,
                                                       IsDeleted = termsArrangementNote.IsDeleted,
                                                       CreatedBy = termsArrangementNote.CreatedBy,
                                                       CreatedDate = termsArrangementNote.CreatedDate,
                                                       ModifiedBy = termsArrangementNote.ModifiedBy,
                                                       ModifiedDate = termsArrangementNote.ModifiedDate

                                                   }).ToPagedResult(pagedRequest);

                return new PagedRequestResult<TermsArrangementNote>
                {
                    Data = termsArrangementNotes.Data,
                    RowCount = termsArrangementNotes.RowCount,
                    Page = termsArrangementNotes.Page,
                    PageSize = termsArrangementNotes.PageSize,
                    PageCount = termsArrangementNotes.PageCount,
                };
            }
        }

        public async Task EditTermArrangementSechedulesCollectionFlags(List<TermArrangementSchedule> termArrangementSchedules)
        {
            Contract.Requires(termArrangementSchedules != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var termArrangementSchedule in termArrangementSchedules)
                {
                    var entity = await _termArrangementScheduleRepository.Where(x => x.TermArrangementScheduleId == termArrangementSchedule.TermArrangementScheduleId).SingleAsync();
                    bool changeDictated = false;
                    if (entity.CollectBalance != termArrangementSchedule.CollectBalance)
                    {
                        changeDictated = true;
                    }

                    if (entity.IsCollectionDisabled != termArrangementSchedule.IsCollectionDisabled)
                    {
                        changeDictated = true;
                    }

                    if (changeDictated)
                    {
                        entity.IsCollectionDisabled = termArrangementSchedule.IsCollectionDisabled;
                        entity.CollectBalance = termArrangementSchedule.CollectBalance;
                        _termArrangementScheduleRepository.Update(entity);
                    }

                }
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task<int> AddTermArrangementNote(TermsArrangementNote note)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_TermsArrangementNote>(note);
                _termsArrangementNoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }

        }

        public async Task AddTermArrangementNotes(TermsArrangementNote note)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {

                var entity = Mapper.Map<billing_TermsArrangementNote>(note);

                _termsArrangementNoteRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

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

        public async Task<int> SendMemoOfAgreementSingleFinancialYearEmail(int termArrangementId, string emailAddress, int roleplayerId, int bankaccountId)
        {
            try
            {
                var debtor = new FinPayee();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _finPayeeRepository.FirstOrDefaultAsync(f => f.RolePlayerId == roleplayerId);
                    debtor = Mapper.Map<FinPayee>(entity);
                }
                if (debtor.RolePlayerId > 0)
                {
                    var parameters = $"&balance={0}&year={0}&termArrangementId={termArrangementId}&showBalanceMessage={false}&bankaccountId={bankaccountId}&rs:Command=ClearSession";
                    var reportPath = "RMATermsMOATwoPeriods";

                    var docBytes = await GetUriDocumentByteData(new Uri($"{fincareportServerUrl}/{reportPath}{parameters}&rs:Format=PDF"), _headerCollection);

                    var attachments = new List<MailAttachment>
                    {
                        new MailAttachment { AttachmentByteData = docBytes, FileName = "Termarrangement.pdf", FileType = "application/pdf"},
                    };
                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermArrangementMOAEmail);

                    return await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = termArrangementId,
                        ItemType = memoOfAgreementEmailType,
                        FromAddress = fromAddress,
                        Recipients = emailAddress,
                        Subject = $"RMA Memorandum Of Understanding",
                        Body = emailBody.Replace("{0}", debtor.FinPayeNumber),
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    });
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send MOA -Id:{termArrangementId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
            return await Task.FromResult(0);
        }

        public async Task RaiseInterestForUnpaidInvoicesForDefaultedTerms()
        {
            try
            {
                using (_dbContextScopeFactory.Create())
                {
                    await _invoiceRepository.ExecuteSqlCommandAsync(DatabaseConstants.RaiseInterestForUnpaidInvoicesForDefaultedTerms);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Raising Interest For Unpaid Invoices For Defaulted Terms - Error Message {ex.Message}");
            }
        }

        private async Task CheckAndClosePreviousArrangement(int roleplayerId, int financialYearPeriodId, int? linkedTermArrangementId, TermArrangement termArrangement)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                //close re-assessed terms
                if (linkedTermArrangementId != null)
                {
                    var arrangements = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId && t.TermArrangementId == linkedTermArrangementId
                    && (t.FinancialYearId == financialYearPeriodId || t.FinancialYearId == null && t.IsActive)).ToListAsync();
                    arrangements.ForEach(arrangement => arrangement.IsActive = false);
                    _termArrangementRepository.Update(arrangements);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                else //close other old terms for same product set
                {
                    var oldArrangements = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId && t.LinkedTermArrangementId == null && t.IsActive).ToListAsync();
                    List<int> oldArrangementsIdsToDisAble = new List<int>();

                    foreach (var oldTerm in oldArrangements)
                    {
                        var oldTermProductOptions = await _termArrangementProductOptionRepository.Where(x => x.TermArrangementId == oldTerm.TermArrangementId).ToListAsync();
                        if (termArrangement.TermArrangementProductOptions.Count == oldTermProductOptions.Count)
                        {
                            var oldTermProductOptionsIds = oldTermProductOptions.OrderBy(x => x.ProductOptionId).Select(x => x.ProductOptionId).ToList();
                            var newTermProductOptionsIds = termArrangement.TermArrangementProductOptions.OrderBy(x => x.ProductOptionId).Select(x => x.ProductOptionId).ToList();
                            var termsHaveSameProductSet = oldTermProductOptionsIds.SequenceEqual(newTermProductOptionsIds);
                            if (termsHaveSameProductSet)
                            {
                                oldArrangementsIdsToDisAble.Add(oldTerm.TermArrangementId);
                            }
                        }
                    }

                    if (oldArrangementsIdsToDisAble.Count > 0)
                    {
                        var oldArrangementsWithSimiliarProductSet = await _termArrangementRepository.Where(t => oldArrangementsIdsToDisAble.Contains(t.TermArrangementId)).ToListAsync();
                        oldArrangementsWithSimiliarProductSet.ForEach(arrangement => arrangement.IsActive = false);
                        _termArrangementRepository.Update(oldArrangementsWithSimiliarProductSet);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }

                }
            }
        }

        private async Task CheckAndClosePreviousFailedInitiation(int roleplayerId, int financialYearPeriodId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var arrangements = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId
                && (t.FinancialYearId == financialYearPeriodId || t.FinancialYearId == null)
                && t.TermArrangementStatus == TermArrangementStatusEnum.Unsuccessful).ToListAsync();
                arrangements.ForEach(arrangement => arrangement.IsActive = false);
                _termArrangementRepository.Update(arrangements);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task CreateSubsidiaryArrangementAndSchedules(TermArrangementSubsidiary termArrangementSubsidiary, int parentArrangementId, TermArrangement termsArrangement, List<billing_IndustryFinancialYear> billingCycles, List<TermArrangementProductOption> options)
        {
            var subTermArrangement = new TermArrangement();
            subTermArrangement.RolePlayerId = termArrangementSubsidiary.RoleplayerId;

            var scheduleInstallment = termArrangementSubsidiary.Balance / termsArrangement.TermMonths;
            subTermArrangement.TermArrangementSchedules = new List<TermArrangementSchedule>();
            subTermArrangement.TermArrangementProductOptions = new List<TermArrangementProductOption>();

            foreach (var productOption in options.Where(c => c.RoleplayerId == (int)subTermArrangement.RolePlayerId))
            {
                subTermArrangement.TermArrangementProductOptions.Add(new TermArrangementProductOption
                { ContractAmount = productOption.ContractAmount, ProductOptionId = productOption.ProductOptionId });
            }

            subTermArrangement.StartDate = termsArrangement.StartDate;
            subTermArrangement.EndDate = termsArrangement.EndDate;
            subTermArrangement.TermArrangementPaymentFrequency = termsArrangement.TermArrangementPaymentFrequency;
            subTermArrangement.PaymentMethod = termsArrangement.PaymentMethod;
            subTermArrangement.TermArrangementStatus = TermArrangementStatusEnum.Approved;
            subTermArrangement.ApprovalDate = termsArrangement.ApprovalDate;
            subTermArrangement.TermMonths = termsArrangement.TermMonths;
            subTermArrangement.BankAccountId = termsArrangement.BankAccountId;

            var entity = Mapper.Map<billing_TermArrangement>(subTermArrangement);

            entity.ParentTermArrangementId = parentArrangementId;
            entity.IsActive = true;
            if (billingCycles.Count > 0 && billingCycles.LastOrDefault() != null)
                entity.FinancialYearId = billingCycles.LastOrDefault()?.IndustryFinancialYearId;

            _termArrangementRepository.Create(entity);

            if (termsArrangement != null && termsArrangement.RolePlayerId.HasValue)
            {
                var finPayee = await _rolePlayerService.GetFinPayeeByRolePlayerId((int)termsArrangement.RolePlayerId);
                finPayee.DebtorStatus = DebtorStatusEnum.TermsArrangement;
                await _rolePlayerService.UpdateFinPayee(finPayee);
            }
        }

        private async Task<billing_TermArrangement> CreateParentArrangementAndSchedules(TermArrangement termsArrangement, List<billing_IndustryFinancialYear> billingCycles)
        {
            var scheduleInstallment = termsArrangement.TotalAmount / termsArrangement.TermMonths;
            termsArrangement.TermArrangementSchedules = new List<TermArrangementSchedule>();
            var scheduleStartDate = GetPaymentScheduleStartDate(termsArrangement.InstallmentDay, termsArrangement.StartDate);
            var total = 0m;
            for (int i = 0; i < termsArrangement.TermMonths; i++)
            {
                var amount = 0m;
                if (i == termsArrangement.TermMonths - 1)
                    amount = Math.Round(termsArrangement.TotalAmount - total, 2);//cater for the extra cents               
                else
                    amount = Math.Round(scheduleInstallment, 2);

                var schedule = new TermArrangementSchedule
                {
                    Amount = amount,
                    TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.Pending,
                    Balance = amount,
                    PaymentDate = scheduleStartDate.AddMonths(i),
                    IsCollectionDisabled = false,
                    CollectBalance = false
                };

                termsArrangement.TermArrangementSchedules.Add(schedule);
                total += amount;
            }

            var options = new List<TermArrangementProductOption>();

            if (termsArrangement.TermArrangementSubsidiaries.Count == 1)
                options = termsArrangement.TermArrangementProductOptions.Where(c => c.RoleplayerId == (int)termsArrangement.RolePlayerId).ToList();

            termsArrangement.TermArrangementProductOptions = options;

            var entity = Mapper.Map<billing_TermArrangement>(termsArrangement);

            if (termsArrangement.RolePlayerBankingId.HasValue && termsArrangement.RolePlayerBankingId.Value > 0)
            {
                var debitOrderBankingDetail = new TermsDebitOrderDetail
                {
                    RolePlayerBankingId = termsArrangement.RolePlayerBankingId,
                    IsActive = true,
                };
                entity.TermDebitOrderRolePlayerBankingDetails.Add(Mapper.Map<billing_TermDebitOrderRolePlayerBankingDetail>(debitOrderBankingDetail));
            }

            entity.IsActive = true;
            if (billingCycles.Count > 0 && billingCycles.LastOrDefault() != null)
                entity.FinancialYearId = billingCycles.LastOrDefault()?.IndustryFinancialYearId;

            entity.ApprovalDate = DateTimeHelper.SaNow;
            entity.TermArrangementStatus = TermArrangementStatusEnum.Approved;
            _termArrangementRepository.Create(entity);

            if (termsArrangement != null && termsArrangement.RolePlayerId.HasValue)
            {
                var finPayee = await _rolePlayerService.GetFinPayeeByRolePlayerId((int)termsArrangement.RolePlayerId);
                finPayee.DebtorStatus = DebtorStatusEnum.TermsArrangement;
                await _rolePlayerService.UpdateFinPayee(finPayee);
            }

            await CheckAndClosePreviousArrangement(termsArrangement.RolePlayerId.Value, (billingCycles.LastOrDefault()?.IndustryFinancialYearId).Value, termsArrangement.LinkedTermArrangementId, termsArrangement);
            return entity;
        }

        private async Task<billing_TermArrangement> CreateParentArrangementAndFlexibleSchedules(TermArrangement termsArrangement, List<billing_IndustryFinancialYear> billingCycles)
        {
            var scheduleStartDate = GetPaymentScheduleStartDate(termsArrangement.InstallmentDay, termsArrangement.StartDate);

            termsArrangement.TermArrangementSchedules = new List<TermArrangementSchedule>();
            int i = 0;
            foreach (var flexibleSchedule in termsArrangement.TermFlexibleSchedules.OrderBy(c => c.Month))
            {
                var schedule = new TermArrangementSchedule
                {
                    Amount = flexibleSchedule.Amount,
                    TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.Pending,
                    Balance = flexibleSchedule.Amount,
                    PaymentDate = scheduleStartDate.AddMonths(i)
                };
                termsArrangement.TermArrangementSchedules.Add(schedule);
                i++;
            }

            var options = new List<TermArrangementProductOption>();
            if (termsArrangement.TermArrangementSubsidiaries.Count == 1)
                options = termsArrangement.TermArrangementProductOptions.Where(c => c.RoleplayerId == (int)termsArrangement.RolePlayerId).ToList();

            termsArrangement.TermArrangementProductOptions = options;

            var entity = Mapper.Map<billing_TermArrangement>(termsArrangement);
            if (termsArrangement.RolePlayerBankingId.HasValue && termsArrangement.RolePlayerBankingId.Value > 0)
            {
                var debitOrderBankingDetail = new TermsDebitOrderDetail
                {
                    RolePlayerBankingId = termsArrangement.RolePlayerBankingId,
                    IsActive = true,
                };
                entity.TermDebitOrderRolePlayerBankingDetails.Add(Mapper.Map<billing_TermDebitOrderRolePlayerBankingDetail>(debitOrderBankingDetail));
            }

            entity.IsActive = true;
            entity.FinancialYearId = billingCycles.LastOrDefault()?.IndustryFinancialYearId;

            entity.ApprovalDate = DateTimeHelper.SaNow;
            entity.TermArrangementStatus = TermArrangementStatusEnum.Approved;

            _termArrangementRepository.Create(entity);

            if (termsArrangement != null && termsArrangement.RolePlayerId.HasValue)
            {
                var finPayee = await _rolePlayerService.GetFinPayeeByRolePlayerId((int)termsArrangement.RolePlayerId);
                finPayee.DebtorStatus = DebtorStatusEnum.TermsArrangement;
                await _rolePlayerService.UpdateFinPayee(finPayee);
            }

            await CheckAndClosePreviousArrangement(termsArrangement.RolePlayerId.Value, (billingCycles.LastOrDefault()?.IndustryFinancialYearId).Value, termsArrangement.LinkedTermArrangementId, termsArrangement);
            return entity;
        }

        private async Task CreateSubsidiaryArrangementAndFlexibleSchedules(TermArrangementSubsidiary termArrangementSubsidiary, int parentArrangementId, TermArrangement termsArrangement, List<billing_IndustryFinancialYear> billingCycles, List<TermArrangementProductOption> options)
        {
            var subTermArrangement = new TermArrangement();
            subTermArrangement.RolePlayerId = termArrangementSubsidiary.RoleplayerId;

            subTermArrangement.TermArrangementSchedules = new List<TermArrangementSchedule>();
            subTermArrangement.TermArrangementProductOptions = new List<TermArrangementProductOption>();

            foreach (var productOption in options.Where(c => c.RoleplayerId == (int)subTermArrangement.RolePlayerId))
            {
                subTermArrangement.TermArrangementProductOptions.Add(new TermArrangementProductOption
                { ContractAmount = productOption.ContractAmount, ProductOptionId = productOption.ProductOptionId });
            }

            subTermArrangement.StartDate = termsArrangement.StartDate;
            subTermArrangement.EndDate = termsArrangement.EndDate;
            subTermArrangement.TermArrangementPaymentFrequency = termsArrangement.TermArrangementPaymentFrequency;
            subTermArrangement.PaymentMethod = termsArrangement.PaymentMethod;
            subTermArrangement.TermArrangementStatus = TermArrangementStatusEnum.Approved;
            subTermArrangement.ApprovalDate = termsArrangement.ApprovalDate;
            subTermArrangement.TermMonths = termsArrangement.TermMonths;
            subTermArrangement.BankAccountId = termsArrangement.BankAccountId;

            var entity = Mapper.Map<billing_TermArrangement>(subTermArrangement);

            entity.ParentTermArrangementId = parentArrangementId;
            entity.IsActive = true;
            if (billingCycles.Count > 0 && billingCycles.LastOrDefault() != null)
                entity.FinancialYearId = billingCycles.LastOrDefault()?.IndustryFinancialYearId;

            _termArrangementRepository.Create(entity);
            if (termsArrangement != null && termsArrangement.RolePlayerId.HasValue)
            {
                var finPayee = await _rolePlayerService.GetFinPayeeByRolePlayerId((int)termsArrangement.RolePlayerId);
                finPayee.DebtorStatus = DebtorStatusEnum.TermsArrangement;
                await _rolePlayerService.UpdateFinPayee(finPayee);
            }
        }

        public async Task<int> SendUnsuccessfulInitiationEmail(int termArrangementId, string emailAddress)
        {
            try
            {
                int roleplayerId = 0;
                var debtor = new FinPayee();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var termArrangement = await _termArrangementRepository.FirstOrDefaultAsync(t => t.TermArrangementId == termArrangementId);
                    roleplayerId = (int)termArrangement.RolePlayerId;
                    if (roleplayerId > 0)
                    {
                        var entity = await _finPayeeRepository.FirstOrDefaultAsync(f => f.RolePlayerId == roleplayerId);
                        debtor = Mapper.Map<FinPayee>(entity);
                    }
                }
                if (roleplayerId > 0)
                {
                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermsUnsuccessfulInitiatonEmail);

                    return await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = termArrangementId,
                        ItemType = termArrangementEmailType,
                        FromAddress = fromAddress,
                        Recipients = emailAddress,
                        Subject = $"Unsuccessful Term Arrangement Application",
                        Body = emailBody.Replace("{0}", debtor.FinPayeNumber),
                        IsHtml = true
                    });
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send email -termId:{termArrangementId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
            return await Task.FromResult(0);
        }


        public async Task<int> SendMemoOfAgreementEmailTwoFinancials(int termArrangementId, string emailAddress, decimal balanceRemaining, int yearRemaining, int roleplayerId, int bankaccountId)
        {
            try
            {
                var debtor = new FinPayee();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _finPayeeRepository.FirstOrDefaultAsync(f => f.RolePlayerId == roleplayerId);
                    debtor = Mapper.Map<FinPayee>(entity);
                }
                if (debtor.RolePlayerId > 0)
                {
                    var parameters = $"&balance={balanceRemaining}&year={yearRemaining}&termArrangementId={termArrangementId}&showBalanceMessage={true}&bankaccountId={bankaccountId}&rs:Command=ClearSession";
                    var reportPath = "RMATermsMOATwoPeriods";

                    var docBytes = await GetUriDocumentByteData(new Uri($"{fincareportServerUrl}/{reportPath}{parameters}&rs:Format=PDF"), _headerCollection);

                    var attachments = new List<MailAttachment>
                    {
                        new MailAttachment { AttachmentByteData = docBytes, FileName = "Termarrangement.pdf", FileType = "application/pdf"},
                    };
                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermArrangementMOAEmail);

                    await UploadSentMOADocument
                    (
                      DocumentTypeEnum.TermsArrangementAgreement,
                      "Termarrangement.pdf",
                      new Dictionary<string, string> { { "termArrangementId", termArrangementId.ToString() } },
                      "application/pdf",
                      DocumentSetEnum.TermsArrangementDocuments,
                      docBytes
                    );

                    return await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = termArrangementId,
                        ItemType = memoOfAgreementEmailType,
                        FromAddress = fromAddress,
                        Recipients = emailAddress,
                        Subject = $"RMA Memorandum Of Understanding",
                        Body = emailBody.Replace("{0}", debtor.FinPayeNumber),
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    });
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send MOA -Id:{termArrangementId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
            return await Task.FromResult(0);
        }


        public async Task<int> RejectTermApplication(TermArrangement termArrangement, string comment)
        {
            Contract.Requires(termArrangement != null);
            if (termArrangement.RolePlayerId > 0)
            {
                var roleplayer = await _rolePlayerService.GetFinPayeeByRolePlayerId(termArrangement.RolePlayerId.Value);

                int financialYear = 0;
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var debtor = await _rolePlayerService.GetFinPayee(termArrangement.RolePlayerId.Value);
                    var industry = await _industryService.GetIndustry(debtor.IndustryId);
                    if (industry != null)
                    {
                        var financialYears = await _industryFinancialYearRepository.Where(i => i.IndustryClass == industry.IndustryClass && i.IsActive && !i.IsDeleted).ToListAsync();
                        if (financialYears != null && (financialYears.LastOrDefault()?.IndustryFinancialYearId).HasValue)
                            financialYear = (financialYears.LastOrDefault()?.IndustryFinancialYearId).Value;
                    }
                }
                var debtorBalance = await GetDebtorNetBalance(roleplayer.RolePlayerId);
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var termsArrangement = new TermArrangement()
                    {
                        RolePlayerId = termArrangement.RolePlayerId.Value,
                        Balance = debtorBalance,
                        TermArrangementStatus = TermArrangementStatusEnum.Unsuccessful,
                        TotalAmount = debtorBalance,
                        StartDate = DateTime.Now,
                        EndDate = DateTime.Now,
                        TermArrangementPaymentFrequency = TermArrangementPaymentFrequencyEnum.Monthly,
                        PaymentMethod = PaymentMethodEnum.EFT,
                        TermApplicationDeclineReason = TermApplicationDeclineReasonEnum.DeclinedByApprover,
                        LinkedTermArrangementId = termArrangement.LinkedTermArrangementId,
                        TermArrangementProductOptions = new List<TermArrangementProductOption>(),
                        IsActive = false
                    };

                    var entity = Mapper.Map<billing_TermArrangement>(termsArrangement);
                    entity.BankAccountId = null;
                    if (financialYear > 0)
                        entity.FinancialYearId = financialYear;
                    await CheckAndClosePreviousArrangement(termsArrangement.RolePlayerId.Value, financialYear, termsArrangement.LinkedTermArrangementId, termsArrangement);
                    entity.IsActive = true;

                    _termArrangementRepository.Create(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);


                    if (roleplayer != null && roleplayer.RolePlayerId > 0)
                    {
                        var contacts = await _rolePlayerService.GetRolePlayerContactDetails(roleplayer.RolePlayerId);

                        if (contacts.LastOrDefault(c => !c.IsDeleted) != null && !string.IsNullOrEmpty(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress))
                            await SendTermApplicationStatusEmail(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress, entity.TermArrangementId, TermNotificationTypeEnum.Declined, string.Empty);
                    }
                    return entity.TermArrangementId;
                }
            }
            return await Task.FromResult(0);
        }

        private async Task<int> SendTermApplicationStatusEmail(string emailAddress, int termArrangementId, TermNotificationTypeEnum status, string reason)
        {
            try
            {
                int roleplayerId = 0;
                var debtor = new FinPayee();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var termArrangement = await _termArrangementRepository.FirstOrDefaultAsync(t => t.TermArrangementId == termArrangementId);
                    roleplayerId = (int)termArrangement.RolePlayerId;
                    if (roleplayerId > 0)
                    {
                        var entity = await _finPayeeRepository.FirstOrDefaultAsync(f => f.RolePlayerId == roleplayerId);
                        debtor = Mapper.Map<FinPayee>(entity);
                    }
                }
                if (roleplayerId > 0)
                {
                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermsApplicationStatusEmail);

                    return await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = termArrangementId,
                        ItemType = termArrangementEmailType,
                        FromAddress = fromAddress,
                        Recipients = emailAddress,
                        Subject = $" RMA payment arrangement feedback ({debtor.FinPayeNumber})",
                        Body = emailBody.Replace("{0}", status.GetDescription().ToLower()).Replace("{1}", reason),
                        IsHtml = true
                    });
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send email -termId:{termArrangementId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
            return await Task.FromResult(0);
        }


        public async Task<List<DebtorProductBalance>> GetDebtorTermProductBalances(int roleplayerId, int termBillingCycleId)
        {
            var results = new List<DebtorProductBalance>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (termBillingCycleId == 0)
                {
                    var roleplayer = await _rolePlayerService.GetFinPayee(roleplayerId);
                    var industry = await _industryService.GetIndustry(roleplayer.IndustryId);
                    var billingCycles = await _industryFinancialYearRepository.Where(i => i.IndustryClass == industry.IndustryClass && !i.IsDeleted && i.IsActive).ToListAsync();

                    if (billingCycles != null && billingCycles.Count > 0 && billingCycles.LastOrDefault() != null)
                        termBillingCycleId = (int)billingCycles.LastOrDefault()?.IndustryFinancialYearId;
                }
                if (termBillingCycleId > 0)
                {
                    results = await _transactionRepository.SqlQueryAsync<DebtorProductBalance>(
                   DatabaseConstants.GetDebtorProductBalancesForTerms,
                   new SqlParameter("@roleplayerId", roleplayerId),
                    new SqlParameter("@underWritingYearId", termBillingCycleId)
                   );
                }
                return results;
            }
        }

        public async Task<bool> SendMemoOfAgreementEmail(TermsMemoOfAgreementEmail termsMemoOfAgreementEmail)
        {
            Contract.Requires(termsMemoOfAgreementEmail != null);
            var balanceRemaining = 0m;
            var roleplayerId = 0;
            var termarrangementEndYear = 0;
            var termArrangementId = 0;
            var bankAccountId = 0;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var termArrangement = await _termArrangementRepository.FirstOrDefaultAsync(t => t.TermArrangementId == termsMemoOfAgreementEmail.TermArrangementId);
                balanceRemaining = termArrangement.BalanceCarriedToNextCycle != null ? (decimal)termArrangement.BalanceCarriedToNextCycle : 0;
                roleplayerId = (int)termArrangement.RolePlayerId;
                termArrangementId = termArrangement.TermArrangementId;
                termarrangementEndYear = termArrangement.EndDate.Year;
                bankAccountId = termArrangement.BankAccountId.HasValue ? termArrangement.BankAccountId.Value : 0;
            }

            if (balanceRemaining > 0)
            {
                await SendMemoOfAgreementEmailTwoFinancials(termArrangementId, termsMemoOfAgreementEmail.EmailAddress, balanceRemaining, termarrangementEndYear, roleplayerId, bankAccountId);
            }
            else
            {
                await SendMemoOfAgreementSingleFinancialYearEmail(termArrangementId, termsMemoOfAgreementEmail.EmailAddress, roleplayerId, bankAccountId);
            }

            var text = $"Terms MOA sent to client";
            var note = new BillingNote
            {
                ItemId = roleplayerId,
                ItemType = BillingNoteTypeEnum.MemorandumOfAgreement.GetDescription(),
                Text = text
            };
            await _billingService.AddBillingNote(note);
            return await Task.FromResult(true);
        }


        public async Task SendLogsForAllocatedInvoices()
        {
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _invoiceRepository.SqlQueryAsync<billing_Invoice>(DatabaseConstants.GetPaidInvoicesPendingLetterOfGoodStanding);

                    var invoices = new List<Invoice>();
                    invoices = Mapper.Map<List<Invoice>>(entities);

                    foreach (var invoice in invoices)
                    {
                        await _letterOfGoodStandingService.GenerateNextLetterOfGoodStanding(invoice.InvoiceNumber);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured sending LOG > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
        }

        public async Task<TermsDebitOrderDetail> GetTermsDebitOrderDetailsByTermSchedule(int termarrangementScheduleId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var termarrangementSchedule = await _termArrangementScheduleRepository.FirstOrDefaultAsync(c => c.TermArrangementScheduleId == termarrangementScheduleId);

                var termarrangementId = termarrangementSchedule.TermArrangementId;

                var termdebitOrderDetails = await _termDebitOrderRolePlayerBankingDetailRepository.FirstOrDefaultAsync(c => c.TermArrangementId == termarrangementId && c.IsActive);

                var termsDebitOrderDetail = Mapper.Map<TermsDebitOrderDetail>(termdebitOrderDetails);
                return termsDebitOrderDetail;
            }
        }

        public async Task<TermsDebitOrderDetail> GetTermsDebitOrderDetailsByTermArrangementId(int termarrangementId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var termdebitOrderDetails = await _termDebitOrderRolePlayerBankingDetailRepository.FirstOrDefaultAsync(c => c.TermArrangementId == termarrangementId && c.IsActive);
                var termsDebitOrderDetail = Mapper.Map<TermsDebitOrderDetail>(termdebitOrderDetails);
                return termsDebitOrderDetail;
            }

        }

        private async Task UploadSentMOADocument(DocumentTypeEnum documentType, string fileName, Dictionary<string, string> keys, string fileExtension, DocumentSetEnum documentSet, byte[] documentBytes)
        {
            var doc = new ScanCare.Contracts.Entities.Document
            {
                DocTypeId = (int)documentType,
                SystemName = Common.Enums.DocumentSystemNameEnum.BillingManager.GetDescription(),
                FileName = fileName,
                Keys = keys,
                DocumentStatus = DocumentStatusEnum.Received,
                FileExtension = fileExtension,
                DocumentSet = documentSet,
                FileAsBase64 = Convert.ToBase64String(documentBytes),
                MimeType = MimeMapping.GetMimeMapping(fileName)
            };
            await _documentIndexService.UploadDocument(doc);
        }

        private async Task UpdateSupportingDocumentsIndexing(int termArrangementId, int wizardId)
        {
            await _documentIndexService.UpdateDocumentKeys(Common.Enums.DocumentSystemNameEnum.BillingManager, "wizardId", wizardId.ToString(), "termArrangementId", termArrangementId.ToString());

        }

        private async Task<int> NotifyTwoDaysBeforeMonthEnd(DateTime dateTime, int termArrangementId, string emailAddress, int roleplayerId)
        {
            var monthEndDate = new DateTime(dateTime.Year, dateTime.Month, DateTime.DaysInMonth(dateTime.Year, dateTime.Month));

            try
            {
                var debtor = new FinPayee();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _finPayeeRepository.FirstOrDefaultAsync(f => f.RolePlayerId == roleplayerId);
                    debtor = Mapper.Map<FinPayee>(entity);
                }

                if (debtor.RolePlayerId > 0)
                {
                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.TermArrangementTwoDaysBeforeMonthEnd);

                    return await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = termArrangementId,
                        ItemType = "termsLateApplication",
                        FromAddress = fromAddress,
                        Recipients = emailAddress,
                        Subject = $"RMA Payment Arrangement Feedback ({debtor.FinPayeNumber})",
                        Body = emailBody.Replace("{0}", monthEndDate.ToString("yyyy/MM/dd")),
                        IsHtml = true
                    });
                }
                return await Task.FromResult(0);
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send Terms two days notification -Id:{termArrangementId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                return await Task.FromResult(0);
            }
        }

        public async Task<List<TermArrangement>> GetActiveArrangementsByRoleplayer(int roleplayerId, int financialYearPeriodId)
        {
            var termArrangements = new List<TermArrangement>();
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (financialYearPeriodId == 0)
                {
                    var roleplayer = await _rolePlayerService.GetFinPayee(roleplayerId);
                    var industry = await _industryService.GetIndustry(roleplayer.IndustryId);
                    var billingCycles = await _industryFinancialYearRepository.Where(i => i.IndustryClass == industry.IndustryClass && !i.IsDeleted && i.IsActive).ToListAsync();

                    if (billingCycles != null && billingCycles.Count > 0 && billingCycles.LastOrDefault() != null)
                        financialYearPeriodId = (int)billingCycles.LastOrDefault()?.IndustryFinancialYearId;
                }
                if (financialYearPeriodId > 0)
                {
                    var entities = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId && t.IsActive && !t.IsDeleted
               && (t.FinancialYearId == financialYearPeriodId)).ToListAsync();

                    termArrangements = Mapper.Map<List<TermArrangement>>(entities);
                }
            }
            return termArrangements;
        }

        public async Task<List<DebtorProductBalance>> GetProductBalancesByPolicyIds(TermProductBalanceRequest request)
        {
            Contract.Requires(request != null);
            var productBalances = new List<DebtorProductBalance>();
            var results = new List<DebtorProductBalance>();
            int roleplayerId = request.RoleplayerId;
            int termBillingCycleId = request.TermBillingCycleId;
            List<int> PolicyIds = request.PolicyIds;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                productBalances = await _transactionRepository.SqlQueryAsync<DebtorProductBalance>(
               DatabaseConstants.GetDebtorProductBalancesForTerms,
               new SqlParameter("@roleplayerId", roleplayerId),
                new SqlParameter("@underWritingYearId", termBillingCycleId)
               );

                var grouped = productBalances.Where(c => PolicyIds.Contains(c.PolicyId)).ToList().GroupBy(c => c.PolicyId);

                foreach (var group in grouped)
                {
                    results.Add(new DebtorProductBalance
                    {
                        PolicyId = group.Key,
                        Balance = group.Sum(c => c.Balance),
                        ProductOptionId = (int)group.FirstOrDefault()?.ProductOptionId,
                        ProductOptionName = group.FirstOrDefault()?.ProductOptionName
                    });
                }
                return results;
            }
        }

        private DateTime GetPaymentScheduleStartDate(int installmentDay, DateTime termArrangementStartDate)
        {
            if (installmentDay < termArrangementStartDate.Day)
            {
                //schedule start next month
                var nextMonthDate = termArrangementStartDate.AddMonths(1);
                return new DateTime(nextMonthDate.Year, nextMonthDate.Month, installmentDay);
            }
            else
            {
                return new DateTime(termArrangementStartDate.Year, termArrangementStartDate.Month, installmentDay);
            }
        }

        public async Task DiscardUnactionedTerms()
        {
            var wizards = new List<Wizard>();
            var inProgressTerms = await _wizardService.GetWizardsByConfigurationAndStatus(termsWizardConfig, WizardStatusEnum.InProgress);
            var disputedTerms = await _wizardService.GetWizardsByConfigurationAndStatus(termsWizardConfig, WizardStatusEnum.Disputed);
            wizards.AddRange(inProgressTerms);
            wizards.AddRange(disputedTerms);

            foreach (var item in wizards)
            {
                var differenceBetweenDates = (DateTime.Now - item.CreatedDate).TotalDays;
                if (differenceBetweenDates > 60)
                {
                    item.WizardStatusId = (int)WizardStatusEnum.Cancelled;
                    await _wizardService.UpdateWizard(item);
                }
            }
        }

        public async Task<int> GetCurrentTermArrangementInPlace(int roleplayerId)
        {
            var finPayee = await _rolePlayerService.GetFinPayee(roleplayerId);
            var industry = await _industryService.GetIndustry(finPayee.IndustryId);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var billingCycles = await _industryFinancialYearRepository.Where(i => i.IndustryClass == industry.IndustryClass && i.IsActive && !i.IsDeleted).ToListAsync();
                var termArrangements = await _termArrangementRepository.Where(t => t.RolePlayerId == roleplayerId).ToListAsync();

                int financialPeriodEndDayOfMonth = 0;
                int financialPeriodStartMonth = 0;
                int financialPeriodEndMonth = 0;
                int financialPeriodStartDay = 1;
                if ((billingCycles != null && billingCycles.Count > 0) && (termArrangements != null && termArrangements.Count > 0))
                {
                    if ((billingCycles.LastOrDefault()?.EndMonth).HasValue
                             && (billingCycles.LastOrDefault()?.EndDay).HasValue
                             && (billingCycles.FirstOrDefault()?.StartMonth).HasValue
                             && (billingCycles.FirstOrDefault()?.StartDay).HasValue)
                    {
                        financialPeriodEndMonth = (billingCycles.LastOrDefault()?.EndMonth).Value;
                        financialPeriodEndDayOfMonth = (billingCycles.LastOrDefault()?.EndDay).Value;
                        financialPeriodStartMonth = (billingCycles.FirstOrDefault()?.StartMonth).Value;
                        financialPeriodStartDay = (billingCycles.FirstOrDefault()?.StartDay).Value;
                    }
                    if (financialPeriodEndMonth > 0 && financialPeriodStartMonth > 0)
                    {
                        var activeFinancialYear = billingCycles.LastOrDefault()?.IndustryFinancialYearId;
                        var financialStartYearMonth = new DateTime((billingCycles.FirstOrDefault()?.StartYear).Value, financialPeriodStartMonth, financialPeriodStartDay);
                        var financialEndYearMonth = new DateTime((billingCycles.LastOrDefault()?.EndYear).Value, financialPeriodEndMonth, financialPeriodEndDayOfMonth);

                        if (termArrangements.Where(t => t.StartDate >= financialStartYearMonth && t.EndDate <= financialEndYearMonth && t.IsActive).ToList().Count > 0)
                            return (int)termArrangements.LastOrDefault()?.TermArrangementId;
                        return 0;
                    }
                    else
                        return 0;
                }
                return 0;
            }
        }

        public async Task<bool> ReverseTermScheduleAllocations(int termarrangementId, decimal amount, int transactionId, DateTime debitTransactionDate)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var reversingAmount = amount;
                var schedules = await _termArrangementScheduleRepository.Where(t => t.TermArrangementId == termarrangementId).ToListAsync();
                foreach (var schedule in schedules.Where(c => c.AllocationDate != null && c.AllocationDate > debitTransactionDate).OrderByDescending(s => s.TermArrangementScheduleId))
                {
                    var allocation = _termScheduleAllocationsRepository.Where(t => t.TermArrangmentScheduleId == schedule.TermArrangementScheduleId).ToList();
                    var allocatedAmount = allocation.Sum(c => c.Amount);
                    if (allocatedAmount > 0)
                    {
                        schedule.Balance = schedule.Amount;
                        schedule.TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.Pending;
                        var reverseAllocation = new billing_TermScheduleAllocation { Amount = decimal.Negate(allocatedAmount), TermArrangmentScheduleId = schedule.TermArrangementScheduleId };
                        _termScheduleAllocationsRepository.Create(reverseAllocation);
                        _termArrangementScheduleRepository.Update(schedule);
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<decimal> RefundTermSchedulesAllocations(int refundTransactionId, TermScheduleRefundBreakDown termScheduleRefundBreakDown, decimal fullRefundAmountRemaining)
        {
            List<billing_TermScheduleAllocation> termScheduleRefundAllocations = new List<billing_TermScheduleAllocation>();
            decimal remainingAmount = fullRefundAmountRemaining;
            decimal totalRefunded = 0;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                foreach (var scheduleId in termScheduleRefundBreakDown?.RefundableTermScheduleIds.OrderByDescending(x => x))
                {
                    var termScheduleAllocationsBalance = _termScheduleAllocationsRepository.Where(x => x.TermArrangmentScheduleId == scheduleId && x.TransactionId == termScheduleRefundBreakDown.TransactionId).Sum(x => x.Amount);

                    if (remainingAmount <= 0) { continue; }

                    if (termScheduleAllocationsBalance > 0)
                    {
                        decimal allocationRefundAmount = 0;

                        if (remainingAmount >= termScheduleAllocationsBalance)
                        {
                            allocationRefundAmount = termScheduleAllocationsBalance;
                        }
                        else
                        {
                            allocationRefundAmount = remainingAmount;
                        }
                        remainingAmount = remainingAmount - allocationRefundAmount;

                        billing_TermScheduleAllocation termScheduleAllocation = new billing_TermScheduleAllocation
                        {
                            TransactionId = refundTransactionId,
                            Amount = Math.Abs(allocationRefundAmount) * -1,
                            TermArrangmentScheduleId = scheduleId,
                            IsDeleted = false,
                        };
                        totalRefunded += Math.Abs(allocationRefundAmount);
                        termScheduleRefundAllocations.Add(termScheduleAllocation);
                    }
                }

                if (termScheduleRefundAllocations.Count > 0)
                {
                    foreach (var termScheduleRefundAllocation in termScheduleRefundAllocations)
                    {
                        var scheduleTotalAllocatedAmount = _termScheduleAllocationsRepository.Where(x => x.TermScheduleAllocationId == termScheduleRefundAllocation.TermArrangmentScheduleId).Sum(x => x.Amount);
                        _termScheduleAllocationsRepository.Create(termScheduleRefundAllocation);

                        //update term arrangement schedule balance
                        var termArragementSchedule = await _termArrangementScheduleRepository.FirstOrDefaultAsync(x => x.TermArrangementScheduleId == termScheduleRefundAllocation.TermArrangmentScheduleId);

                        var balance = termArragementSchedule.Amount - scheduleTotalAllocatedAmount - termScheduleRefundAllocation.Amount;
                        termArragementSchedule.Balance = balance;

                        if (balance <= 0)
                        {
                            termArragementSchedule.TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.Paid;
                        }
                        else if (termArragementSchedule.Amount == balance)
                        {
                            termArragementSchedule.TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.Pending;
                        }
                        else
                        {
                            termArragementSchedule.TermArrangementScheduleStatus = TermArrangementScheduleStatusEnum.PartiallyPaid;
                        }
                        _termArrangementScheduleRepository.Update(termArragementSchedule);
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

            }
            return totalRefunded;
        }

        public async Task<List<TermScheduleRefundBreakDown>> GetTermScheduleRefundBreakDown(int roleplayerId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var breakDowns = new List<TermScheduleRefundBreakDown>();
                var termarrangement = await _termArrangementRepository.FirstOrDefaultAsync(t => t.IsActive && t.RolePlayerId == roleplayerId && !t.IsDeleted);
                if (termarrangement != null)
                {
                    var schedules = await _termArrangementScheduleRepository.Where(t => t.TermArrangementId == termarrangement.TermArrangementId
                    && (t.TermArrangementScheduleStatus == TermArrangementScheduleStatusEnum.Paid
                    || t.TermArrangementScheduleStatus == TermArrangementScheduleStatusEnum.PartiallyPaid
                    )).ToListAsync();
                    if (schedules.Count > 0)
                    {
                        var scheduleIds = schedules.Select(c => c.TermArrangementScheduleId).ToList();
                        var allocated = await _termScheduleAllocationsRepository.Where(s => scheduleIds.Contains(s.TermArrangmentScheduleId)).ToListAsync();
                        if (allocated.Count > 0)
                        {
                            var allocatedIds = allocated.Select(c => c.TransactionId).ToList();
                            var transactions = await _transactionRepository.Where(t => allocatedIds.Contains(t.TransactionId)).ToListAsync();
                            var bankstatementEntryIds = transactions.Select(c => c.BankStatementEntryId).ToList();
                            var bankstatementEntry = await _bankstatementStatementRepository.Where(b => bankstatementEntryIds.Contains(b.BankStatementEntryId)).ToListAsync();

                            var allocatedItems = allocated.Where(a => scheduleIds.Contains(a.TermArrangmentScheduleId))
                                .GroupBy(c => c.TransactionId);

                            foreach (var group in allocatedItems)
                            {
                                List<int> refundableTermScheduleIds = new List<int>();

                                var groupAllocatedScheduleIds = group.Select(c => c.TermArrangmentScheduleId).ToList();
                                var advancedPaymentIds = schedules.Where(c => c.PaymentDate > DateTime.Now.EndOfTheDay()
                                && groupAllocatedScheduleIds.Contains(c.TermArrangementScheduleId)).OrderByDescending(x => x.PaymentDate).Select(c => c.TermArrangementScheduleId).ToList();
                                var onParPaymentIds = schedules.Where(c => c.PaymentDate <= DateTime.Now.EndOfTheDay()
                                && groupAllocatedScheduleIds.Contains(c.TermArrangementScheduleId)).Select(c => c.TermArrangementScheduleId).ToList();
                                var sumOnPar = group.Where(c => onParPaymentIds.Contains(c.TermArrangmentScheduleId)).Sum(c => c.Amount);

                                var sumAdvancedPayments = group.Where(c => advancedPaymentIds.Contains(c.TermArrangmentScheduleId)).Sum(c => c.Amount);

                                if (sumAdvancedPayments > 0)
                                {

                                    foreach (var advancedPaymentId in advancedPaymentIds)
                                    {
                                        var scheduleNetAllocationsAmt = group.Where(x => advancedPaymentId == x.TermArrangmentScheduleId).Sum(x => x.Amount);

                                        if (scheduleNetAllocationsAmt > 0)
                                        {
                                            refundableTermScheduleIds.Add(advancedPaymentId);
                                        }
                                    }
                                }

                                var transaction = transactions.FirstOrDefault(c => c.TransactionId == group.Key);
                                var transactionBalance = transaction?.Amount - sumOnPar - sumAdvancedPayments;
                                var refundable = sumAdvancedPayments;
                                var bankEntryStatementEntryId = transactions.FirstOrDefault(c => c.TransactionId == group.Key)?.BankStatementEntryId.Value;

                                if (refundable <= 0) { continue; }

                                var breakdown = new TermScheduleRefundBreakDown
                                {
                                    BankAccountNumber = bankstatementEntry.FirstOrDefault(b => b.BankStatementEntryId == bankEntryStatementEntryId)?.BankAccountNumber.TrimStart(new char[] { '0' }),
                                    Overpayment = (decimal)refundable,
                                    TransactionId = group.Key,
                                    Amount = transaction.Amount,
                                    Reference = transaction.RmaReference,
                                    TransactionType = transaction.TransactionType.GetDescription().SplitCamelCaseText(),
                                    TransactionDate = transaction.TransactionDate,
                                    RefundableTermScheduleIds = refundableTermScheduleIds,
                                };
                                breakDowns.Add(breakdown);
                            }
                        }
                    }
                }
                return breakDowns;
            }
        }
    }
}



