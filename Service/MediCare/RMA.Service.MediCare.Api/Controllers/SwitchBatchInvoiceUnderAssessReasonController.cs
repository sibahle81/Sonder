using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class SwitchBatchInvoiceUnderAssessReasonController : RmaApiController
    {
        private readonly ISwitchBatchInvoiceUnderAssessReasonService _switchBatchInvoiceUnderAssessReasonService;

        public SwitchBatchInvoiceUnderAssessReasonController(ISwitchBatchInvoiceUnderAssessReasonService switchBatchInvoiceUnderAssessReasonService)
        {
            _switchBatchInvoiceUnderAssessReasonService = switchBatchInvoiceUnderAssessReasonService;
        }

        [HttpPost()]
        public async Task<ActionResult<int>> AddSwitchBatchInvoiceUnderAssessReason([FromBody] SwitchBatchInvoiceUnderAssessReason switchBatchInvoiceUnderAssessReasonModel)
        {
            var id = await _switchBatchInvoiceUnderAssessReasonService.AddSwitchBatchInvoiceUnderAssessReason(switchBatchInvoiceUnderAssessReasonModel);
            return Ok(id);
        }

        [HttpGet("GetSwitchBatchInvoiceUnderAssessReasonsBySwitchBatchInvoiceId/{switchBatchInvoiceId}")]
        public async Task<ActionResult<List<SwitchBatchInvoiceUnderAssessReason>>> GetSwitchBatchInvoiceUnderAssessReasonsBySwitchBatchInvoiceId(int switchBatchInvoiceId)
        {
            var switchBatchInvoiceUnderAssessReasons = await _switchBatchInvoiceUnderAssessReasonService.GetSwitchBatchInvoiceUnderAssessReasonsBySwitchBatchInvoiceId(switchBatchInvoiceId);
            return Ok(switchBatchInvoiceUnderAssessReasons);
        }
    }
}
