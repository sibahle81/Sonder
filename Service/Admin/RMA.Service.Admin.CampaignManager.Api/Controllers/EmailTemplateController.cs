using Microsoft.AspNetCore.Mvc;

using RMA.Common.Security;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class EmailTemplateController : RmaApiController
    {
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly ILastViewedService _lastViewedService;

        public EmailTemplateController(
            IEmailTemplateService emailTemplateService,
            ILastViewedService lastViewedService
        )
        {
            _emailTemplateService = emailTemplateService;
            _lastViewedService = lastViewedService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmailTemplate>>> GetAllTemplates()
        {
            var templates = await _emailTemplateService.GetEmailTemplates();
            return Ok(templates);
        }

        [HttpGet("Marketing")]
        public async Task<ActionResult<IEnumerable<EmailTemplate>>> GetMarketingTemplates()
        {
            var templates = await _emailTemplateService.GetMarketingEmailTemplates();
            return Ok(templates);
        }

        [HttpGet("Search/{query}")]
        public async Task<ActionResult<IEnumerable<EmailTemplate>>> Search(string query)
        {
            var templates = await _emailTemplateService.SearchTemplates(query, true);
            return Ok(templates);
        }

        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<EmailTemplate>>> TemplateLastViewed()
        {
            var templates = await _lastViewedService.GetLastViewedEmailTemplates(RmaIdentity.Email);
            return Ok(templates);
        }

        [HttpGet("Campaign/{campaignId}")]
        public async Task<ActionResult<IEnumerable<EmailTemplate>>> GetCampaignTemplates(int campaignId)
        {
            var templates = await _emailTemplateService.GetCampaignTemplates(campaignId);
            return Ok(templates);
        }

        [HttpGet("ById/{id}")]
        public async Task<ActionResult<EmailTemplate>> Get(int id)
        {
            var templates = await _emailTemplateService.GetEmailTemplate(id);
            return Ok(templates);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] EmailTemplate emailTemplate)
        {
            var template = await _emailTemplateService.AddEmailTemplate(emailTemplate);
            return Ok(template);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] EmailTemplate emailTemplate)
        {
            await _emailTemplateService.EditEmailTemplate(emailTemplate);
            return Ok();
        }
    }
}