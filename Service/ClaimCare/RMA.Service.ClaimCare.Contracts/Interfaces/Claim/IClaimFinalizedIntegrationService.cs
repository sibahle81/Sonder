using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.ClaimCare.Contracts.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IClaimFinalizedIntegrationService : IService
    {
        Task<bool> PublishPensionClaims(Entities.Claim claim);

        Task<List<PensionClaimPDRecoveries>> GetPensionClaimPDRecoveries(int rolePlayerId);
    }
}