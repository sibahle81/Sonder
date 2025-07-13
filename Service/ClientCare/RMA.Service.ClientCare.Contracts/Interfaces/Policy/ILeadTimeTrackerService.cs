using Microsoft.ServiceFabric.Services.Remoting;

using System.Collections.Generic;
using System.Threading.Tasks;

using PolicyRequestModel = RMA.Service.ClientCare.Contracts.Entities.Policy.CFP.PolicyRequest;
using PolicyRequestMvpModel = RMA.Service.ClientCare.Contracts.Entities.Policy.MVP.PolicyRequest;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface ILeadTimeTrackerService : IService
    {
        Task<bool> CreateLeadTimeTrackerAsyn(string messageId, PolicyRequestModel policyRequest);
        Task<bool> CreateLeadTimeTrackerMvpAsyn(string messageId, PolicyRequestMvpModel policyRequest);
        Task<bool> UpdateLeadTimeTrackerPolicyIdAsyn(string policyNumber, string leadClaimReference);
        Task<bool> UpdateLeadTimeTrackerQlinkTransactionIdAsyn(List<int> policyIds);
        Task<bool> UpdateLeadTimeTrackeWizardIdAsyn(int wizardId, string fileReference);
    }
}
