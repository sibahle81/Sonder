using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class CaseClaimController : RmaApiController
    {
        private readonly ICaseClaimService _caseClaimService;

        public CaseClaimController(ICaseClaimService caseClaimService)
        {
            _caseClaimService = caseClaimService;
        }

        //GET: clm/api/CaseClaim
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CaseClaim>>> Get()
        {
            return Ok(await _caseClaimService.GetAll());
        }

        //GET: clm/api/CaseClaim/GetCaseClaimByFuneralId/{funeralId}
        [HttpGet("GetCaseClaimByFuneralId/{funeralId}")]
        public async Task<ActionResult<IEnumerable<CaseClaim>>> GetCaseClaimByFuneralId(int funeralId)
        {
            return Ok(await _caseClaimService.GetCaseClaimByFuneralId(funeralId));
        }

        //POST: clm/api/CaseClaim/{caseClaim}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] CaseClaim caseClaim)
        {
            var forensicPathologistId = await _caseClaimService.Create(caseClaim);
            return Ok(forensicPathologistId);
        }
    }
}
