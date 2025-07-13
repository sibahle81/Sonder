using AutoMapper;
using CommonServiceLocator;

using RMA.Common.Extensions;
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

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks
{
    public class PreAuthorizationProsthetistQuoteCaptureWizard : IWizardProcess
    {
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IWizardService _wizardService;
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        private readonly IUserReminderService _userReminderService;
        NotificationManagement notificationManagement;
        public PreAuthorizationProsthetistQuoteCaptureWizard(
             IPreAuthorisationService preAuthorisationService,
             IWizardService wizardService,
             IPreAuthClaimService preAuthClaimService,
             IRoleService roleService,
             IUserService userService,
             IUserReminderService userReminderService,
            IPensionClaimMapService pensionClaimMapService
            )
        {
            _preAuthorisationService = preAuthorisationService;
            _wizardService = wizardService;
            _preAuthClaimService = preAuthClaimService;
            _roleService = roleService;
            _userService = userService;
            _pensionClaimMapService = pensionClaimMapService;
            _userReminderService = userReminderService;
            notificationManagement = new NotificationManagement(_wizardService, _userService, _roleService, _preAuthorisationService, _preAuthClaimService, _pensionClaimMapService);
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

            var workItemModel = context.Deserialize<ProsthetistQuote>(context.Data);
            var label = "Pre-Authorization Prosthetist Quote Form ";

            var stepData = new ArrayList() { workItemModel };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            try
            {
                if (context == null) return;
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var prosthetistQuoteForm = context.Deserialize<ProsthetistQuote>(stepData[0].ToString());

                prosthetistQuoteForm.CreatedDate = DateTimeHelper.SaNow;
                prosthetistQuoteForm.ModifiedDate = DateTimeHelper.SaNow;
                prosthetistQuoteForm.IsApproved = prosthetistQuoteForm.ProstheticQuotationType == ProstheticQuotationTypeEnum.Orthotic ? true : false;
                prosthetistQuoteForm.IsSentForReview = prosthetistQuoteForm.ProstheticQuotationType != ProstheticQuotationTypeEnum.Orthotic ? true : false;
                prosthetistQuoteForm.ProstheticQuoteStatus = prosthetistQuoteForm.ProstheticQuotationType == ProstheticQuotationTypeEnum.Orthotic ? ProstheticQuoteStatusEnum.Authorised : ProstheticQuoteStatusEnum.PendingReview;
                var prosthetistQuoteId = await _preAuthorisationService.AddProsthetistQuote(prosthetistQuoteForm).ConfigureAwait(false);
                prosthetistQuoteForm.ProsthetistQuoteId = prosthetistQuoteId;

                var recipients = await _userService.SearchUsersByPermission("Preauth manager view");

                var userReminders = new List<UserReminder>();

                foreach (var recipient in recipients)
                {
                    var userReminder = new UserReminder
                    {
                        AssignedToUserId = recipient.Id,
                        UserReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications,
                        UserReminderType = UserReminderTypeEnum.SystemNotification,
                        Text = $"New Prosthetic Auth Quotation submitted by: {RmaIdentity.UsernameOrBlank}",
                        AlertDateTime = DateTimeHelper.SaNow,
                        CreatedBy = RmaIdentity.UsernameOrBlank,
                        LinkUrl = $"/medicare/prosthetist-quote-view/{prosthetistQuoteId}"
                    };

                    userReminders.Add(userReminder);
                }

                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _userReminderService.CreateUserReminders(userReminders);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException($"Failed to create user reminder when capturing prosthetic quote - Error Message {ex.Message} StackTrace - {ex.StackTrace}");
                    }
                });


                if (prosthetistQuoteForm.ProstheticQuotationType != ProstheticQuotationTypeEnum.Orthotic)
                {

                    var reviewer = await _userService.GetUserLinkedToHealthCareProviderId(prosthetistQuoteForm.ReviewedBy.Value);

                    var prosthetistQuote = Mapper.Map<ProsthetistQuote>(prosthetistQuoteForm);

                    var startWizardRequest = new StartWizardRequest
                    {
                        Type = "review-preauth-prosthetist-quote",
                        LinkedItemId = prosthetistQuoteId,
                        Data = context.Serialize(prosthetistQuote),
                        AllowMultipleWizards = false,
                        LockedToUser = reviewer.Email
                    };

                    await _wizardService.StartWizard(startWizardRequest);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when capturing prosthetic quote - Error Message {ex.Message} StackTrace - {ex.StackTrace}");
            }
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            if (context == null) return;

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthForm = context.Deserialize<ProsthetistQuote>(stepData[0].ToString());
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
