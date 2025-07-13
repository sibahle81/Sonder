using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/Billing/[controller]")]

    public class PremiumTransferController : RmaApiController
    {
        private readonly IPaymentAllocationService _paymentAllocationService;

        public PremiumTransferController(IPaymentAllocationService paymentAllocationService)
        {
            _paymentAllocationService = paymentAllocationService;
        }

        [HttpPut("BulkPremiumTransfer")]
        public async Task<ActionResult<bool>> BulkPremiumTransfer([FromBody] BulkPremiumTransfer bulkPremiumTransfer)
        {
            var result = await _paymentAllocationService.BulkPremiumTransfer(bulkPremiumTransfer);
            return Ok(result);
        }
    }
}