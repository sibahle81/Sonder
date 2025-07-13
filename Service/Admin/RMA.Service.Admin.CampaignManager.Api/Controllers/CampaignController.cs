using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Security;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{

    public class CampaignController : RmaApiController
    {
        private readonly ICampaignService _campaignService;
        private readonly ILastViewedService _lastViewedService;

        public CampaignController(ICampaignService campaignService, ILastViewedService lastViewedService)
        {
            _campaignService = campaignService;
            _lastViewedService = lastViewedService;
        }

        [HttpGet()]
        public async Task<ActionResult<IEnumerable<Campaign>>> Get()
        {
            var campaigns = await _campaignService.GetCampaigns();
            return Ok(campaigns);
        }
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<Campaign>> Get(int id)
        {
            var campaign = await _campaignService.GetCampaign(id);
            return Ok(campaign);
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Campaign>>> SearchCampaigns(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var campaign = await _campaignService.SearchCampaigns(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(campaign);
        }

        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<Campaign>>> CampaignLastViewed()
        {
            var clients = await _lastViewedService.GetLastViewedCampaigns(RmaIdentity.Email);
            return Ok(clients);
        }

        [HttpGet("Owner/{owner}")]
        public async Task<ActionResult<IEnumerable<Campaign>>> GetCampaignsByOwner(string owner)
        {
            var campaign = await _campaignService.GetCampaignsByOwner(owner);
            return Ok(campaign);
        }

        [HttpGet("Owners")]
        public async Task<ActionResult<IEnumerable<Campaign>>> GetCampaignsByOwners([FromBody] string[] owners)
        {
            var campaign = await _campaignService.GetCampaignsByOwners(owners);
            return Ok(campaign);
        }

        [HttpGet("Role/{role}")]
        public async Task<ActionResult<IEnumerable<Campaign>>> GetCampaignsByRole(string role)
        {
            var campaign = await _campaignService.GetCampaignsByRole(role);
            return Ok(campaign);
        }
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Campaign campaign)
        {
            var id = await _campaignService.AddCampaign(campaign);
            return Ok(id);
        }

        [HttpPost("Copy/{id}")]
        public async Task<ActionResult<int>> CopyCampaign(int id)
        {
            var campaignId = await _campaignService.CopyCampaign(id);
            return Ok(campaignId);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Campaign campaign)
        {
            await _campaignService.EditCampaign(campaign);
            return Ok();
        }

        [HttpPut("Review")]
        public async Task<ActionResult> Review([FromBody] Campaign campaign)
        {
            await _campaignService.ReviewCampaign(campaign);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _campaignService.Delete(id);
            return Ok();
        }
    }
}