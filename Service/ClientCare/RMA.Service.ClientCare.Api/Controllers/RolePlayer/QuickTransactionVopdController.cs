using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.Integrations.Contracts.Entities.Vopd;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.RolePlayer
{
    [Route("api/RolePlayer/[controller]")]
    public class QuickTransactionVopdController : RmaApiController
    {
        private readonly IQuickTransactionVopdService _quickTransactionVopdService;

        public QuickTransactionVopdController(IQuickTransactionVopdService quickTransactionVopdService)
        {
            _quickTransactionVopdService = quickTransactionVopdService;
        }

        [HttpPost("SubmitVopdRequest")]
        public async Task<ActionResult<QuickVopdResponseMessage>> SubmitVopdRequest([FromBody] VopdRequestMessage vopdRequestMessage)
        {
            var results = await _quickTransactionVopdService.SubmitVOPDRequest(vopdRequestMessage);
            return Ok(results);
        }
    }
}
