using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.CancelPolicy
{
    public class SubmitWizard
    {
        private readonly IPolicyService _policyService;

        public SubmitWizard(IPolicyService policyService)
        {
            _policyService = policyService;
        }

        public async Task Process(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policy = context.Deserialize<Contracts.Entities.Policy.Policy>(stepData[0].ToString());

            await UpdatePolicy(policy);
        }

        private async Task UpdatePolicy(Contracts.Entities.Policy.Policy policy)
        {
            policy.PolicyStatus = PolicyStatusEnum.Cancelled;
            policy.CancellationInitiatedBy = "CancelOverduePendingCancelledPolicies";
            policy.CancellationInitiatedDate = DateTimeHelper.SaNow;
            await _policyService.EditPolicy(policy, true);
        }
    }
}
