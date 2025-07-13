using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IEligibilityService : IService
    {
        Task<List<Entities.Policy.Policy>> GetEligiblePolicies(EligiblePolicy eligiblePoliciesRequest);
    }
}
