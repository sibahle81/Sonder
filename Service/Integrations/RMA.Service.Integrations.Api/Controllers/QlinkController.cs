using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Integrations.Contracts.Entities.Qlink;
using RMA.Service.Integrations.Contracts.Interfaces.Qlink;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Api.Controllers
{
    [Route("api/qlink/[controller]")]
    [ApiController]
    public class QlinkController : RmaApiController
    {
        private readonly IQlinkIntegrationService _qlinkIntegrationService;

        public QlinkController(IQlinkIntegrationService qlinkIntegrationService)
        {
            _qlinkIntegrationService = qlinkIntegrationService;

        }

        // Post: int/api/qlink/qlink/SubmitTransactionRequest
        [HttpPost("SubmitTransactionRequest")]
        public async Task<ActionResult<QlinkTransactionResponse>> SubmitTransactionRequest([FromBody] QlinkTransactionRequest qlinkTransactionRequest)
        {
            var transactionResponse = await _qlinkIntegrationService.SubmitQlinkTransactionRequestAsync(new List<QlinkTransactionRequest> { qlinkTransactionRequest });
            return Ok(transactionResponse);
        }

    }
}