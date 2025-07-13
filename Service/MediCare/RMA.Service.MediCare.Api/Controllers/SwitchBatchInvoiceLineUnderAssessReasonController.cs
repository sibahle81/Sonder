using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class SwitchBatchInvoiceLineUnderAssessReasonController : RmaApiController
    {
        private readonly ISwitchBatchInvoiceLineUnderAssessReasonService _switchBatchInvoiceLineUnderAssessReasonService;

        public SwitchBatchInvoiceLineUnderAssessReasonController(ISwitchBatchInvoiceLineUnderAssessReasonService switchBatchInvoiceLineUnderAssessReasonService)
        {
            _switchBatchInvoiceLineUnderAssessReasonService = switchBatchInvoiceLineUnderAssessReasonService;
        }

        [HttpPost()]
        public async Task<ActionResult<int>> AddSwitchBatchInvoiceLineUnderAssessReason([FromBody] SwitchBatchInvoiceLineUnderAssessReason switchBatchInvoiceLineUnderAssessReasonModel)
        {
            var id = await _switchBatchInvoiceLineUnderAssessReasonService.AddSwitchBatchInvoiceLineUnderAssessReason(switchBatchInvoiceLineUnderAssessReasonModel);
            return Ok(id);
        }
    }
}
