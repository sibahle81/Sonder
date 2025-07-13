using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/[controller]")]
    public class AgeAnalysisController : RmaApiController
    {
        private readonly IAgeAnalysisService _ageAnalysisService;

        public AgeAnalysisController(IAgeAnalysisService ageAnalysisService)
        {
            _ageAnalysisService = ageAnalysisService;
        }

        [HttpPost("GetAgeAnalysis")]
        public async Task<ActionResult<List<AgeAnalysis>>> GetAgeAnalysis([FromBody] AgeAnalysisRequest ageAnalysisRequest)
        {
            var results = await _ageAnalysisService.GetAgeAnalysis(ageAnalysisRequest);
            return Ok(results);
        }


        [HttpPost("GetRecoveryAgeAnalysis")]
        public async Task<ActionResult<List<AgeAnalysis>>> GetRecoveryAgeAnalysis([FromBody] AgeAnalysisRequest ageAnalysisRequest)
        {
            var results = await _ageAnalysisService.GetRecoveryAgeAnalysis(ageAnalysisRequest);
            return Ok(results);
        }

        [HttpPost("AssignCollectionAgent")]
        public async Task<ActionResult<int>> AssignCollectionAgent([FromBody] CollectionAgent collectionAgent)
        {
            var count = await _ageAnalysisService.AssignCollectionAgent(collectionAgent);
            return Ok(count);
        }

        [HttpPost("SaveNote")]
        public async Task<ActionResult<AgeAnalysisNote>> SaveNote([FromBody] AgeAnalysisNote note)
        {
            var ageAnalysisNote = await _ageAnalysisService.SaveNote(note);
            return Ok(ageAnalysisNote);
        }

        [HttpPost("ImportCollectionAgents")]
        public async Task<ActionResult<int>> ImportCollectionAgents([FromBody] FileContentImport request)
        {
            var count = await _ageAnalysisService.ImportCollectionAgents(request?.Data);
            return Ok(count);
        }
    }
}
