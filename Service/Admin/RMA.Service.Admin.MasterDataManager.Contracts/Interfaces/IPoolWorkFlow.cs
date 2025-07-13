using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IPoolWorkFlow : IService
    {
        Task<int> UpdatePoolWorkFlow(PoolWorkFlow poolWorkFlow);
        Task<int> CreatePoolWorkFlow(PoolWorkFlow poolWorkFlow);
    }
}