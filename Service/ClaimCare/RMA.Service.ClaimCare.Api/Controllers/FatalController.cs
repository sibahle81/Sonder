using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Threading.Tasks;

using ClaimRuleRequest = RMA.Service.ClaimCare.Contracts.Entities.RuleRequest;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    [Route("api/Claim/[controller]")]
    public class FatalController : RmaApiController
    {
        private readonly IFatalService _fatalService;

        public FatalController(IFatalService fatalService)
        {
            _fatalService = fatalService;
        }

        //GET: clm/api/fatal/GetFatal/{id}
        [HttpGet("GetFatal/{id}")]
        public async Task<ActionResult<PersonEvent>> GetFatal(int id)
        {
            var personEvent = await _fatalService.GetFatal(id);
            return Ok(personEvent);
        }

        //GET: clm/api/fatal/{personEvent}
        [HttpPost("ExecuteFuneralClaimRegistrationRules")]
        public async Task<FuneralRuleResult> ExecuteFuneralClaimRegistrationRules([FromBody] ClaimRuleRequest ruleRequest)
        {
            return await _fatalService.ExecuteFuneralClaimRegistrationRules(ruleRequest);
        }
    }
}