using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyCaseService : IService
    {
        Task<Case> GetCaseByPolicyId(int policyId);
        Task<decimal> GetTotalCoverAmount(IdTypeEnum idTypeId, string idNumber, int excludePolicyId);
        Task<Case> GetCaseForPolicyScheduleByPolicyId(int policyId);
     }
}
