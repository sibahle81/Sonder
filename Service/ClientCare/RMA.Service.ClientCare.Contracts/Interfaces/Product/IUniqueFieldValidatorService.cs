using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IUniqueFieldValidatorService : IService
    {
        Task<bool> Exists(UniqueValidationRequest request);
    }
}