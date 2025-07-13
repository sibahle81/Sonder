using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClaimCare.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Cost
{
    public interface ICostService : IService
    {
        Task<ClaimsCalculatedAmount> CalculateBeneficiaryPayment(int claimId, int beneficiaryId);
    }
}