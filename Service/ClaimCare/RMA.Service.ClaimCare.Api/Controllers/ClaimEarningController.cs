using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class ClaimEarningController : RmaApiController
    {
        private readonly IClaimEarningService _claimEarningService;

        public ClaimEarningController(IClaimEarningService claimEarningService)
        {
            _claimEarningService = claimEarningService;
        }

        [HttpPost("CreateEarning")]
        public async Task<ActionResult<Earning>> CreateEarning(Earning earning)
        {
            var result = await _claimEarningService.CreateEarning(earning);
            return Ok(result);
        }

        [HttpPost("UpdateEarning")]
        public async Task<ActionResult<Earning>> UpdateEarning(Earning earning)
        {
            var results = await _claimEarningService.UpdateEarning(earning);
            return Ok(results);
        }

        [HttpGet("GetEarning/{earningId}")]
        public async Task<ActionResult<Earning>> GetEarning(int earningId)
        {
            return await _claimEarningService.GetEarning(earningId);
        }

        [HttpGet("GetEarningsByPersonEventId/{personEventId}")]
        public async Task<ActionResult<List<Earning>>> GetEarningsByPersonEventId(int personEventId)
        {
            return await _claimEarningService.GetEarningsByPersonEventId(personEventId);
        }

        [HttpGet("GetEarningTypes/{isVariable}")]
        public async Task<ActionResult> GetEarningTypes(bool isVariable)
        {
            var results = await _claimEarningService.GetClaimEarningTypes(isVariable);
            return Ok(results);
        }

        [HttpGet("GetAllEarningTypes")]
        public async Task<ActionResult> GetAllEarningTypes()
        {
            var results = await _claimEarningService.GetAllEarningTypes();
            return Ok(results);
        }

        [HttpGet("NotifyToRecaptureEarnings/{personEventId}")]
        public async Task<ActionResult> NotifyToRecaptureEarnings(int personEventId)
        {
            var results = await _claimEarningService.NotifyToRecaptureEarnings(personEventId);
            return Ok(results);
        }
    }
}
