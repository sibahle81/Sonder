using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class InvoiceLineUnderAssessReasonController : RmaApiController
    {
        private readonly IInvoiceLineUnderAssessReasonService _invoiceLineUnderAssessReasonService;

        public InvoiceLineUnderAssessReasonController(IInvoiceLineUnderAssessReasonService invoiceLineUnderAssessReasonService)
        {
            _invoiceLineUnderAssessReasonService = invoiceLineUnderAssessReasonService;
        }

        [HttpPost()]
        public async Task<ActionResult<int>> AddInvoiceLineUnderAssessReason([FromBody] InvoiceLineUnderAssessReason invoiceLineUnderAssessReasonModel)
        {
            var id = await _invoiceLineUnderAssessReasonService.AddInvoiceLineUnderAssessReason(invoiceLineUnderAssessReasonModel);
            return Ok(id);
        }
    }
}
