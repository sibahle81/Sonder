using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks.Section_40_notification
{
    public class Section40Notification : IWizardProcess
    {
        private readonly IClaimService _claimService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public Section40Notification(
                    IClaimService claimService,
                    IRolePlayerService rolePlayerService,
                    ICommonSystemNoteService commonSystemNoteService
                  )
        {
            _claimService = claimService;
            _rolePlayerService = rolePlayerService;
            _commonSystemNoteService = commonSystemNoteService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var personEvent = context.Deserialize<PersonEvent>(context.Data);

            await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.CompanyRolePlayerId));
            var employeeRolePlayer = personEvent.RolePlayer;

            if (personEvent.Claims?.Count > 0)
            {
                foreach (var claim in personEvent.Claims)
                {
                    claim.ClaimStatus = (bool)!personEvent.IsFatal ? ClaimStatusEnum.PendingInvestigations : claim.ClaimStatus;
                    await _claimService.UpdateClaim(claim);
                }
            }

            var label = $"PEV Section 40 Notification : PEV No: ({personEvent.PersonEventReferenceNumber}) Employee: ({employeeRolePlayer.DisplayName})";

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
                    claim.ClaimStatus = ClaimStatusEnum.InvestigationCompleted;
                    await _claimService.UpdateClaim(claim);
                }
            }

            await _claimService.NotifyPersonEventOwnerOrDefaultRole(personEvent.PersonEventId, $"Section 40 Notification was acknowledged by {wizard.ModifiedBy}", "Claims Assessor Team Lead");

            await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = $"Section 40 Notification was acknowledged by {wizard.ModifiedBy}. Claim status changed from (Pending) to (Completed)",
                IsActive = true
            });
        }

        public async Task CancelWizard(IWizardContext context)
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
                    claim.ClaimStatus = ClaimStatusEnum.Submitted;
                    await _claimService.UpdateClaim(claim);
                }
            }

            await _claimService.NotifyPersonEventOwnerOrDefaultRole(personEvent.PersonEventId, $"Section 40 Notification was cancelled by {wizard.ModifiedBy}", "Claims Assessor Team Lead");

            await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = $"Section 40 Notification was cancelled by {wizard.ModifiedBy}. Claim status changed from (Pending Investigation) to (Submitted)",
                IsActive = true
            });

        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            return await Task.FromResult( new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                OverallSuccess = true,
                RuleResults = new List<RuleResult> { }
            });
        }
        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult(string.Empty);
        }
        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
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
        public Task OnSaveStep(IWizardContext context)
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
    }
}