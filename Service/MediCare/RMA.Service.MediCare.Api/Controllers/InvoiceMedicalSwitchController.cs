using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class InvoiceMedicalSwitchController : RmaApiController
    {
        private readonly IInvoiceMedicalSwitchService _invoiceMedicalSwitchService;

        public InvoiceMedicalSwitchController(IInvoiceMedicalSwitchService invoiceMedicalSwitchService)
        {
            _invoiceMedicalSwitchService = invoiceMedicalSwitchService;
        }

        [HttpPost("GetMedicalSwitchBatchList")]
        public async Task<ActionResult<List<SwitchBatch>>> GetMedicalSwitchBatchList([FromBody] MedicalInvoiceSearchBatchCriteria searchBatchSearchCrateria)
        {
            var invoiceMedicalSwitchBatchList = await _invoiceMedicalSwitchService.GetMedicalSwitchBatchList(searchBatchSearchCrateria);
            return Ok(invoiceMedicalSwitchBatchList);
        }

        [HttpPost("GetPagedMedicalSwitchBatchList")]
        public async Task<ActionResult<PagedRequestResult<SwitchBatch>>> GetPagedMedicalSwitchBatchList([FromBody] MedicalInvoiceSearchBatchCriteria searchBatchSearchCriteria)
        {
            if (searchBatchSearchCriteria != null)
            {
                var request = new SwitchBatchPagedRequest
                {
                    Page = searchBatchSearchCriteria.PageNumber,
                    PageSize = searchBatchSearchCriteria.PageSize,
                    SwitchType = searchBatchSearchCriteria.SwitchTypes,
                    SwitchBatchId = searchBatchSearchCriteria.SwitchBatchId,
                    BatchNumber = searchBatchSearchCriteria.BatchNumber,
                    DateSubmitted = searchBatchSearchCriteria.DateSubmitted,
                    DateReceived = searchBatchSearchCriteria.DateRecieved,
                    DateSwitched = searchBatchSearchCriteria.DateSwitched,
                    AssignedToUserId = searchBatchSearchCriteria.AssignedToUserId,
                    IncludeCompletedBatches = searchBatchSearchCriteria.IsCompleteBatches,
                    SwitchBatchType = searchBatchSearchCriteria.SwitchBatchType
                };


                var invoiceMedicalSwitchBatchList = await _invoiceMedicalSwitchService.GetPagedMedicalSwitchBatchList(request);
                return Ok(invoiceMedicalSwitchBatchList);
            }
            return Ok(null);
        }

        [HttpPost("GetUnmappedMiSwitchRecords")]
        public async Task<ActionResult<List<SwitchBatch>>> GetUnmappedMiSwitchRecords([FromBody] MedicalSwitchBatchUnmappedParams medicalSwitchBatchUnmappedParams)
        {
            var invoiceMedicalSwitchBatchList = await _invoiceMedicalSwitchService.GetUnmappedMiSwitchRecords(medicalSwitchBatchUnmappedParams);
            return Ok(invoiceMedicalSwitchBatchList);
        }

        [HttpGet("GetMedicalSwitchBatchInvoices/{switchBatchID}")]
        public async Task<ActionResult<IEnumerable<SwitchBatchInvoice>>> GetMedicalSwitchBatchInvoices(int switchBatchID)
        {
            var invoiceMedicalSwitchBatchInvoices = await _invoiceMedicalSwitchService.GetMedicalSwitchBatchInvoices(switchBatchID);
            return Ok(invoiceMedicalSwitchBatchInvoices);
        }

        [HttpGet("GetSwitchBatchesDeleteReasons")]
        public async Task<ActionResult<IEnumerable<MISwitchBatchDeleteReason>>> GetSwitchBatchesDeleteReasons()
        {
            var switchSwitchBatchesDeleteReasons = await _invoiceMedicalSwitchService.GetSwitchBatchesDeleteReasons();
            return Ok(switchSwitchBatchesDeleteReasons);
        }

        [HttpGet("GetManualSwitchBatchDeleteReasons")]
        public async Task<ActionResult<IEnumerable<SwitchUnderAssessReasonSetting>>> GetManualSwitchBatchDeleteReasons()
        {
            var manualSwitchBatchDeleteReasons = await _invoiceMedicalSwitchService.GetManualSwitchBatchDeleteReasons();
            return Ok(manualSwitchBatchDeleteReasons);
        }

        [HttpPut("EditSwitchBatchDeleteReason")]
        public async Task<ActionResult<int>> EditSwitchBatchDeleteReason([FromBody] SwitchBatchDeleteReason switchBatchDeleteReason)
        {
            var id = await _invoiceMedicalSwitchService.SaveManualSwitchBatchDeleteReasonToDB(switchBatchDeleteReason);
            return Ok(id);
        }

        [HttpPut("EditSwitchBatchAssignToUser")]
        public async Task<ActionResult<int>> EditSwitchBatchAssignToUser([FromBody] SwitchBatch switchBatchInvoice)
        {
            var id = await _invoiceMedicalSwitchService.EditSwitchBatchAssignToUser(switchBatchInvoice);
            return Ok(id);
        }

        [HttpGet("ValidateSwitchBatchInvoices/{switchBatchID}/{refreshMapping?}")]
        public async Task<ActionResult<int>> ValidateSwitchBatchInvoices(int switchBatchID, bool refreshMapping = false)
        {
            var result = await _invoiceMedicalSwitchService.SendSwitchBatchValidationRequests(switchBatchID);
            return Ok(result);
        }

        [HttpPut("SaveManualSwitchBatchDeleteReasonToDB")]
        public async Task<ActionResult<int>> SaveManualSwitchBatchDeleteReasonToDB([FromBody] SwitchBatchDeleteReason switchBatchDeleteReason)
        {
            var id = await _invoiceMedicalSwitchService.SaveManualSwitchBatchDeleteReasonToDB(switchBatchDeleteReason);
            return Ok(id);
        }

        [HttpPut("ReinstateSwitchBatchInvoices")]
        public async Task<ActionResult<bool>> ReinstateSwitchBatchInvoices([FromBody] SwitchBatchInvoiceReinstateParams switchBatchInvoiceReinstateParams)
        {
            var result = await _invoiceMedicalSwitchService.ReinstateSwitchBatchInvoices(switchBatchInvoiceReinstateParams);
            return Ok(result);
        }
    }
}