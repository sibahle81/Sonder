using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class SmsTokenController : RmaApiController
    {
        private readonly ISmsTokenService _smsTokenService;

        public SmsTokenController(ISmsTokenService smsTokenService)
        {
            _smsTokenService = smsTokenService;
        }

        [HttpGet("{smsId}")]
        public async Task<ActionResult<IEnumerable<SmsToken>>> Get(int smsId)
        {
            var tokens = await _smsTokenService.GetTokens(smsId);
            return Ok(tokens);
        }

        [HttpPut]
        public async Task<ActionResult<bool>> Put([FromBody] List<SmsToken> tokens)
        {
            var count = await _smsTokenService.SaveTokens(tokens);
            return Ok(count > 0);
        }

        [HttpDelete("{smsId}")]
        public async Task<ActionResult<int>> Delete(int id)
        {
            var count = await _smsTokenService.DeleteTokens(id);
            return Ok(count);
        }
    }
}