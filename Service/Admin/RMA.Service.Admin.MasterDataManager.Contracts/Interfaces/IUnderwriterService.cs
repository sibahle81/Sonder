using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IUnderwriterService : IService
    {
        Task<List<Underwriter>> GetUnderwriters();
        Task<Underwriter> GetUnderwriter(int underwriterId);
        Task<string> GetUnderwriterName(int underwriterId);
    }
}
