using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.FinCare.Contracts.Entities.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Finance
{
    [Route("api/Finance/[controller]")]
    public class RefundHeaderDetailController : RmaApiController
    {
        private readonly IRefundHeaderDetailService _refundHeaderDetailService;

        public RefundHeaderDetailController(IRefundHeaderDetailService refundHeaderDetailService)
        {
            _refundHeaderDetailService = refundHeaderDetailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RefundHeaderDetail>>> Get()
        {
            var refundHeaderDetails = await _refundHeaderDetailService.GetRefundHeaderDetails();
            return Ok(refundHeaderDetails);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RefundHeaderDetail>> Get(int id)
        {
            var refundHeaderDetail = await _refundHeaderDetailService.GetRefundHeaderDetail(id);
            return Ok(refundHeaderDetail);
        }

        [HttpGet("RefundHeader/{id}")]
        public async Task<ActionResult<IEnumerable<RefundHeaderDetail>>> GetDetailsByHeaderId(int id)
        {
            var refundHeaderDetails = await _refundHeaderDetailService.GetRefundHeaderDetailByHeaderId(id);
            return Ok(refundHeaderDetails);
        }

        [HttpGet("ClientCover/{id}")]
        public async Task<ActionResult<IEnumerable<RefundHeaderDetail>>> GetDetailsByClientCoverId(int id)
        {
            var refundHeaderDetails = await _refundHeaderDetailService.GetRefundHeaderDetailByClientCoverId(id);
            return Ok(refundHeaderDetails);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] RefundHeaderDetail refundHeaderDetail)
        {
            var res = await _refundHeaderDetailService.AddRefundHeaderDetail(refundHeaderDetail);
            return Ok(res);
        }

        [HttpPut]
        public async Task<ActionResult<RefundHeaderDetail>> Put([FromBody] RefundHeaderDetail refundHeader)
        {
            await _refundHeaderDetailService.EditRefundHeaderEdit(refundHeader);
            return Ok();
        }
    }
}
