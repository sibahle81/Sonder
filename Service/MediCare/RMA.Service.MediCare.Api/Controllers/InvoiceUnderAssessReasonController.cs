using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class InvoiceUnderAssessReasonController : RmaApiController
    {
        private readonly IInvoiceUnderAssessReasonService _invoiceUnderAssessReasonService;
        private readonly IClaimService _invoiceAllocationsService;

        public InvoiceUnderAssessReasonController(IInvoiceUnderAssessReasonService invoiceUnderAssessReasonService, IClaimService invoiceAllocationsService)
        {
            _invoiceUnderAssessReasonService = invoiceUnderAssessReasonService;
            _invoiceAllocationsService = invoiceAllocationsService;
        }

        [HttpPost()]
        public async Task<ActionResult<int>> AddInvoiceUnderAssessReason([FromBody] InvoiceUnderAssessReason invoiceUnderAssessReasonModel)
        {
            var id = await _invoiceUnderAssessReasonService.AddInvoiceUnderAssessReason(invoiceUnderAssessReasonModel);
            return Ok(id);
        }

        [HttpGet("GetInvoiceUnderAssessReasonsByInvoiceId/{invoiceId}/{tebaInvoiceId}")]
        public async Task<ActionResult<List<InvoiceUnderAssessReason>>> GetInvoiceUnderAssessReasonsByInvoiceId(int invoiceId, int tebaInvoiceId)
        {
            var invoiceUnderAssessReasons = await _invoiceUnderAssessReasonService.GetInvoiceUnderAssessReasonsByInvoiceId(invoiceId, tebaInvoiceId);
            return Ok(invoiceUnderAssessReasons);
        }

        [HttpPost("AddInvoiceAllocations")]
        public async Task AddInvoiceAllocations([FromBody] InvoiceAllocation invoiceAllocation)
        {
            List<InvoiceAllocation> invoiceAllocationList = new List<InvoiceAllocation>();
            invoiceAllocationList.Add(invoiceAllocation);
            await _invoiceAllocationsService.CreateInvoiceAllocations(invoiceAllocationList, invoiceAllocationList[0].ClaimInvoiceId);
        }
    }
}
