using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IPoolWorkFlowService : IService
    {
        Task HandlePoolWorkFlow(PoolWorkFlow poolWorkFlow);
        Task<PoolWorkFlow> GetPoolWorkFlow(int itemId, WorkPoolEnum workPoolId);
        Task<List<int>> GetPoolWorkFlowClaimsAssignedToUser(int assignedToUserId);
        Task<PoolWorkFlow> GetPoolWorkFlowByTypeAndId(PoolWorkFlowRequest poolWorkFlowRequest);
    }
}