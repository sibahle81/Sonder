using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ICauseOfDeathService : IService
    {
        Task<List<CauseOfDeathType>> GetCauseOfDeathList(int typeOfDeathId);
        Task<CauseOfDeathType> GetCauseOfDeathById(int typeOfDeathId);
    }
}