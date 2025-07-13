using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class InvoiceHelperController : RmaApiController
    {
        private readonly IInvoiceHelperService _invoiceHelperService;

        public InvoiceHelperController(IInvoiceHelperService invoiceHelperService)
        {
            _invoiceHelperService = invoiceHelperService;
        }

        [HttpGet("AutoPayRun/{invoiceId}/{tebaInvoiceId}")]
        public async Task<ActionResult<IEnumerable<InvoiceUnderAssessReason>>> AutoPayRun(int invoiceId, int tebaInvoiceId)
        {
            return Ok(await _invoiceHelperService.AutoPayRun(invoiceId, tebaInvoiceId));
        }

        [HttpGet("AutoPayRunSTPIntegration/{invoiceId}")]
        public async Task<ActionResult<IEnumerable<InvoiceUnderAssessReason>>> AutoPayRunSTPIntegration(int invoiceId)
        {
            return Ok(await _invoiceHelperService.AutoPayRunSTPIntegration(invoiceId));
        }

        [HttpGet("ReinstateMedicalInvoice/{invoiceId}/{tebaInvoiceId}")]
        public async Task<ActionResult<IEnumerable<InvoiceUnderAssessReason>>> ReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId)
        {
            return Ok(await _invoiceHelperService.ReinstateMedicalInvoice(invoiceId, tebaInvoiceId));
        }

        [HttpGet("AutoReinstateMedicalInvoice/{invoiceId}/{tebaInvoiceId}/{personEventId}")]
        public async Task<ActionResult<bool>> AutoReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId, int personEventId)
        {
            return Ok(await _invoiceHelperService.AutoReinstateMedicalInvoice(invoiceId, tebaInvoiceId, personEventId));
        }

        [HttpGet("GetValidatedSTPInvoicesNotMappedToPreAuth")]
        public async Task<ActionResult<IEnumerable<InvoiceDetails>>> GetValidatedSTPInvoicesNotMappedToPreAuth()
        {
            var invoicesDetails = await _invoiceHelperService.GetValidatedSTPInvoicesNotMappedToPreAuth();
            return Ok(invoicesDetails);
        }

        [HttpPost("AddInvoice")]
        public async Task<ActionResult<int>> AddInvoice([FromBody] Invoice invoiceModel)
        {
            var id = await _invoiceHelperService.AddInvoice(invoiceModel);
            return Ok(id);
        }

        [HttpPost("AddTebaInvoice")]
        public async Task<ActionResult<int>> AddTebaInvoice([FromBody] TebaInvoice tebaInvoice)
        {
            var id = await _invoiceHelperService.AddTebaInvoice(tebaInvoice);
            return Ok(id);
        }

        [HttpGet("ProcessMedicalInvoiceIntegrationMessage/{message}/{messageId}")]
        public async Task<ActionResult<int>> ProcessMedicalInvoiceIntegrationMessage(string message, string messageId)
        {
            return Ok(await _invoiceHelperService.ProcessMedicalInvoiceIntegrationMessage(message, messageId));
        }

        [HttpGet("ForceReinstateMedicalInvoice/{invoiceId}/{tebaInvoiceId}")]
        public async Task<ActionResult<bool>> ForceReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId)
        {
            return Ok(await _invoiceHelperService.ForceReinstateMedicalInvoice(invoiceId, tebaInvoiceId));
        }

        [HttpGet("ValidateInvoiceRun/{invoiceId}/{tebaInvoiceId}")]
        public async Task<ActionResult<IEnumerable<InvoiceUnderAssessReason>>> ValidateInvoiceRun(int invoiceId, int tebaInvoiceId)
        {
            return Ok(await _invoiceHelperService.ValidateInvoiceRun(invoiceId, tebaInvoiceId));
        }
    }
}