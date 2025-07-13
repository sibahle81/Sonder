using Microsoft.AspNetCore.Mvc;

using RMA.Common.Security;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class LastViewedController : RmaApiController
    {
        private readonly ILastViewedService _lastViewedService;

        public LastViewedController(ILastViewedService lastViewedService)
        {
            _lastViewedService = lastViewedService;
        }

        [HttpGet("Templates")]
        public async Task<ActionResult<IEnumerable<CampaignTemplate>>> TemplatesLastViewed()
        {
            List<CampaignTemplate> templates = await _lastViewedService.GetLastViewedTemplates(RmaIdentity.Email);
            return Ok(templates);
        }
    }
}