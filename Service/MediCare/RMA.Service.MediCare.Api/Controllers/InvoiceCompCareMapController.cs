using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class InvoiceCompCareMapController : RmaApiController
    {
        private readonly IInvoiceCompCareMapService _invoiceCompCareMapService;

        public InvoiceCompCareMapController(IInvoiceCompCareMapService invoiceCompCareMapService)
        {
            _invoiceCompCareMapService = invoiceCompCareMapService;
        }

        [HttpGet("GetInvoiceCompCareMapByInvoiceId/{invoiceId}")]
        public async Task<ActionResult<InvoiceCompCareMap>> GetInvoiceCompCareMapByInvoiceId(int invoiceId)
        {
            var result = await _invoiceCompCareMapService.GetInvoiceCompCareMapByInvoiceId(invoiceId);
            return Ok(result);
        }

        [HttpGet("GetInvoiceCompCareMapByCompCareInvoiceId/{invoiceId}")]
        public async Task<ActionResult<InvoiceCompCareMap>> GetInvoiceCompCareMapByCompCareInvoiceId(int invoiceId)
        {
            var result = await _invoiceCompCareMapService.GetInvoiceCompCareMapByCompCareInvoiceId(invoiceId);
            return Ok(result);
        }

        [HttpPost("AddInvoice")]
        public async Task<ActionResult<int>> AddInvoiceCompCareMap([FromBody] InvoiceCompCareMap invoiceCompCareMap)
        {
            var result = await _invoiceCompCareMapService.AddInvoiceCompCareMap(invoiceCompCareMap);
            return Ok(result);
        }
    }
}
