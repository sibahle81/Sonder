using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Member
{
    [Route("api/Member/[controller]")]

    public class LetterOfGoodStandingController : RmaApiController
    {
        private readonly ILetterOfGoodStandingService _letterOfGoodStandingService;

        public LetterOfGoodStandingController(ILetterOfGoodStandingService letterOfGoodStandingService)
        {
            _letterOfGoodStandingService = letterOfGoodStandingService;
        }

        [HttpGet("GetLetterOfGoodStanding/{letterOfGoodStandingId}")]
        public async Task<ActionResult<LetterOfGoodStanding>> GetLetterOfGoodStanding(int letterOfGoodStandingId)
        {
            var result = await _letterOfGoodStandingService.GetLetterOfGoodStanding(letterOfGoodStandingId);
            return Ok(result);
        }

        [HttpGet("GetPagedLetterOfGoodStanding/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<LetterOfGoodStanding>>> GetPagedLetterOfGoodStanding(int page = 1, int pageSize = 5, string orderBy = "createdDate", string sortDirection = "desc", string query = "")
        {
            var result = await _letterOfGoodStandingService.GetPagedLetterOfGoodStanding(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(result);
        }

        [HttpPost("ResendLetterOfGoodStanding")]
        public async Task<ActionResult<int>> ResendLetterOfGoodStanding([FromBody] Contracts.Entities.Policy.Policy policy)
        {
            var result = await _letterOfGoodStandingService.ResendLetterOfGoodStanding(policy);
            return Ok(result);
        }

        [HttpGet("GenerateLetterOfGoodStanding/{expiryDate}/{rolePlayerId}/{policyId}")]
        public async Task<ActionResult<bool>> GenerateLetterOfGoodStanding(DateTime expiryDate, int rolePlayerId, int policyId)
        {
            var result = await _letterOfGoodStandingService.GenerateLetterOfGoodStanding(expiryDate, rolePlayerId, policyId);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("ValidateLetterOfGoodStanding/{certificateNo}")]
        public async Task<ActionResult<bool>> ValidateLetterOfGoodStanding(string certificateNo)
        {
            var result = await _letterOfGoodStandingService.ValidateLetterOfGoodStanding(certificateNo);
            return Ok(result);
        }
    }
}