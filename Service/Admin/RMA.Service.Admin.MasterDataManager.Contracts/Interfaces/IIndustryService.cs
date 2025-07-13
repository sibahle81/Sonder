using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IIndustryService : IService
    {
        Task<List<Industry>> GetIndustries();
        Task<Industry> GetIndustry(int id);
        Task<List<Industry>> GetIndustriesByIndustryClassId(IndustryClassEnum industryClass);
    }
}