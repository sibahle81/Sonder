using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class SendFollowUpController : RmaApiController
    {
        private readonly IFollowUpService _followUp;
        private readonly ISendFollowUpService _sendFollowUp;

        public SendFollowUpController(IFollowUpService followUp, ISendFollowUpService sendFollowUp)
        {
            _followUp = followUp;
            _sendFollowUp = sendFollowUp;
        }

        // GET: mdm/api/SendFollowUp/send
        [HttpGet("send")]
        public async Task<ActionResult> SendFollowUp()
        {
            var followUps = await _followUp.GetFollowUps();
            await _sendFollowUp.SendFollowUps(followUps);
            return Ok();
        }
    }
}