using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class DiseaseController : RmaApiController
    {
        private readonly IDiseaseService _diseaseService;

        public DiseaseController(IDiseaseService diseaseService)
        {
            _diseaseService = diseaseService;
        }

        [HttpGet("GetDiseaseClaim/{claimId}")]
        public async Task<ActionResult> GetDiseaseClaim(int claimId)
        {
            var claim = await _diseaseService.GetDiseaseClaim(claimId);
            return Ok(claim);
        }

        [HttpGet("AutoAcknowledgeDiseaseClaim")]
        public async Task<ActionResult> AutoAcknowledgeDiseaseClaim()
        {
            await _diseaseService.AutoAcknowledgeDiseaseClaim();
            return Ok();
        }
    }
}