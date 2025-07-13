using CommonServiceLocator;

using Newtonsoft.Json.Linq;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.RuleTasks;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaim;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimBenefitsWithinTwoYears;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimInjury;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimNotOlderThanTwoYears;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimStpStatus;
using RMA.Service.MediCare.BusinessProcessTasks.Notifications;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.RuleTasks.PreAuthRules;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.DuplicatePreAuth;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.ProhibitedPractitionerType;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks.PreAuthorizationChronicWizard
{
    public class PreAuthorizationChronicEditWizard : IWizardProcess
    {
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IWizardService _wizardService;
        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        private IRuleContext _context;
        private DateTime? dateOfDeath;
        NotificationManagement notificationManagement;
        private readonly IUserReminderService _userReminderService;

        public PreAuthorizationChronicEditWizard(
             IPreAuthorisationService preAuthorisationService,
             IUserService userService,
             IRoleService roleService,
             IPreAuthClaimService preAuthClaimService,
             IWizardService wizardService,
             IPensionClaimMapService pensionClaimMapService,
             IUserReminderService userReminderService)
        {
            _preAuthorisationService = preAuthorisationService;
            _wizardService = wizardService;
            _preAuthClaimService = preAuthClaimService;
            _userService = userService;
            _roleService = roleService;
            _pensionClaimMapService = pensionClaimMapService;
            _context = ServiceLocator.Current.GetInstance<IRuleContext>();
            notificationManagement = new NotificationManagement(_wizardService, _userService, _roleService, _preAuthorisationService, _preAuthClaimService, _pensionClaimMapService);
            _userReminderService = userReminderService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

            var preAuthorisationModel = context.Deserialize<PreAuthorisation>(context.Data);
            var label = "chronic pre-authorization edit ";

            var stepData = new ArrayList() { preAuthorisationModel };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthForm = context.Deserialize<PreAuthorisation>(stepData[0].ToString());

            var lastActivity = await _preAuthorisationService.GetPreAuthActivity(preAuthForm.PreAuthId, PreAuthStatusEnum.InfoRequired);
            if (lastActivity != null)
            {
                var type = "review-preauth";
                var reviewWizards = await _wizardService.GetWizardsByConfigurationAndItemId(new List<int> { preAuthForm.PreAuthId }, type);
                if (reviewWizards.Count > 0)
                {
                    var lastReviewWizard = reviewWizards.LastOrDefault();
                    var startWizardRequest = new StartWizardRequest
                    {
                        Type = type,
                        LinkedItemId = preAuthForm.PreAuthId,
                        Data = context.Serialize(preAuthForm),
                        RequestInitiatedByBackgroundProcess = true,
                        LockedToUser = lastReviewWizard.ModifiedBy
                    };
                    var reviewWizard = await _wizardService.StartWizard(startWizardRequest);
                    await SendUserReminder(lastReviewWizard.ModifiedBy, preAuthForm, reviewWizard.Id);
                }
            }

            preAuthForm.ModifiedDate = DateTimeHelper.SaNow;
            await _preAuthorisationService.UpdatePreAuthorisation(preAuthForm).ConfigureAwait(false);
        }

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            RuleRequestResult ruleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            if (context == null)
                return null;

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthForm = context.Deserialize<PreAuthorisation>(stepData[0].ToString());
            IRule claimLiabilityStatusRule = new ClaimLiabilityStatusRule();
            IRule claimNotOlderThanTwoYearsRule = new ClaimNotOlderThanTwoYearsRule();
            IRule preAuthFromDateRule = new PreAuthFromDateRule();
            IRule preAuthToDateRule = new PreAuthToDateRule();
            IRule preAuthInjuryDateRule = new PreAuthInjuryDateRule();
            IRule preAuthFromDateDODRule = new AuthFromDateAfterDateOfDeathRule();
            IRule preAuthToDateDODRule = new AuthToDateNotAfterDateOfDeathRule();
            IRule preAuthClaimStpStatusRule = new PreAuthClaimStpStatusRule();
            IRule preAuthClaimInjuryRule = new PreAuthClaimInjuryRule();
            IRule duplicatePreAuthRule = new DuplicatePreAuthRule();
            IRule prohibitedPractitionerTypeRule = new ProhibitedPractitionerTypeRule();
            IRule preAuthClaimBenefitsWithinTwoYearsRule = new PreAuthClaimBenefitsWithinTwoYearsRule();
            bool authFromDateDODRuleResult;
            bool authToDateDODRuleResult;
            int personEventId = Convert.ToInt32(preAuthForm.PersonEventId);
            int healthCareProviderId = Convert.ToInt32(preAuthForm.HealthCareProviderId);
            int claimId = Convert.ToInt32(preAuthForm.ClaimId);

            PreAuthRulesHelper preAuthRulesHelper = new PreAuthRulesHelper(_preAuthClaimService);

            //Validate Claim Liability Status
            _context.Data = await preAuthRulesHelper.GetClaimLiabilityStatus(personEventId);
            var claimLiabilityStatusResult = claimLiabilityStatusRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = claimLiabilityStatusResult.Passed, RuleName = claimLiabilityStatusResult.RuleName, MessageList = claimLiabilityStatusResult.MessageList });

            //Validate Claim is not older than 2 year
            _context.Data = await preAuthRulesHelper.GetClaimEventDateAndPreAuthFromDateAsRuleData(personEventId, preAuthForm.DateAuthorisedFrom);
            var claimNotOlderThanTwoYearsResult = claimNotOlderThanTwoYearsRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = claimNotOlderThanTwoYearsResult.Passed, RuleName = claimNotOlderThanTwoYearsResult.RuleName, MessageList = claimNotOlderThanTwoYearsResult.MessageList });

            //Validate Authorisation FromDate connot be before the date of Event Date
            _context.Data = await preAuthRulesHelper.GetPreAuthRuleData(personEventId, preAuthForm);
            var dateofDeath = JToken.Parse(_context.Data).Value<string>("DateOfDeath");
            if (dateofDeath != null)
                dateOfDeath = Convert.ToDateTime(dateofDeath);
            var preAuthFromDateRuleResult = preAuthFromDateRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthFromDateRuleResult.Passed, RuleName = preAuthFromDateRuleResult.RuleName, MessageList = preAuthFromDateRuleResult.MessageList });

            //Validate Authorisation ToDate connot be before the date of Event Date
            var preAuthToDateRuleResult = preAuthToDateRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthToDateRuleResult.Passed, RuleName = preAuthToDateRuleResult.RuleName, MessageList = preAuthToDateRuleResult.MessageList });

            //Validate Authorisation Injury Date connot be before the date of Event Date
            var preAuthInjuryDateRuleResult = preAuthInjuryDateRule.Execute(_context);
            if (preAuthForm.IsRequestFromHcp == true)
                ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthInjuryDateRuleResult.Passed, RuleName = preAuthInjuryDateRuleResult.RuleName, MessageList = preAuthInjuryDateRuleResult.MessageList });
            else
                preAuthInjuryDateRuleResult.Passed = true;

            if (dateOfDeath != null)
            {
                //Validate Authorisation FromDate connot be before the date of death
                var preAuthFromDateDODRuleResult = preAuthFromDateDODRule.Execute(_context);
                ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthFromDateDODRuleResult.Passed, RuleName = preAuthFromDateDODRuleResult.RuleName, MessageList = preAuthFromDateDODRuleResult.MessageList });
                authFromDateDODRuleResult = preAuthFromDateDODRuleResult.Passed;

                //Validate Authorisation ToDate connot be before the date of death
                var preAuthToDateDODRuleResult = preAuthToDateDODRule.Execute(_context);
                ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthToDateDODRuleResult.Passed, RuleName = preAuthToDateDODRuleResult.RuleName, MessageList = preAuthToDateDODRuleResult.MessageList });
                authToDateDODRuleResult = preAuthToDateDODRuleResult.Passed;
            }
            else
            {
                authFromDateDODRuleResult = authToDateDODRuleResult = true;
            }

            //Validate Claim STP Status
            _context.Data = await preAuthRulesHelper.GetClaimSTPStatusAsync(personEventId).ConfigureAwait(true);
            var claimSTPStatusResult = preAuthClaimStpStatusRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = claimSTPStatusResult.Passed, RuleName = claimSTPStatusResult.RuleName, MessageList = claimSTPStatusResult.MessageList });

            //Validate PreAuth Claim Injury Status
            _context.Data = await preAuthRulesHelper.GetPreAuthClaimInjuryStatusAsync(personEventId, preAuthForm?.PreAuthIcd10Codes).ConfigureAwait(true);
            var claimInjuryResult = preAuthClaimInjuryRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = claimInjuryResult.Passed, RuleName = claimInjuryResult.RuleName, MessageList = claimInjuryResult.MessageList });

            //Duplicate PreAuth Check
            _context.Data = await _preAuthorisationService.CheckIfDuplicatePreAuth(preAuthForm);
            var duplicatePreAuthResult = duplicatePreAuthRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = duplicatePreAuthResult.Passed, RuleName = duplicatePreAuthResult.RuleName, MessageList = duplicatePreAuthResult.MessageList });

            //Prohibited PractitionerType for Treatment PreAuth Check
            _context.Data = await _preAuthorisationService.CheckIfProhibitedPractitionerType(healthCareProviderId);
            var prohibitedPractitionerTypeResult = prohibitedPractitionerTypeRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = prohibitedPractitionerTypeResult.Passed, RuleName = prohibitedPractitionerTypeResult.RuleName, MessageList = prohibitedPractitionerTypeResult.MessageList });

            //Preauth Medical Benefit Within TwoYears Rule
            _context.Data = await _preAuthClaimService.GetMedicalBenefitTwoYearRuleData(claimId, preAuthForm.DateAuthorisedFrom);
            var preAuthClaimBenefitsWithinTwoYearsResult = preAuthClaimBenefitsWithinTwoYearsRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthClaimBenefitsWithinTwoYearsResult.Passed, RuleName = preAuthClaimBenefitsWithinTwoYearsResult.RuleName, MessageList = preAuthClaimBenefitsWithinTwoYearsResult.MessageList });

            ruleRequestResult.OverallSuccess = (claimLiabilityStatusResult.Passed && claimNotOlderThanTwoYearsResult.Passed && preAuthFromDateRuleResult.Passed
                                               && preAuthToDateRuleResult.Passed && preAuthInjuryDateRuleResult.Passed && authFromDateDODRuleResult && authToDateDODRuleResult
                                               && claimSTPStatusResult.Passed && claimInjuryResult.Passed && duplicatePreAuthResult.Passed && prohibitedPractitionerTypeResult.Passed
                                               && preAuthClaimBenefitsWithinTwoYearsResult.Passed) || true;

            return ruleRequestResult;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        private async Task SendUserReminder(string userEmail, PreAuthorisation preAuthForm, int wizardId)
        {
            var user = _userService.GetUserByEmail(userEmail);
            var userReminder = new UserReminder
            {
                ItemId = preAuthForm.PreAuthId,
                UserReminderType = UserReminderTypeEnum.SystemNotification,
                AssignedToUserId = user.Id,
                Text = "Requested information provided by HCP",
                LinkUrl = $"medicare/work-manager/review-preauth/continue/{wizardId}"
            };
            await _userReminderService.CreateUserReminder(userReminder);
        }
    }
}
