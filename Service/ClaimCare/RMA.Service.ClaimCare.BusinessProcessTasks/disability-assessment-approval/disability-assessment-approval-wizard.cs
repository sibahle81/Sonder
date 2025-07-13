using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class DisabilityAssessmentApprovalWizard : IWizardProcess
    {
        private readonly IClaimService _claimService;

        public DisabilityAssessmentApprovalWizard(
              IClaimService claimService)
        {
            _claimService = claimService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var personEvent = context.Deserialize<PersonEvent>(context.Data);

            var action = "Edit";

            var label = $"{action} disability assessment for PEV reference number - ({personEvent.PersonEventReferenceNumber})";

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

            await _claimService.NotifyPersonEventOwnerOrDefaultRole(personEvent.PersonEventId, "Disability assessment was completed", "Clinical Claims Adjudicator");
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