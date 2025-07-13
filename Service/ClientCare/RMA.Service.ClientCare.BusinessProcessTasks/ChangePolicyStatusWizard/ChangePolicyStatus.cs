using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ChangePolicyStatusWizard
{
    public class ChangePolicyStatus : IWizardProcess
    {
        private readonly IPolicyCaseService _caseService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;

        public ChangePolicyStatus(
            IPolicyCaseService caseService,
            IRolePlayerPolicyService rolePlayerPolicyService
        )
        {
            _caseService = caseService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var data = context.Deserialize<Case>(context.Data);
            var caseModel = await _caseService.GetCaseByPolicyId(context.LinkedItemId);
            caseModel.CaseTypeId = (int)CaseTypeEnum.ChangePolicyStatus;
            caseModel.Code = data.Code;
            var stepData = new ArrayList() { caseModel };
            var label = $"Change Policy Status: {caseModel.Code} {caseModel.MainMember.Policies[0].PolicyNumber}";
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<Case>(stepData[0].ToString());
            var policy = @case.MainMember.Policies[0];
            await _rolePlayerPolicyService.ChangePolicyStatus(policy, "Changed in Change Policy Status wizard");
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<Case>(stepData[0].ToString());

            var existingPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(@case.MainMember.Policies[0].PolicyId);
            var oldPolicyStatus = existingPolicy.PolicyStatus;
            var newPolicyStatus = @case.MainMember.Policies[0].PolicyStatus;

            var ruleResults = new List<RuleResult>();

            if (oldPolicyStatus == newPolicyStatus)
                ruleResults.Add(GetRuleResult(false, "Policy status has not been changed"));
            if (!(new List<PolicyStatusEnum> { PolicyStatusEnum.Active, PolicyStatusEnum.Paused }).Contains(oldPolicyStatus))
                ruleResults.Add(GetRuleResult(false, "Policy status must be Active or Paused to be changed"));
            if (oldPolicyStatus == PolicyStatusEnum.Active && newPolicyStatus != PolicyStatusEnum.Paused)
                ruleResults.Add(GetRuleResult(false, $"Cannot change status from Active to {newPolicyStatus}"));
            if (oldPolicyStatus == PolicyStatusEnum.Paused && newPolicyStatus != PolicyStatusEnum.Active)
                ruleResults.Add(GetRuleResult(false, $"Cannot change status from Paused to {newPolicyStatus}"));

            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                OverallSuccess = ruleResults.Count == 0,
                RuleResults = ruleResults
            };
        }

        private RuleResult GetRuleResult(bool success, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = "Policy Status",
                MessageList = new List<string>() { message }
            };
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return Task.FromResult<string>(string.Empty);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
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

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
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
