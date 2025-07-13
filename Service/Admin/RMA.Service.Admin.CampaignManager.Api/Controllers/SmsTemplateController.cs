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
    public class SmsTemplateController : RmaApiController
    {
        private readonly ILastViewedService _lastViewedService;
        private readonly ISmsTemplateService _smsTemplateService;

        public SmsTemplateController(
            ISmsTemplateService smsTemplateService,
            ILastViewedService lastViewedService
        )
        {
            _smsTemplateService = smsTemplateService;
            _lastViewedService = lastViewedService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SmsTemplate>>> Get()
        {
            var templates = await _smsTemplateService.GetSmsTemplates();
            return Ok(templates);
        }

        [HttpGet("ById/{id}")]
        public async Task<ActionResult<SmsTemplate>> Get([FromRoute] int id)
        {
            var templates = await _smsTemplateService.GetSmsTemplate(id);
            return Ok(templates);
        }

        [HttpGet("Search/{query}")]
        public async Task<ActionResult<IEnumerable<SmsTemplate>>> Search([FromRoute] string query)
        {
            var templates = await _smsTemplateService.SearchTemplates(query);
            return Ok(templates);
        }

        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<SmsTemplate>>> TemplateLastViewed()
        {
            var templates = await _lastViewedService.GetLastViewedSmsTemplates(RmaIdentity.Email);
            return Ok(templates);
        }

        [HttpGet("Campaign/{campaignId}")]
        public async Task<ActionResult<IEnumerable<EmailTemplate>>> GetCampaignTemplates(int campaignId)
        {
            var templates = await _smsTemplateService.GetCampaignTemplates(campaignId);
            return Ok(templates);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] SmsTemplate smsTemplate)
        {
            var template = await _smsTemplateService.AddSmsTemplate(smsTemplate);
            return Ok(template);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] SmsTemplate smsTemplate)
        {
            await _smsTemplateService.EditSmsTemplate(smsTemplate);
            return Ok();
        }
    }
}