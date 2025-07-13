using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ICommissionBandService : IService
    {
        Task<List<CommissionBand>> GetCommissionBands();
        Task<CommissionBand> GetCommissionBandById(int id);
        Task<int> AddCommissionBand(CommissionBand commissionBand);
        Task EditCommissionBand(CommissionBand commissionBand);
        Task RemoveCommissionBandRepository(int id);
        Task<CommissionBand> GetCommissionBandByName(string name);
    }
}
