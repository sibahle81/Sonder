using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.Integrations.Contracts.Entities.CompCare;

using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IClaimIntegrationService : IService
    {
        Task<RootCCClaimResponse> PostClaimRequest(RootCCClaimRequest claimRequest);
        Task<ClaimResponse> GetClaim(ClaimRequest claimRequest);
        Task<ClaimResponse> GetClaimByClaimId(int claimId);
        Task<PensionCaseNotificationResponse> GeneratePensionCaseNotification(Entities.Claim claim);
    }
}