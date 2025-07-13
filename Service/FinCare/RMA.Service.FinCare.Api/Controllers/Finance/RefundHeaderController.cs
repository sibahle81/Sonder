using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.FinCare.Contracts.Entities.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Finance
{
    [Route("api/Finance/[controller]")]
    public class RefundHeaderController : RmaApiController
    {
        private readonly IRefundHeaderService _refundHeaderService;

        public RefundHeaderController(IRefundHeaderService refundHeaderService)
        {
            _refundHeaderService = refundHeaderService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RefundHeader>>> Get()
        {
            var refundHeaders = await _refundHeaderService.GetRefundHeaders();
            return Ok(refundHeaders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RefundHeader>> Get(int id)
        {
            var refundHeader = await _refundHeaderService.GetRefundHeader(id);
            return Ok(refundHeader);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] RefundHeader refundHeader)
        {
            var res = await _refundHeaderService.AddRefundHeader(refundHeader);
            return Ok(res);
        }

        [HttpPut]
        public async Task<ActionResult<RefundHeader>> Put([FromBody] RefundHeader refundHeader)
        {
            await _refundHeaderService.EditRefundHeader(refundHeader);
            return Ok();
        }

        [HttpGet("GetRefundSummaryGroupedByDate")]
        public async Task<ActionResult<List<RefundSummary>>> GetRefundSummaryGroupedByDate()
        {
            var refundSummary = await _refundHeaderService.GetRefundSummaryGroupedByDate();
            return Ok(refundSummary);
        }

        [HttpGet("GetRefundSummaryGroupedByReason")]
        public async Task<ActionResult<List<RefundSummary>>> GetRefundSummaryGroupedByReason()
        {
            var refundSummary = await _refundHeaderService.GetRefundSummaryGroupedByReason();
            return Ok(refundSummary);
        }

        [HttpGet("GetRefundSummaryDetails")]
        public async Task<ActionResult<List<RefundSummaryDetail>>> GetRefundSummaryDetails()
        {
            var refundSummaryDetails = await _refundHeaderService.GetRefundSummaryDetails();
            return Ok(refundSummaryDetails);
        }
    }
}
