using Microsoft.ServiceFabric.Services.Remoting;

using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IMedicalItemFacadeService : IService
    {
        Task<decimal> GetMedicalItemToleranceAsync();
    }
}
