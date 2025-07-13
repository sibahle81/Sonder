using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class ClaimDisabilityController : RmaApiController
    {
        private readonly IClaimDisabilityService _claimDisabilityService;

        public ClaimDisabilityController(IClaimDisabilityService claimDisabilityService)
        {
            _claimDisabilityService = claimDisabilityService;
        }

        [HttpPost("CreateClaimDisabilityPension")]
        public async Task<ActionResult<Earning>> CreateClaimDisabilityPension(ClaimDisabilityPension claimDisabilityPension)
        {
            var result = await _claimDisabilityService.AddClaimDisabilityPension(claimDisabilityPension);
            return Ok(result);
        }

        [HttpPost("UpdateClaimDisabilityPension")]
        public async Task<ActionResult<ClaimDisabilityPension>> UpdateClaimDisabilityPension(ClaimDisabilityPension claimDisabilityPension)
        {
            var results = await _claimDisabilityService.UpdateClaimDisabilityPension(claimDisabilityPension);
            return Ok(results);
        }

        [HttpGet("GetClaimDisabilityPensionByPersonEventId/{personEventId}")]
        public async Task<ActionResult<ClaimDisabilityPension>> GetClaimDisabilityPensionByPersonEventId(int personEventId)
        {
            return await _claimDisabilityService.GetClaimDisabilityPensionByPersonEventId(personEventId);
        }

        [HttpGet("GetPagedClaimDisabilityAssessmentsHistory/{personEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimDisabilityAssessmentResult>>> GetPagedClaimDisabilityAssessmentsHistory(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var result = await _claimDisabilityService.GetPagedClaimDisabilityAssessmentsHistory(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return Ok(result);
        }

        [HttpGet("GetPagedClaimHearingAssessment/{personEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimHearingAssessment>>> GetPagedClaimHearingAssessment(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var result = await _claimDisabilityService.GetPagedClaimHearingAssessment(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return Ok(result);
        }
    }
}
