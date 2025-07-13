using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class SendEmailController : RmaApiController
    {
        private readonly ISendEmailService _emailService;

        public SendEmailController(ISendEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("Send")]
        public async Task<ActionResult<int>> SendEmail([FromBody] SendMailRequest sendRequest)
        {
            var status = await _emailService.SendEmail(sendRequest);
            return Ok(status);
        }

        [HttpPost("SendCampaign/{campaignId}")]
        public async Task<ActionResult<int>> SendCampaign(int campaignId)
        {
            var count = await _emailService.SendCampaign(campaignId);
            return Ok(count);
        }
    }
}
