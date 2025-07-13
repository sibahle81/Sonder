using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class InvoiceCommonController : RmaApiController
    {
        private readonly IInvoiceCommonService _invoiceCommonService;
        private const string DefaultSortOrder = "desc";
        private const string AscendingOrder = "asc";

        public InvoiceCommonController(IInvoiceCommonService invoiceCommonService)
        {
            _invoiceCommonService = invoiceCommonService;
        }

        [HttpPost("ValidatePaymentRequest")]
        public async Task<ActionResult<InvoiceUnderAssessReason>> ValidatePaymentRequest([FromBody] InvoiceDetails invoiceDetails)
        {
            var result = await _invoiceCommonService.ValidatePaymentRequest(invoiceDetails);
            return Ok(result);
        }

        [HttpPost("ExecuteInvoiceValidations")]
        public async Task<ActionResult<InvoiceValidationModel>> ExecuteInvoiceValidations([FromBody] InvoiceDetails invoiceDetails)
        {
            var result = await _invoiceCommonService.ExecuteInvoiceValidations(invoiceDetails);
            return Ok(result);
        }

        [HttpPost("ExecuteInvoiceLineValidations")]
        public async Task<ActionResult<InvoiceValidationModel>> ExecuteInvoiceLineValidations([FromBody] InvoiceDetails invoiceDetails)
        {
            var result = await _invoiceCommonService.ExecuteInvoiceLineValidations(invoiceDetails);
            return Ok(result);
        }

        [HttpPost("AssessAllocationSubmit")]
        public async Task<ActionResult<int>> AssessAllocationSubmit([FromBody] InvoiceAssessAllocateData invoiceAssessAllocateData)
        {
            var result = await _invoiceCommonService.AssessAllocationSubmit(invoiceAssessAllocateData);
            return Ok(result);
        }

        [HttpGet("CheckForMedicalReport/{healthCareProviderId}/{invoiceId}")]
        public async Task<ActionResult<IEnumerable<Invoice>>> CheckForMedicalReport(int healthCareProviderId, int invoiceId)
        {
            var isMedicalReportExist = await _invoiceCommonService.CheckForMedicalReport(healthCareProviderId, invoiceId);
            return Ok(isMedicalReportExist);
        }

        [HttpGet("GetMappedInvoicePreAuthDetails/{invoiceId}")]
        public async Task<ActionResult<IEnumerable<InvoiceReportMapDetail>>> GetMappedInvoicePreAuthDetails(int invoiceId)
        {
            var invoicePreAuthMapDetailList = await _invoiceCommonService.GetMappedInvoicePreAuthDetails(invoiceId);
            return Ok(invoicePreAuthMapDetailList);
        }

        [HttpGet("GetInvoiceDetails/{invoiceId}")]
        public async Task<ActionResult<InvoiceDetails>> GetInvoiceDetails(int invoiceId)
        {
            var invoiceDetails = await _invoiceCommonService.GetInvoiceDetails(invoiceId);
            return Ok(invoiceDetails);
        }

        [HttpGet("GetTebaInvoice/{tebaInvoiceId}")]
        public async Task<ActionResult<TebaInvoice>> GetTebaInvoice(int tebaInvoiceId)
        {
            var tebaInvoice = await _invoiceCommonService.GetTebaInvoice(tebaInvoiceId);
            return Ok(tebaInvoice);
        }

        [HttpPut("EditInvoice")]
        public async Task<ActionResult<int>> Put([FromBody] Invoice invoiceModel)
        {
            var id = await _invoiceCommonService.EditInvoice(invoiceModel);
            return Ok(id);
        }


        [HttpPut("EditTebaInvoice")]
        public async Task<ActionResult<int>> EditTebaInvoice([FromBody] TebaInvoice tebaInvoice)
        {
            var id = await _invoiceCommonService.EditTebaInvoice(tebaInvoice);
            return Ok(id);
        }

        [HttpGet("GetPagedInvoiceList/{page}/{pageSize}/{orderBy}/{sortDirection}/{*query}")]
        public async Task<ActionResult<IEnumerable<InvoiceDetails>>> GetPagedInvoiceList(int page = 1, int pageSize = 5, string orderBy = "InvoiceId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var invoicesDetails = await _invoiceCommonService.GetPagedInvoiceList(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(invoicesDetails);
        }


        [HttpGet("GetPagedTebaInvoiceList/{page}/{pageSize}/{orderBy}/{sortDirection}/{*query}")]
        public async Task<ActionResult<IEnumerable<TebaInvoice>>> GetPagedTebaInvoiceList(int page = 1, int pageSize = 5, string orderBy = "InvoiceId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var tebaInvoices = await _invoiceCommonService.GetPagedTebaInvoiceList(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(tebaInvoices);
        }


        [HttpGet("GetPagedTebaInvoiceDetailsByPersonEventId/{personEventId}")]
        public async Task<ActionResult<IEnumerable<TebaInvoice>>> GetPagedTebaInvoiceDetailsByPersonEventId(int personEventId)
        {
            var invoiceDetails = await _invoiceCommonService.GetPagedTebaInvoiceDetailsByPersonEventId(personEventId);
            return Ok(invoiceDetails);
        }

        [HttpGet("GetInvoiceDetailsByPersonEventId/{personEventId}")]
        public async Task<ActionResult<IEnumerable<InvoiceDetails>>> GetInvoiceDetailsByPersonEventId(int personEventId)
        {
            var invoiceDetails = await _invoiceCommonService.GetInvoiceDetailsByPersonEventId(personEventId);
            return Ok(invoiceDetails);
        }

        [HttpGet("IsPreauthInvoiceProcessed/{preAuthId}")]
        public async Task<ActionResult<bool>> IsPreauthInvoiceProcessed(int preAuthId)
        {
            var invoiceStatus = await _invoiceCommonService.IsPreauthInvoiceProcessed(preAuthId);
            return Ok(invoiceStatus);
        }

        [HttpPost("DeleteAllocatedInvoice")]
        public async Task<ActionResult<int>> DeleteAllocatedInvoice([FromBody] int invoiceId)
        {
            var id = await _invoiceCommonService.DeleteAllocatedInvoice(invoiceId);
            return Ok(id);
        }

        [HttpGet("CheckForDuplicateLineItem/{currentInvoiceLineItemId}/{personEventId}/{healthCareProviderId}/{tariffId}/{serviceDate}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> CheckForDuplicateLineItem(int currentInvoiceLineItemId, int personEventId, int healthCareProviderId, int tariffId, DateTime serviceDate)
        {
            var isDuplicate = await _invoiceCommonService.CheckForDuplicateLineItem(currentInvoiceLineItemId, personEventId, healthCareProviderId, tariffId, serviceDate);
            return Ok(isDuplicate);
        }

        [HttpGet("GetMappedInvoiceMedicalReports/{invoiceId}")]
        public async Task<ActionResult<IEnumerable<MedicalReportForm>>> GetMappedInvoiceMedicalReports(int invoiceId)
        {
            var invoiceReportMapDetailList = await _invoiceCommonService.GetMappedInvoiceMedicalReports(invoiceId);
            return Ok(invoiceReportMapDetailList);
        }

        [HttpGet("GetPendedOrRejectedInvoicesForReinstate/{claimId}/{underAssessReasonIds?}")]
        public async Task<ActionResult<IEnumerable<InvoiceDetails>>> GetPendedOrRejectedInvoicesForReinstate(int claimId, string underAssessReasonIds)
        {
            var invoiceDetails = await _invoiceCommonService.GetPendedOrRejectedInvoicesForReinstate(claimId, underAssessReasonIds);
            return Ok(invoiceDetails);
        }

        [HttpGet("SearchMedicalInvoice/{page}/{pageSize}/{orderBy}/{sortDirection}/{*query}")]
        public async Task<ActionResult<IEnumerable<InvoiceDetails>>> SearchMedicalInvoice(int page = 1, int pageSize = 5, string orderBy = "InvoiceId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _invoiceCommonService.SearchMedicalInvoice(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(result);
        }

        [HttpPost("SearchMedicalInvoiceV2")]
        public async Task<ActionResult<PagedRequestResult<InvoiceDetails>>> SearchMedicalInvoiceV2([FromBody] MedicalInvoiceSearchRequest searchRequest)
        {
            var result = await _invoiceCommonService.SearchMedicalInvoiceV2(searchRequest);
            return Ok(result);
        }

        [HttpGet("GetPaymentAllocationByMedicalInvoiceId/{medicalInvoiceId}")]
        public async Task<ActionResult<PaymentAllocationDetails>> GetPaymentAllocationByMedicalInvoiceId(int medicalInvoiceId)
        {
            var result = await _invoiceCommonService.GetPaymentAllocationByMedicalInvoiceId(medicalInvoiceId);
            return Ok(result);
        }

        [HttpGet("GetPaymentsByMedicalInvoiceId/{medicalInvoiceId}")]
        public async Task<ActionResult<IEnumerable<PaymentDetails>>> GetPaymentsByMedicalInvoiceId(int medicalInvoiceId)
        {
            var results = await _invoiceCommonService.GetPaymentsByMedicalInvoiceId(medicalInvoiceId);
            return Ok(results);
        }

        [HttpGet("GetMedicalInvoiceFromCompCare/{invoiceId}")]
        public async Task<ActionResult<InvoiceDetails>> GetMedicalInvoiceFromCompCare(int invoiceId)
        {
            var invoicesDetails = await _invoiceCommonService.GetMedicalInvoiceFromCompCare(invoiceId);
            return Ok(invoicesDetails);
        }

        [HttpPost("SearchForInvoices")]
        public async Task<ActionResult<PagedRequestResult<InvoiceDetails>>> SearchForInvoices([FromBody] SearchInvoiceCriteria searchInvoiceCriteria)
        {
            if (searchInvoiceCriteria != null)
            {
                var searchRequest = new SearchInvoicePagedRequest(searchInvoiceCriteria.PageNumber, searchInvoiceCriteria.PageSize, searchInvoiceCriteria.PracticeNumber, searchInvoiceCriteria.PractitionerTypeId, searchInvoiceCriteria.InvoiceStatusId, switchBatchInvoiceStatusId: searchInvoiceCriteria.SwitchBatchInvoiceStatusId, searchInvoiceCriteria.SupplierInvoiceNumber, searchInvoiceCriteria.AccountNumber, searchInvoiceCriteria.InvoiceDate, searchInvoiceCriteria.TreatmentFromDate, searchInvoiceCriteria.TreatmentToDate, searchInvoiceCriteria.ClaimReference);
                var invoices = await _invoiceCommonService.SearchForInvoices(searchRequest);
                return Ok(invoices);
            }
            return Ok();
        }

        [HttpGet("GetPagedInvoiceDetailsByPersonEventId/{personEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<IEnumerable<InvoiceDetails>>> GetInvoicesDetailsByPersonEventId(int personEventId, int page = 1, int pageSize = 5, string orderBy = "InvoiceId", string sortDirection = DefaultSortOrder)
        {
            var invoicesDetails = await _invoiceCommonService.GetPagedInvoiceDetailsByPersonEventId(personEventId, new PagedRequest("", page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(invoicesDetails);
        }

        [HttpGet("IsModifier/{modifierCode}")]
        public async Task<ActionResult<bool>> IsModifier(string modifierCode)
        {
            var isModifier = await _invoiceCommonService.IsModifier(modifierCode);
            return Ok(isModifier);
        }

        [HttpGet("GetModifier/{modifierCode}")]
        public async Task<ActionResult<Modifier>> GetModifier(string modifierCode)
        {
            var modifierDetail = await _invoiceCommonService.GetModifier(modifierCode);
            return Ok(modifierDetail);
        }

        [HttpPost("CalculateModifier")]
        public async Task<ActionResult<ModifierOutput>> CalculateModifier([FromBody] ModifierInput modifierInput)
        {
            var modifierOutput = await _invoiceCommonService.CalculateModifier(modifierInput);
            return Ok(modifierOutput);
        }

        [HttpGet("GetDuplicateInvoiceDetails/{invoiceId}/{personEventId}/{healthCareProviderId}/{hcpInvoiceNumber?}/{hcpAccountNumber?}")]
        public async Task<ActionResult<InvoiceDetails>> GetDuplicateInvoiceDetails(int invoiceId, int personEventId, int healthCareProviderId, string hcpInvoiceNumber = null, string hcpAccountNumber = null)
        {
            var invoicesDetails = await _invoiceCommonService.GetDuplicateInvoiceDetails(invoiceId, personEventId, healthCareProviderId, hcpInvoiceNumber, hcpAccountNumber);
            return Ok(invoicesDetails);
        }

        [HttpPost("UpdateMedicalInvoicePaymentStatus")]
        public async Task<ActionResult<bool>> UpdateMedicalInvoicePaymentStatus([FromBody] Payment payment)
        {
            if (payment != null)
            {
                var id = await _invoiceCommonService.UpdateMedicalInvoicePaymentStatus(payment.PaymentStatus, payment.PaymentId);
                return Ok(true);
            }
            return Ok(false);
        }

        [HttpGet("GetTebaTariff/{tebaTariffCodeTypeEnum}/{serviceDate}")]
        public async Task<ActionResult<TebaTariff>> GetTebaTariff(TebaTariffCodeTypeEnum? tebaTariffCodeTypeEnum, DateTime serviceDate)
        {
            return await _invoiceCommonService.GetTebaTariff(tebaTariffCodeTypeEnum, serviceDate);
        }

        [HttpPost("GetTebaTariffs")]
        public async Task<ActionResult<List<TebaTariff>>> GetTebaTariffs([FromBody] List<TebaTariff> tariffSearches)
        {
            var result = await _invoiceCommonService.GetTebaTariffs(tariffSearches);
            return Ok(result);
        }

    }
}