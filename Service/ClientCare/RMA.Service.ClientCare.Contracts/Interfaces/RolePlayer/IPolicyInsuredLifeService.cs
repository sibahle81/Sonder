using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer
{
    public interface IPolicyInsuredLifeService : IService
    {
        Task<List<PolicyInsuredLife>> GetPolicyInsuredLives(int policyId);
        Task<List<PolicyInsuredLife>> GetPolicyInsuredLivesForPolicyOwners(List<int> policyIds);
        Task<PolicyInsuredLife> GetPolicyInsuredForPolicyOwner(int policyId, int rolePlayerId);
        Task<bool> IsPolicyMainMember(int policyId, int rolePlayerId);
        Task<int> GetPolicyMainMember(int policyId, int rolePlayerId);
    }
}
