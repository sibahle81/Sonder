using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    [Route("api/[controller]")]
    public class UnderAssessReasonController : RmaApiController
    {
        private readonly IUnderAssessReasonService _underAssessReasonService;

        public UnderAssessReasonController(IUnderAssessReasonService underAssessReasonService)
        {
            _underAssessReasonService = underAssessReasonService;
        }

        [HttpGet("GetUnderAssessReasons")]
        public async Task<ActionResult<List<UnderAssessReason>>> GetUnderAssessReasons()
        {
            var underAssessReasons = await _underAssessReasonService.GetUnderAssessReasons();
            return Ok(underAssessReasons);
        }

        [HttpGet("GetLineUnderAssessReasons")]
        public async Task<ActionResult<List<UnderAssessReason>>> GetLineUnderAssessReasons()
        {
            var underAssessReasons = await _underAssessReasonService.GetLineUnderAssessReasons();
            return Ok(underAssessReasons);
        }

        [HttpGet("{underAssessReasonId}")]
        public async Task<ActionResult<UnderAssessReason>> GeUnderAssessReason(int underAssessReasonId)
        {
            var underAssessReason = await _underAssessReasonService.GetUnderAssessReason(underAssessReasonId);
            return Ok(underAssessReason);
        }

        [HttpGet("GetUnderAssessReasonsByInvoiceStatus/{invoiceStatus}")]
        public async Task<ActionResult<UnderAssessReason>> GetUnderAssessReasonsByInvoiceStatus(InvoiceStatusEnum invoiceStatus)
        {
            var underAssessReasons = await _underAssessReasonService.GetUnderAssessReasonsByInvoiceStatus(invoiceStatus);
            return Ok(underAssessReasons);
        }

        [HttpPost("SetInvoiceUnderAssessReason")]
        public async Task<ActionResult<int>> SetInvoiceUnderAssessReason([FromBody] UnderAssessReason underAssessReason)
        {
            var result = await _underAssessReasonService.SetInvoiceUnderAssessReason(underAssessReason);
            return Ok(result);
        }

    }
}
