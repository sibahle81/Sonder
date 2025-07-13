using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class ClaimComplianceWizard : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IClaimService _claimService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public ClaimComplianceWizard(
              IEventService eventService,
              IClaimService claimService,
              IRolePlayerService rolePlayerService,
              ICommonSystemNoteService commonSystemNoteService
            )
        {
            _eventService = eventService;
            _claimService = claimService;
            _rolePlayerService = rolePlayerService;
            _commonSystemNoteService = commonSystemNoteService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var personEvent = context.Deserialize<PersonEvent>(context.Data);

            var employerRolePlayer = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.CompanyRolePlayerId));
            var employeeRolePlayer = personEvent.RolePlayer;

            var label = $"Compliance Review: Member Site: {employerRolePlayer.DisplayName} ({employerRolePlayer.FinPayee.FinPayeNumber}) PEV No: ({personEvent.PersonEventReferenceNumber}) Employee: ({employeeRolePlayer.DisplayName})";

            var stepData = new ArrayList() { personEvent };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var personEvent = context.Deserialize<PersonEvent>(stepData[0].ToString());

            if (personEvent.Claims?.Count > 0)
            {
                foreach (var claim in personEvent.Claims)
                {
                    claim.ClaimStatus = ClaimStatusEnum.Closed;
                    claim.ClaimStatusChangeDate = DateTime.Now;
                    claim.IsClosed = true;
                    claim.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Repudiated;
                }

                await _eventService.UpdatePersonEvent(personEvent);
            }

            await _claimService.NotifyPersonEventOwnerOrDefaultRole(personEvent.PersonEventId, $"Compliance review was completed by {wizard.LockedToUser}. Liability decision to repudiate was approved", "Claims Assessor");

            await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = $"Compliance review was completed by {wizard.LockedToUser}. Liability decision to repudiate was approved",
                IsActive = true
            });
        }

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

        public async Task CancelWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var personEvent = context.Deserialize<PersonEvent>(stepData[0].ToString());

            await _claimService.NotifyPersonEventOwnerOrDefaultRole(personEvent.PersonEventId, $"Compliance review was completed by {wizard.LockedToUser}. Liability decision to repudiate was rejected", "Claims Assessor");

            await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = $"Compliance review was completed by {wizard.LockedToUser}. Liability decision to repudiate was rejected",
                IsActive = true
            });

        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSaveStep(IWizardContext context)
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
    }
}
