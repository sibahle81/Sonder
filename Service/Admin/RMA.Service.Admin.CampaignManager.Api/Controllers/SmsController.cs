using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class SmsController : RmaApiController
    {
        private readonly ISmsService _smsService;

        public SmsController(ISmsService smsService)
        {
            _smsService = smsService;
        }

        [HttpGet("GetContent/ById/{smsId}")]
        public async Task<ActionResult<MessageContent>> GetContent(int smsId)
        {
            var content = await _smsService.GetSmsContentById(smsId);
            return Ok(content);
        }

        [HttpGet("GetContent")]
        public async Task<ActionResult<MessageContent>> GetContent([FromBody] Sms sms)
        {
            var content = await _smsService.GetSmsContent(sms);
            return Ok(content);
        }

        [HttpGet("Campaign/{campaignId}")]
        public async Task<ActionResult<Sms>> GetCampaignSms(int campaignId)
        {
            var sms = await _smsService.GetCampaignSms(campaignId);
            return Ok(sms);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sms>> Get(int id)
        {
            var sms = await _smsService.GetSms(id);
            return Ok(sms);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Sms sms)
        {
            var smsId = await _smsService.AddSms(sms);
            return Ok(smsId);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Sms sms)
        {
            await _smsService.EditSms(sms);
            return Ok();
        }
    }
}