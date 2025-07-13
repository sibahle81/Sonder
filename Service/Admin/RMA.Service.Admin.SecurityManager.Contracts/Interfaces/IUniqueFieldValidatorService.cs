using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IUniqueFieldValidatorService : IService
    {
        Task<bool> Exists(UniqueValidationRequest request);
    }
}