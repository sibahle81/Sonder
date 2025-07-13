using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IPrimeRateService : IService
    {
        Task<PrimeRate> GetLatestPrimeRate();
        Task<int> AddPrimeRate(PrimeRate primeRate);
        Task<List<PrimeRate>> GetAllPrimeRates();
    }
}