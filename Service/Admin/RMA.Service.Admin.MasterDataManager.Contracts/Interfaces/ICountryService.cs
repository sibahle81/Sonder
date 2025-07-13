using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ICountryService : IService
    {
        Task<List<Country>> GetCountries();
        Task<Country> GetCountryById(int countryId);
        Task<Country> GetCountryByName(string name);
    }
}