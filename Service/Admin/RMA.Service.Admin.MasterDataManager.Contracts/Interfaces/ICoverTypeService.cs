using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ICoverTypeService : IService
    {
        Task<List<Lookup>> GetCoverTypes();
        Task<List<Lookup>> GetCoverTypesByIds(List<int> ids);
        Task<List<Lookup>> GetCoverTypesByProduct(string product);
    }
}