using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IInsuredLifeService : IService
    {
        Task<List<PolicyInsuredLife>> GetInsuredLives(int policyId);
        Task<PagedRequestResult<PolicyGroupMember>> GetGroupPolicyOnboardedMembers(int policyId, PagedRequest request);
        Task<PagedRequestResult<PolicyGroupMember>> GetGroupPolicyMainMembers(int policyId, PagedRequest request);
        Task<PagedRequestResult<PolicyInsuredLife>> GetPolicyInsuredLives(PagedRequest request, string filter, int status, bool isChildPolicy);
        Task<int> CreatePolicyInsuredLife(PolicyInsuredLife policyInsuredLife);
    }
}