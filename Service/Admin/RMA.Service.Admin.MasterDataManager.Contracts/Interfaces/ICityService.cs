using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ICityService : IService
    {
        Task<List<City>> GetCities();
        Task<List<City>> GetCityByProvince(int provinceId);
        Task<City> GetCityByName(string name);
        Task<City> GetCityById(int id);
        Task<PagedRequestResult<CityRetrieval>> SearchClientAddress(PagedRequest request);
    }
}