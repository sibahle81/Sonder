using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class DisabilityAssessmentWizard : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IRolePlayerService _rolePlayerService;

        public DisabilityAssessmentWizard(
              IEventService eventService,
              IRolePlayerService rolePlayerService)
        {
            _eventService = eventService;
            _rolePlayerService = rolePlayerService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var claimDisabilityAssessment = context.Deserialize<ClaimDisabilityAssessment>(context.Data);

            var personEvent = await _eventService.GetPersonEvent(context.LinkedItemId);
            var memberSite = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.CompanyRolePlayerId));

            var label = $"Disability assessment: PEV Ref: {personEvent.PersonEventReferenceNumber} for incident at {memberSite.DisplayName} ({memberSite.FinPayee.FinPayeNumber}) for Employee: {personEvent.RolePlayer.DisplayName}";

            var stepData = new ArrayList() { claimDisabilityAssessment };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var claimDisabilityAssessment = context.Deserialize<ClaimDisabilityAssessment>(stepData[0].ToString());

            // todo
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

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }

        public async Task OnSaveStep(IWizardContext context)
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
    }
}