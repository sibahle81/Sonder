using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class EmailTokenController : RmaApiController
    {
        private readonly IEmailTokenService _emailTokenService;

        public EmailTokenController(IEmailTokenService emailTokenService)
        {
            _emailTokenService = emailTokenService;
        }

        [HttpGet("{emailId}")]
        public async Task<ActionResult<IEnumerable<EmailToken>>> Get(int emailId)
        {
            var tokens = await _emailTokenService.GetTokens(emailId);
            return Ok(tokens);
        }

        [HttpPut]
        public async Task<ActionResult<bool>> Put([FromBody] List<EmailToken> tokens)
        {
            var count = await _emailTokenService.SaveTokens(tokens);
            return Ok(count > 0);
        }

        [HttpDelete("{emailId}")]
        public async Task<ActionResult<int>> Delete(int emailId)
        {
            var count = await _emailTokenService.DeleteTokens(emailId);
            return Ok(count);
        }
    }
}