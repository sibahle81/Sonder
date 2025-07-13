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

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class ClaimInvestigationCoidWizard : IWizardProcess
    {
        private readonly IClaimService _claimService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public ClaimInvestigationCoidWizard(
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

            var employerRolePlayer = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.CompanyRolePlayerId));
            var employeeRolePlayer = personEvent.RolePlayer;

            if (personEvent.Claims?.Count > 0)
            {
                foreach (var claim in personEvent.Claims)
                {
                    claim.ClaimStatus = (bool)!personEvent.IsFatal ? ClaimStatusEnum.PendingInvestigations : claim.ClaimStatus;
                    await _claimService.UpdateClaim(claim);
                }
            }

            var label = $"Investigation: Member Site {employerRolePlayer.DisplayName}({employerRolePlayer.FinPayee.FinPayeNumber}) PEV Ref({personEvent.PersonEventReferenceNumber}) Employee({employeeRolePlayer.DisplayName})";

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

            await _claimService.NotifyPersonEventOwnerOrDefaultRole(personEvent.PersonEventId, "Investigation was completed", "Claims Assessor");

            await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = "Investigation was completed",
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

            if (personEvent.Claims?.Count > 0)
            {
                foreach (var claim in personEvent.Claims)
                {
                    claim.ClaimStatus = ClaimStatusEnum.Submitted;
                    await _claimService.UpdateClaim(claim);
                }
            }

            await _claimService.NotifyPersonEventOwnerOrDefaultRole(personEvent.PersonEventId, "Investigation was cancelled", "Claims Assessor");

            await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = "Investigation was cancelled",
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
    }
}
