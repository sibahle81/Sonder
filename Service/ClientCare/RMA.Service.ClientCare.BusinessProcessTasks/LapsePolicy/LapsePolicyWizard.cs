using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.LapsePolicy
{
    public class LapsePolicyWizard : IWizardProcess
    {

        private const string AddPermission = "Create Lapse Policy Case";

        private readonly IPolicyCaseService _caseService;
        private readonly IPolicyService _policyService;

        public LapsePolicyWizard(
            IPolicyCaseService caseService,
            IPolicyService policyService
        )
        {
            _caseService = caseService;
            _policyService = policyService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            RmaIdentity.DemandPermission(AddPermission);

            var contextData = context.Deserialize<Case>(context.Data);
            var @case = await _caseService.GetCaseByPolicyId(context.LinkedItemId);
            @case.CaseTypeId = contextData.CaseTypeId;
            @case.Code = contextData.Code;
            var stepData = new ArrayList() { @case };

            var wizardId = await AddWizard(context, stepData);
            return await Task.FromResult(wizardId);
        }

        private async Task<int> AddWizard(IWizardContext context, ArrayList stepData)
        {
            var caseModel = stepData[0] as Case;
            var displayName = Enum.GetName(typeof(CaseTypeEnum), caseModel.CaseTypeId);
            var label = Regex.Replace(displayName, "(\\B[A-Z])", " $1");
            label = $"{label}: {caseModel.Code} - {caseModel.MainMember.DisplayName}";
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyCase = context.Deserialize<Case>(stepData[0].ToString());
            var policy = policyCase.MainMember.Policies[0];

            await _policyService.LapsePolicy(policy.PolicyNumber, policy.LapseEffectiveDate.Value.ToSaDateTime());
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
            return await Task.FromResult(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            });
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
