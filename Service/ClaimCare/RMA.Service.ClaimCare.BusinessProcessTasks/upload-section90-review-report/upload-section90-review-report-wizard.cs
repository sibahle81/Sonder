using Newtonsoft.Json;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class UploadSection90ReviewReportWizard : IWizardProcess
    {
        private readonly IUserService _userService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IUserReminderService _userReminderService;

        public UploadSection90ReviewReportWizard(
              IUserService userService
            , ICommonSystemNoteService commonSystemNoteService
            , IUserReminderService userReminderService)
        {
            _userService = userService;
            _commonSystemNoteService = commonSystemNoteService;
            _userReminderService = userReminderService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var personEvent = context.Deserialize<PersonEvent>(context.Data);

            var label = $"Upload section 90 liability decision review notice for PEV reference number: ({personEvent.PersonEventReferenceNumber})";

            var stepData = new ArrayList() { personEvent };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var personEvent = context.Deserialize<PersonEvent>(stepData[0].ToString());

            await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = "Section 90 review notice workflow completed",
                IsActive = true
            });

            await NotifyPersonEventOwnerAfterGracePeriod(personEvent, "This is a reminder that the 7 day period for employer/employee to respond has passed", wizard.LockedToUser);
        }

        public async Task NotifyPersonEventOwnerAfterGracePeriod(PersonEvent personEvent, string message, string lockedToUser)
        {
            Contract.Requires(personEvent != null);

            var user = await _userService.GetUserByEmail(lockedToUser);

            if (user != null)
            {
                var userReminder = new UserReminder
                {
                    AlertDateTime = DateTimeHelper.SaNow.AddDays(7),
                    AssignedToUserId = user.Id,
                    AssignedByUserId = RmaIdentity.UserId,
                    UserReminderType = UserReminderTypeEnum.Reminder,
                    UserReminderItemType = UserReminderItemTypeEnum.Claim,
                    ItemId = personEvent.PersonEventId,
                    Text = $"{message}: PEV Ref: {personEvent.PersonEventReferenceNumber}",
                    LinkUrl = "/claimcare/claim-manager/holistic-claim-view/" + personEvent.EventId + "/" + personEvent.PersonEventId
                };

                await _userReminderService.CreateUserReminder(userReminder);
            }
        }

        #region not implimented
        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();

            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            });
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult(string.Empty);
        }

        public  Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public  Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        #endregion
    }
}
