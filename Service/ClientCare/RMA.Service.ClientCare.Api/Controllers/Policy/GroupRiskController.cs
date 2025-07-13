using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class GroupRiskController : RmaApiController
    {
        private readonly IGroupRiskService _groupRiskService;

        public GroupRiskController(
            IGroupRiskService groupRiskService
        )
        {
            _groupRiskService = groupRiskService;
        }

        [HttpPost("OverrideGroupRiskMemberVopd")]
        public async Task<ActionResult<bool>> Post([FromBody] VopdUpdateResponseModel vopdUpdateResponse)
        {
            var result = await _groupRiskService.OverrideGroupRiskMemberVopd(vopdUpdateResponse);
            return Ok(result);
        }

        [HttpPost("UploadGroupRisk/{fileName}/{schemeRolePlayerPayeeId}/{productOptionCode}")]
        public async Task<ActionResult<List<string>>> ImportGroupRisk(string fileName, int schemeRolePlayerPayeeId, string productOptionCode, [FromBody] FileContentImport content)
        {
            var errors = await _groupRiskService.ImportGroupRisk(fileName, schemeRolePlayerPayeeId, productOptionCode, content);
            return Ok(errors);
        }

        [HttpGet("VerifyGroupRiskImport/{fileIdentifier}")]
        public async Task<ActionResult<ImportInsuredLivesSummary>> VerifyGroupRiskImport(Guid fileIdentifier)
        {
            var result = await _groupRiskService.VerifyGroupRiskImport(fileIdentifier);
            return Ok(result);
        }

        [HttpGet("GroupRiskImportErrors/{fileIdentifier}")]
        public async Task<ActionResult<RuleRequestResult>> GroupRiskImportErrors(Guid fileIdentifier)
        {
            var errors = await _groupRiskService.GetGroupRiskImportErrors(fileIdentifier);
            return Ok(errors);
        }

        [HttpGet("GetStagedGroupRiskMembers/{fileIdentifier}")]
        public async Task<ActionResult<List<StageGroupRiskMember>>> GetStagedGroupRiskMembers(Guid fileIdentifier)
        {
            var result = await _groupRiskService.GetStagedGroupRiskMembers(fileIdentifier);
            return Ok(result);
        }

        [HttpGet("GetGroupRiskVopdStatus/{fileIdentifier}")]
        public async Task<ActionResult<IEnumerable<MemberVopdStatus>>> GetGroupRiskVopdStatus(Guid fileIdentifier)
        {
            var result = await _groupRiskService.GetMemberVopdStatus(fileIdentifier);
            return Ok(result);
        }

    }
}