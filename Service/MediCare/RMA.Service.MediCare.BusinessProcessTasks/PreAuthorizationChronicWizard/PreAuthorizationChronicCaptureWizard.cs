using CommonServiceLocator;

using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.RuleTasks;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaim;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimInjury;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimNotOlderThanTwoYears;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimStpStatus;
using RMA.Service.MediCare.BusinessProcessTasks.Notifications;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.RuleTasks.PreAuthRules;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.DuplicatePreAuth;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks
{
    public class PreAuthorizationChronicCaptureWizard : IWizardProcess
    {
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IWizardService _wizardService;
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        private readonly IDocumentIndexService _documentIndexService;
        private IRuleContext _context;
        private DateTime? dateOfDeath;
        NotificationManagement notificationManagement;
        public PreAuthorizationChronicCaptureWizard(
             IPreAuthorisationService preAuthorisationService,
             IWizardService wizardService,
             IPreAuthClaimService preAuthClaimService,
             IRoleService roleService,
             IUserService userService,
             IDocumentIndexService documentIndexService,
            IPensionClaimMapService pensionClaimMapService
            )
        {
            _preAuthorisationService = preAuthorisationService;
            _wizardService = wizardService;
            _preAuthClaimService = preAuthClaimService;
            _roleService = roleService;
            _userService = userService;
            _pensionClaimMapService = pensionClaimMapService;
            _documentIndexService = documentIndexService;
            _context = ServiceLocator.Current.GetInstance<IRuleContext>();
            notificationManagement = new NotificationManagement(_wizardService, _userService, _roleService, _preAuthorisationService, _preAuthClaimService, _pensionClaimMapService);
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

            var workItemModel = context.Deserialize<PreAuthorisation>(context.Data);
            var label = "Chronic Pre-Authorization Form ";

            var stepData = new ArrayList() { workItemModel };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthForm = context.Deserialize<PreAuthorisation>(stepData[0].ToString());

            preAuthForm.CreatedDate = DateTimeHelper.SaNow;
            preAuthForm.ModifiedDate = DateTimeHelper.SaNow;
            var preAuthId = await _preAuthorisationService.AddPreAuthorisation(preAuthForm).ConfigureAwait(false);
            preAuthForm.PreAuthId = preAuthId;
            await _documentIndexService.UpdateDocumentKeyValues(preAuthForm.ClaimId.ToString(), preAuthId.ToString());
            //Send Notification and create Review task
            await _preAuthorisationService.CreateReviewWizard(preAuthForm);
            try
            {
                await notificationManagement.SendNotificationsForCapturePreAuth(context, preAuthForm);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            var recipients = await _userService.SearchUsersByPermission("Preauth manager view");

            var userReminders = new List<UserReminder>();

            foreach (var recipient in recipients)
            {
                var userReminder = new UserReminder
                {
                    AssignedToUserId = recipient.Id,
                    UserReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications,
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    Text = $"New Chronic Medication Auth submitted by: {RmaIdentity.UsernameOrBlank}",
                    AlertDateTime = DateTimeHelper.SaNow,
                    CreatedBy = RmaIdentity.UsernameOrBlank,
                    LinkUrl = $"/medicare/preauth-view/{preAuthId}"
                };

                userReminders.Add(userReminder);
            }
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            if (context == null) return;

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthForm = context.Deserialize<PreAuthorisationForm>(stepData[0].ToString());
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
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
            bool authFromDateDODRuleResult;
            bool authToDateDODRuleResult;
            int personEventId = Convert.ToInt32(preAuthForm.PersonEventId);

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

            ruleRequestResult.OverallSuccess = (claimLiabilityStatusResult.Passed && claimNotOlderThanTwoYearsResult.Passed && preAuthFromDateRuleResult.Passed
                                               && preAuthToDateRuleResult.Passed && preAuthInjuryDateRuleResult.Passed && authFromDateDODRuleResult && authToDateDODRuleResult
                                               && claimSTPStatusResult.Passed && claimInjuryResult.Passed) || true;

            return ruleRequestResult;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }
        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }

        private async Task SendNotification(Notification notification, string actionLink, int linkedItemId, string lockedToUser = "")
        {
            await _wizardService.SendWizardNotification("capture-preauth-notification", notification.Title,
                notification.Message, actionLink, linkedItemId, lockedToUser);
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
