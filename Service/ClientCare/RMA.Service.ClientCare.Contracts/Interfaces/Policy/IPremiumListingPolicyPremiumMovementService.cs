using Microsoft.ServiceFabric.Services.Remoting;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPremiumListingPolicyPremiumMovementService : IService
    {
        Task<bool> ProcessPremiumListingPolicyPremiumMovement();
    }
}