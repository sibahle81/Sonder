using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.MoveBrokerPolicy
{
    public class MoveBrokerPolicyWizard : IWizardProcess
    {
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IRepresentativeService _representativeService;

        public MoveBrokerPolicyWizard(IRolePlayerPolicyService rolePlayerPolicyService,
            IRepresentativeService representativeService)
        {
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _representativeService = representativeService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            RmaIdentity.DemandPermission(Permissions.CreatemoveagentpolicyWizard);
            var caseModel = context.Deserialize<MovePoliciesCase>(context.Data);
            var label = $"Move Broker Policies Case: {caseModel.Code}";
            caseModel.PolicyMovement.EffectiveDate = DateTime.MinValue;
            if (caseModel.IsReclaimingPolicies)
            {
                var policyMovement = await _rolePlayerPolicyService.VerifyPolicyMovementExists(caseModel.PolicyMovement.MovementRefNo);
                caseModel.PolicyMovement.SourceBrokerage = policyMovement.DestinationBrokerage;
                caseModel.PolicyMovement.Policies = policyMovement.Policies;
                var destinationRep = await _representativeService.GetRepresentative(policyMovement.DestinationRep.Id);
                caseModel.PolicyMovement.SourceRep = destinationRep;
                if (destinationRep.ActiveBrokerage?.JuristicRepId != null)
                {
                    caseModel.JuristicRepresentativeId = destinationRep.ActiveBrokerage.JuristicRepId;
                    if (destinationRep.ActiveBrokerage.JuristicRepId > 0)
                    {
                        caseModel.JuristicRepresentative =
                            await _representativeService.GetRepresentative(destinationRep.ActiveBrokerage.JuristicRepId
                                .Value);
                    }
                }
            }

            var stepData = new ArrayList() { caseModel };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var movePoliciesCase = context.Deserialize<MovePoliciesCase>(stepData[0].ToString());
            movePoliciesCase.PolicyMovement.MovementRefNo = movePoliciesCase.Code;
            await _rolePlayerPolicyService.MovePolicies(movePoliciesCase);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var result = new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            };
            return Task.FromResult(result);
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

