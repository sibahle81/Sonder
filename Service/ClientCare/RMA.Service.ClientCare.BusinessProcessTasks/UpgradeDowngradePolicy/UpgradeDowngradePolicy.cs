using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.UpgradePolicy
{
    public class UpgradeDowngradePolicy : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IBenefitService _benefitService;

        public UpgradeDowngradePolicy(
            IPolicyService policyService,
            IBenefitService benefitService
        )
        {
            _policyService = policyService;
            _benefitService = benefitService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var caseModel = context.Deserialize<UpgradeDownGradePolicyCase>(context.Data);
            var label = $"Upgrade / Downgrade Policy Case: {caseModel.Code}";
            var stepData = new ArrayList() { caseModel };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<UpgradeDownGradePolicyCase>(stepData[0].ToString());

            await _policyService.UpgradeDowngradePolicy(@case);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var result = new RuleRequestResult
            {
                RequestId = new Guid(),
                OverallSuccess = true,
                RuleResults = new List<RuleResult>()
            };
            return await Task.FromResult<RuleRequestResult>(result);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return Task.FromResult(string.Empty);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
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

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
