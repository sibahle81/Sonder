using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClaimCare.Contracts.Entities;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IClaimDisabilityService : IService
    {
        Task<int> AddClaimDisabilityPension(ClaimDisabilityPension claimDisabilityPension);

        Task<bool> UpdateClaimDisabilityPension(ClaimDisabilityPension claimDisabilityPension);

        Task<ClaimDisabilityPension> GetClaimDisabilityPensionByPersonEventId(int personEventId);

        Task<PagedRequestResult<ClaimDisabilityAssessmentResult>> GetPagedClaimDisabilityAssessmentsHistory(PagedRequest pagedRequest, int personEventId);

        Task<PagedRequestResult<ClaimHearingAssessment>> GetPagedClaimHearingAssessment(PagedRequest pagedRequest, int personEventId);
    }
}