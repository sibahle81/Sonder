using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.MediCare.BusinessProcessTasks.Notifications;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks
{
    public class PreAuthorisationEditWizard : IWizardProcess
    {
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IWizardService _wizardService;
        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        NotificationManagement notificationManagement;
        private readonly IUserReminderService _userReminderService;

        public PreAuthorisationEditWizard(
             IPreAuthorisationService preAuthorisationService,
             IUserService userService,
             IRoleService roleService,
             IPreAuthClaimService preAuthClaimService,
            IWizardService wizardService,
            IPensionClaimMapService pensionClaimMapService,
            IUserReminderService userReminderService
            )
        {
            _preAuthorisationService = preAuthorisationService;
            _wizardService = wizardService;
            _preAuthClaimService = preAuthClaimService;
            _userService = userService;
            _roleService = roleService;
            _pensionClaimMapService = pensionClaimMapService;
            notificationManagement = new NotificationManagement(_wizardService, _userService, _roleService, _preAuthorisationService, _preAuthClaimService, _pensionClaimMapService);
            _userReminderService = userReminderService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

            var workItemModel = context.Deserialize<PreAuthorisation>(context.Data);
            var label = "pre-authorization edit ";

            var stepData = new ArrayList() { workItemModel };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthForm = context.Deserialize<PreAuthorisation>(stepData[0].ToString());
            preAuthForm.ModifiedDate = DateTimeHelper.SaNow;

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

        public async Task OnSaveStep(IWizardContext context)
        {

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
            return new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new System.Collections.Generic.List<RuleResult>()
            };
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
