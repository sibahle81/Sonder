using Microsoft.ServiceFabric.Services.Remoting;

using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IBillingInterfaceService : IService
    {
        Task UpdateClaimRecoveryToRecovered(int claimRecoveryInvoiceId);
    }
}