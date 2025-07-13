using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.CancelPolicy
{
    public class StartWizard
    {
        private readonly IPolicyService _policyService;

        public StartWizard(IPolicyService policyService)
        {
            _policyService = policyService;
        }

        public async Task<int> Process(IWizardContext context)
        {
            _ = int.TryParse(context?.Data, out int policyId);
            var policy = await GetPolicy(policyId);

            var wizardId = await AddWizard(context, policy);
            return wizardId;
        }

        private async Task<Contracts.Entities.Policy.Policy> GetPolicy(int policyId)
        {
            return await _policyService.GetPolicy(policyId);
        }

        private async Task<int> AddWizard(IWizardContext context, Contracts.Entities.Policy.Policy policy)
        {
            var stepData = new ArrayList { policy };
            var id = await context.CreateWizard(policy.PolicyNumber, stepData);
            return id;
        }
    }
}
