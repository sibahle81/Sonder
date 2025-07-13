using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class ProcessController : RmaApiController
    {
        private readonly IProcessService _processService;

        public ProcessController(IProcessService processService)
        {
            _processService = processService;
        }

        // GET: cmp/api/Process/AddEnquiry/{callback}
        [HttpPost("AddEnquiry")]
        public async Task<ActionResult<bool>> AddEnquiry([FromBody] CallbackCampaign callback)
        {
            var result = await _processService.AddEnquiryCampaign(callback);
            return Ok(result);
        }

        // GET: cmp/api/Process/AddCallbackRequest/{callback}
        [HttpPost("AddCallbackRequest")]
        public async Task<ActionResult<bool>> AddCallbackRequest([FromBody] CallbackCampaign callback)
        {
            var result = await _processService.AddCallbackCampaign(callback);
            return Ok(result);
        }

        // POST: cmp/api/Process/CreateBillingCampaign/{owner}/{clientId}
        [HttpPost("CreateBillingCampaign")]
        public async Task<ActionResult<bool>> CreateBillingCampaign(string owner, int[] clientId)
        {
            var campaignId = await _processService.AddBillingCampaign(owner, clientId);
            return Ok(campaignId);
        }
    }
}