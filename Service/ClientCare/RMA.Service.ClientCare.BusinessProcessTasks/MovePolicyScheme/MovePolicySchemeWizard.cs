using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.MovePolicyScheme
{
    public class MovePolicySchemeWizard : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyCommunicationService _communicationService;

        public MovePolicySchemeWizard(
            IPolicyService policyService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyCommunicationService communicationService
        )
        {
            _policyService = policyService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _communicationService = communicationService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var caseModel = context.Deserialize<MoveSchemeCase>(context.Data);
            var label = $"Move Policy Scheme Case: {caseModel.Code}";
            var stepData = new ArrayList() { caseModel };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<MoveSchemeCase>(stepData[0].ToString());

            var sourcePolicy = await _policyService.GetPolicy(@case.SourcePolicyId);
            var targetPolicy = await _policyService.GetPolicy(@case.DestinationPolicyId);

            // Create a policy movement if the brokarages or representatives differ
            int? policyMovementId = null;

            var effectiveDate = DateTimeHelper.StartOfTheMonth(DateTime.UtcNow).AddMonths(1);
            if (sourcePolicy.BrokerageId != targetPolicy.BrokerageId || sourcePolicy.RepresentativeId != targetPolicy.RepresentativeId)
            {
                // Create one policy movement which will be reference by all the child policies
                policyMovementId = await _policyService.CreatePolicyMovement(
                    @case.Code,
                    sourcePolicy.BrokerageId,
                    sourcePolicy.RepresentativeId,
                    targetPolicy.BrokerageId,
                    targetPolicy.RepresentativeId,
                    effectiveDate);
            }

            // Move the list of policies from the one scheme to the other
            await _rolePlayerPolicyService.MovePolicyScheme(sourcePolicy, targetPolicy, @case.PolicyIds, policyMovementId, effectiveDate);

            // Update the group policy premiums
            await _rolePlayerPolicyService.UpdateChildPolicyPremiums(sourcePolicy.PolicyId);
            await _rolePlayerPolicyService.UpdateChildPolicyPremiums(targetPolicy.PolicyId);

            // Send policy member notifications
            _ = Task.Run(() => _rolePlayerPolicyService.SendPolicyMovedCommunications(targetPolicy, @case.PolicyIds, effectiveDate));
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<MoveSchemeCase>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();

            var sourcePolicy = await _policyService.GetPolicy(@case.SourcePolicyId);
            var targetPolicy = await _policyService.GetPolicy(@case.DestinationPolicyId);

            var activeStatuses = new PolicyStatusEnum[] {
                PolicyStatusEnum.Active,
                PolicyStatusEnum.Transferred,
                PolicyStatusEnum.PendingFirstPremium,
                PolicyStatusEnum.Continued,
                PolicyStatusEnum.Reinstated
            };

            // Source and destination policies are active
            if (!activeStatuses.Contains(sourcePolicy.PolicyStatus))
            {
                ruleResults.Add(GetRuleResult("Source Policy Status", false, "The source policy is not active"));
            }
            if (!activeStatuses.Contains(targetPolicy.PolicyStatus))
            {
                ruleResults.Add(GetRuleResult("Target Policy Status", false, "The target policy is not active"));
            }

            // Product options on source and destination are the same
            if (sourcePolicy.ProductOptionId != targetPolicy.ProductOptionId)
            {
                ruleResults.Add(GetRuleResult("Group Product Option", false, "The source and target schemes' do not have the same product option"));
            }
            // Individual policies have been selected
            if (@case.PolicyIds.Count == 0)
            {
                ruleResults.Add(GetRuleResult("Child Policies", false, "No child policies have been selected"));
            }

            var errorCount = ruleResults.Count;
            if (errorCount == 0)
            {
                ruleResults.Add(GetRuleResult("Move Schemes", true, "All validations passed"));
            }
            var result = new RuleRequestResult()
            {
                OverallSuccess = errorCount == 0,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            };
            return result;
        }

        private RuleResult GetRuleResult(string ruleName, bool passed, string message)
        {
            return new RuleResult
            {
                RuleName = ruleName,
                Passed = passed,
                MessageList = new List<string> { message }
            };
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
            return await Task.FromResult<string>(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
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

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
