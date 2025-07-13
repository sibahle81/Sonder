using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class MyValuePlusController : RmaApiController
    {
        private readonly IMyValuePlusService _myValuePlusService;
        private readonly IGroupRiskService _groupRiskService;


        public MyValuePlusController(
            IMyValuePlusService myValuePlusService,
            IGroupRiskService groupRiskService
        )
        {
            _myValuePlusService = myValuePlusService;
            _groupRiskService = groupRiskService;
        }

        [HttpPost("OverrideMvpMemberVopd")]
        public async Task<ActionResult<bool>> Post([FromBody] VopdUpdateResponseModel vopdUpdateResponse)
        {
            var result = await _myValuePlusService.OverrideMvpMemberVopd(vopdUpdateResponse);
            _ = await _groupRiskService.OverrideGroupRiskMemberVopd(vopdUpdateResponse);
            return Ok(result);
        }

        [HttpPost("ProcessPolicyRequestReferenceMessage")]
        public async Task<ActionResult<bool>> ProcessPolicyRequestReferenceMessageAsync([FromBody] PolicyRequestReferenceMessage policyRequestReferenceMessage)
        {
            var result = await _myValuePlusService.ProcessPolicyRequestReferenceMessageAsync(policyRequestReferenceMessage);
            return Ok(result);
        }
    }
}