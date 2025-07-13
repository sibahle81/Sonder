using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class TargetAudienceController : RmaApiController
    {
        private readonly ITargetAudienceService _targetAudienceService;

        public TargetAudienceController(ITargetAudienceService importAudienceService)
        {
            _targetAudienceService = importAudienceService;
        }

        [HttpGet("Companies/ByIds")]
        public async Task<ActionResult<IEnumerable<TargetCompany>>> GetTargetCompanies([FromBody] int[] companyIds)
        {
            var companies = await _targetAudienceService.GetTargetCompanies(companyIds.ToList());
            return Ok(companies);
        }

        [HttpGet("Persons/ByIds")]
        public async Task<ActionResult<IEnumerable<TargetPerson>>> GetTargetPersons([FromBody] int[] personIds)
        {
            var persons = await _targetAudienceService.GetTargetPersons(personIds.ToList());
            return Ok(persons);
        }

        [HttpGet("Campaign/{id}")]
        public async Task<ActionResult<IEnumerable<TargetAudience>>> Get([FromRoute] int id)
        {
            var audience = await _targetAudienceService.GetTargetAudienceByCampaignId(id);
            return Ok(audience);
        }

        [HttpPost("Members/Import")]
        public async Task<ActionResult<ImportFile>> Post([FromBody] ImportRequest request)
        {
            if (request != null)
            {
                var importFile = await _targetAudienceService.FindOrCreateImportFile(request.CampaignId, request.FileToken);
                var count = await _targetAudienceService.ImportAudience(request, importFile);
                return Ok(count);
            }
            return Ok();
        }
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] TargetAudience targetAudience)
        {
            var count = await _targetAudienceService.AddTargetAudience(targetAudience);
            return Ok(count);
        }

        [HttpPost("Members/Save")]
        public async Task<ActionResult<int>> PostClients([FromBody] List<TargetAudience> targetAudience)
        {
            var count = await _targetAudienceService.AddTargetAudienceByList(targetAudience);
            return Ok(count);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] TargetAudience targetAudience)
        {
            await _targetAudienceService.AddTargetAudience(targetAudience);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _targetAudienceService.RemoveTargetAudience(id);
            return Ok();
        }
    }
}