using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IGeneratePolicyScheduleService : IService
    {
        Task<FormLetterResponse> GeneratePolicySchedule(int policyId);
        Task SendSchedule(SendScheduleRequest request);
        Task SendPolicyDocuments(int wizardId, Case caseModel);
    }
}