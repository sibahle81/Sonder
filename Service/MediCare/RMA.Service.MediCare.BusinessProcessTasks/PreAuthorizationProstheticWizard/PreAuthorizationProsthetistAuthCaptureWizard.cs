using CommonServiceLocator;

using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
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
using RMA.Service.MediCare.BusinessProcessTasks.Notifications;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks.PreAuthorizationProstheticWizard
{
    public class PreAuthorizationProsthetistAuthCaptureWizard : IWizardProcess
    {
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IWizardService _wizardService;
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IUserReminderService _userReminderService;
        NotificationManagement notificationManagement;
        public PreAuthorizationProsthetistAuthCaptureWizard(
             IPreAuthorisationService preAuthorisationService,
             IWizardService wizardService,
             IPreAuthClaimService preAuthClaimService,
             IRoleService roleService,
             IUserService userService,
            IPensionClaimMapService pensionClaimMapService,
            IDocumentIndexService documentIndexService,
            IUserReminderService userReminderService
            )
        {
            _preAuthorisationService = preAuthorisationService;
            _wizardService = wizardService;
            _preAuthClaimService = preAuthClaimService;
            _roleService = roleService;
            _userService = userService;
            _pensionClaimMapService = pensionClaimMapService;
            _documentIndexService = documentIndexService;
            _userReminderService = userReminderService;
            notificationManagement = new NotificationManagement(_wizardService, _userService, _roleService, _preAuthorisationService, _preAuthClaimService, _pensionClaimMapService);
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

            var workItemModel = context.Deserialize<PreAuthorisation>(context.Data);
            var label = "Prosthetic Pre-Authorization Form ";

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
            //Send Notification and create Review task
            await _preAuthorisationService.CreateReviewWizard(preAuthForm);

            await notificationManagement.SendNotificationsForCapturePreAuth(context, preAuthForm);
            //after getting ID update document set with preAuthId to link MedicalProstheticDocuments to Prosthetic Auth
            await _documentIndexService.UpdateDocumentKeyValues(wizard.Id.ToString(), preAuthId.ToString());

            //Send Notification and create Review task
            var recipients = await _userService.SearchUsersByPermission("Preauth manager view");

            var userReminders = new List<UserReminder>();

            foreach (var recipient in recipients)
            {
                var userReminder = new UserReminder
                {
                    AssignedToUserId = recipient.Id,
                    UserReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications,
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    Text = $"New Prosthetic Auth submitted by: {RmaIdentity.UsernameOrBlank}",
                    AlertDateTime = DateTimeHelper.SaNow,
                    CreatedBy = RmaIdentity.UsernameOrBlank,
                    LinkUrl = $"/medicare/prosthetist-preauth-details/{preAuthId}"
                };

                userReminders.Add(userReminder);
            }

            _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
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

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var result = new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            };
            return Task.FromResult(result);
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
