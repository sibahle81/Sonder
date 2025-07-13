using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class TargetAudienceMemberController : RmaApiController
    {
        private readonly ITargetAudienceMemberService _memberService;

        public TargetAudienceMemberController(ITargetAudienceMemberService memberService)
        {
            _memberService = memberService;
        }

        [HttpGet("Campaign/{campaignId}")]
        public async Task<ActionResult<IEnumerable<TargetAudienceMember>>> Get([FromRoute] int campaignId)
        {
            var members = await _memberService.GetAudienceMembers(campaignId);
            return Ok(members);
        }

        [HttpPost]
        public async Task<ActionResult<int>> SaveMembers([FromBody] List<TargetAudienceMember> members)
        {
            var count = await _memberService.SaveTargetAudienceMembers(members);
            return Ok(count);
        }
    }
}