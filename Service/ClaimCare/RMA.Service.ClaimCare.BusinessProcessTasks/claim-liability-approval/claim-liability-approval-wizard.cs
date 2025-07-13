using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
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
    public class ClaimLiabilityApprovalWizard : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimService _claimService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public ClaimLiabilityApprovalWizard(
              IEventService eventService
            , IRolePlayerService rolePlayerService
            , IClaimService claimService
            , ICommonSystemNoteService commonSystemNoteService)
        {
            _eventService = eventService;
            _rolePlayerService = rolePlayerService;
            _claimService = claimService;
            _commonSystemNoteService = commonSystemNoteService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var personEvent = context.Deserialize<PersonEvent>(context.Data);
            var person = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);

            var label = $"Claim Liability Approval: ({personEvent.PersonEventReferenceNumber}) {person.DisplayName}";

            var stepData = new ArrayList() { personEvent };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);

            var personEvent = context.Deserialize<PersonEvent>(stepData[0].ToString());

            var noteText = $"Liability has been accepted for PEV ({ personEvent.PersonEventReferenceNumber })";
            var defaultRoleName = "Claims Management Consultant";

            if (!string.IsNullOrEmpty(noteText))
            {
                await Task.Run(() => _claimService.NotifyPersonEventOwnerOrDefaultRole(context.LinkedItemId, noteText, defaultRoleName));
            }
        }
        
        #region not implemented

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
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
