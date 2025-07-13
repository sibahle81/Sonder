using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IStateProvinceService : IService
    {
        Task<List<StateProvince>> GetStateProvinces();
        Task<List<StateProvince>> GetStateProvincesByCountry(int id);
        Task<StateProvince> GetStateProvinceByName(string name);
        Task<StateProvince> GetStateProvinceById(int id);
    }
}