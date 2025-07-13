using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class ConsolidatedFuneralController : RmaApiController
    {
        private readonly IConsolidatedFuneralService _consolidatedFuneralService;
        private readonly IGroupRiskService _groupRiskService;
        private readonly IMyValuePlusService _myValuePlusService;


        public ConsolidatedFuneralController(
            IConsolidatedFuneralService consolidatedFuneralService,
            IGroupRiskService groupRiskService,
            IMyValuePlusService myValuePlusService)
        {
            _consolidatedFuneralService = consolidatedFuneralService;
            _groupRiskService = groupRiskService;
            _myValuePlusService = myValuePlusService;
        }

        [HttpPost("OverrideCfpMemberVopd")]
        public async Task<ActionResult<bool>> Post([FromBody] VopdUpdateResponseModel vopdUpdateResponse)
        {
            var result = await _consolidatedFuneralService.OverrideCfpMemberVopd(vopdUpdateResponse);
            _ = await _groupRiskService.OverrideGroupRiskMemberVopd(vopdUpdateResponse);
            _ = await  _myValuePlusService.OverrideMvpMemberVopd(vopdUpdateResponse);
            return Ok(result);
        }

        [HttpPost("ProcessPolicyRequestReferenceMessage")]
        public async Task<ActionResult<bool>> ProcessPolicyRequestReferenceMessageAsync([FromBody] PolicyRequestReferenceMessage policyRequestReferenceMessage)
        {
            var result = await _consolidatedFuneralService.ProcessPolicyRequestReferenceMessageAsync(policyRequestReferenceMessage);
            return Ok(result);
        }
    }
}