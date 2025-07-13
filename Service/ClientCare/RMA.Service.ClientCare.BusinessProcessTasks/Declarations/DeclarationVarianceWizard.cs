using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.DeclarationVarianceWizard
{
    public class DeclarationVarianceWizard : IWizardProcess
    {
        private readonly IDeclarationService _declarationService;
        private readonly IPolicyService _policyService;

        public DeclarationVarianceWizard(
            IDeclarationService declarationService,
            IPolicyService policyService)
        {
            _declarationService = declarationService;
            _policyService = policyService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var policies = context?.Deserialize<List<Contracts.Entities.Policy.Policy>>(context.Data);

            var label = "Variance Review for " + policies[0].PolicyOwner.DisplayName + " (" + policies[0].PolicyOwner.FinPayee.FinPayeNumber + ")";
            var stepData = new ArrayList() { policies };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policies = context.Deserialize<List<Contracts.Entities.Policy.Policy>>(stepData[0].ToString());

            foreach (var policy in policies)
            {
                var _policy = await _policyService.GetPolicy(policy.PolicyId);
                policy.ExpiryDate = _policy.ExpiryDate;
            }

            await _declarationService.RenewPolicies(policies);
        }

        #region Not Implemented
        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return GetRuleRequestResult(true, ruleResults);
        }

        private RuleRequestResult GetRuleRequestResult(bool success, List<RuleResult> results)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = results,
                OverallSuccess = success
            };
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task CancelWizard(IWizardContext context)
        {
            return;
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
        #endregion
    }
}
