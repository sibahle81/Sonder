using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ExpenseBasedPolicyWizard
{
    public class ReinstateExpenseBasedPolicyWizard : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentIndexService _documentIndexService;

        public ReinstateExpenseBasedPolicyWizard(
            IPolicyService policyService,
            IPolicyCommunicationService policyCommunicationService,
            IRolePlayerService rolePlayerService,
            IDocumentIndexService documentIndexService)
        {
            _policyService = policyService;
            _policyCommunicationService = policyCommunicationService;
            _rolePlayerService = rolePlayerService;
            _documentIndexService = documentIndexService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var policyStatusChangeAudit = context?.Deserialize<PolicyStatusChangeAudit>(context.Data);

            var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(policyStatusChangeAudit.PolicyId);
            policy.PolicyOwner = await _rolePlayerService.GetPolicyOwnerByPolicyId(policy.PolicyId);

            var productOptionName = policy.ProductOption.Name;

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.PendingReinstatement);

            var label = $"Reinstate {productOptionName} Policy: {policy.PolicyOwner.DisplayName}";
            var stepData = new ArrayList() { policyStatusChangeAudit };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.Active);

            await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.PolicyManager, "WizardId", wizard.Id.ToString(), "PolicyId", policyStatusChangeAudit.PolicyId.ToString());

            try
            {
                var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(policyStatusChangeAudit.PolicyId);
                policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                _ = Task.Run(() => _policyCommunicationService.SendReinstatePolicySchedule(policy, wizard.Id));
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }
        public async Task CancelWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            policyStatusChangeAudit.Reason = "Reinstate policy wizard cancelled/deleted";

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.Cancelled);
        }

        private async Task UpdatePolicyStatus(PolicyStatusChangeAudit policyStatusChangeAudit, PolicyStatusEnum policyStatus)
        {
            policyStatusChangeAudit.RequestedBy = RmaIdentity.Username;
            policyStatusChangeAudit.RequestedDate = DateTime.Now;
            policyStatusChangeAudit.EffectiveFrom = DateTime.Now;
            policyStatusChangeAudit.PolicyStatus = policyStatus;

            await _policyService.UpdatePolicyStatus(policyStatusChangeAudit);

            var dependentPolicies = await _policyService.GetDependentPolicies(policyStatusChangeAudit.PolicyId);

            if (dependentPolicies != null && dependentPolicies.Count > 0)
            {
                policyStatusChangeAudit.Reason += " (*via configured dependency(VAPS))";
                foreach (var dependentPolicy in dependentPolicies)
                {
                    policyStatusChangeAudit.PolicyId = dependentPolicy.PolicyId;
                    await _policyService.UpdatePolicyStatus(policyStatusChangeAudit);
                }
            }
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
