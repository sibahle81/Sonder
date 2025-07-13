using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class InvoiceController : RmaApiController
    {
        private readonly IInvoiceService _invoiceService;
        private const string DefaultSortOrder = "desc";
        private const string AscendingOrder = "asc";

        public InvoiceController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }



        [HttpGet("GetInvoices")]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
        {
            var invoices = await _invoiceService.GetInvoices();
            return Ok(invoices);
        }

        [HttpGet("GetInvoice/{invoiceId}")]
        public async Task<ActionResult<Invoice>> GetInvoice(int invoiceId)
        {
            var invoice = await _invoiceService.GetInvoice(invoiceId);
            return Ok(invoice);
        }



        [HttpGet("ValidateTariffCode/{itemCode}/{practitionerTypeId}/{serviceDate}")]
        public async Task<ActionResult<string>> ValidateTariffCode(string itemCode, int practitionerTypeId, DateTime serviceDate)
        {
            var result = await _invoiceService.ValidateTariffCode(itemCode, practitionerTypeId, serviceDate);
            return Ok(result);
        }

    }
}