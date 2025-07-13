using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Entities.MediCare;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class MedicalInvoiceClaimController : RmaApiController
    {
        private readonly IMedicalInvoiceClaimService _medicalInvoiceClaimService;

        public MedicalInvoiceClaimController(IMedicalInvoiceClaimService medicalInvoiceClaimService)
        {
            _medicalInvoiceClaimService = medicalInvoiceClaimService;
        }

        [HttpGet("GetMedicalInvoiceClaim/{claimReferenceNumber}")]
        public async Task<ActionResult<MedicalInvoiceClaim>> GetMedicalInvoiceClaim(string claimReferenceNumber)
        {
            var medicalInvoiceClaim = await _medicalInvoiceClaimService.GetMedicalInvoiceClaim(claimReferenceNumber);
            return Ok(medicalInvoiceClaim);
        }

        [HttpGet("GetMedicalInvoiceClaimByPersonEventId/{personEventId}")]
        public async Task<ActionResult<MedicalInvoiceClaim>> GetMedicalInvoiceClaimByPersonEventId(int personEventId)
        {
            var medicalInvoiceClaim = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(personEventId);
            return Ok(medicalInvoiceClaim);
        }

        [HttpGet("GetClaimReferenceNumberByPersonEventId/{personEventId}")]
        public async Task<ActionResult<string>> GetClaimReferenceNumberByPersonEventId(int personEventId)
        {
            var claimReferenceNumber = await _medicalInvoiceClaimService.GetClaimReferenceNumberByPersonEventId(personEventId);
            return Ok(claimReferenceNumber);
        }

        [HttpGet("GetPersonEventIdByClaimReferenceNumber/{claimReferenceNumber}")]
        public async Task<ActionResult<string>> GetPersonEventIdByClaimReferenceNumber(string claimReferenceNumber)
        {
            var personEventId = await _medicalInvoiceClaimService.GetPersonEventIdByClaimReferenceNumber(claimReferenceNumber);
            return Ok(personEventId);
        }

        [HttpGet("ValidateMedicalBenefit/{claimId}/{invoiceDate}")]
        public async Task<ActionResult<bool>> ValidateMedicalBenefit(int claimId, DateTime invoiceDate)
        {
            var isExist = await _medicalInvoiceClaimService.ValidateMedicalBenefit(claimId, invoiceDate);
            return Ok(isExist);
        }

        [HttpGet("GetPersonEventAccidentDetailsByEventId/{eventId}")]
        public async Task<List<PersonEventAccidentDetail>> GetPersonEventAccidentDetailsByEventId(int eventId)
        {
            var personEventAccidentDetails = await _medicalInvoiceClaimService.GetPersonEventAccidentDetailsByEventId(eventId);
            return personEventAccidentDetails;
        }

        [HttpPost("GetSearchMedicalSwitchBatchPersonEvent/{page}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<int>> GetSearchMedicalSwitchBatchPersonEvent([FromBody] MedicalSwitchBatchSearchPersonEvent personEventSearchParams, int page = 1, int pageSize = 5, string orderBy = " FirstName ", string sortDirection = " ASC ")
        {
            var query = JsonConvert.SerializeObject(personEventSearchParams);
            var result = await _medicalInvoiceClaimService.GetSearchMedicalSwitchBatchPersonEvent(new PagedRequest(query, page, pageSize, orderBy, sortDirection == " ASC "));
            return Ok(result);
        }

        [HttpPost("CreateClaimMedicalReport")]
        public async Task<ActionResult<bool>> AddClaimPdLumpsumAward([FromBody] MedicalReport medicalReport)
        {
            var result = await _medicalInvoiceClaimService.CreateClaimMedicalReport(medicalReport);
            return Ok(result);
        }

        [HttpGet("GetClaimMedicalReport/{personEventId}")]
        public async Task<ActionResult<List<MedicalReport>>> GetClaimMedicalReport(int personEventId)
        {
            var result = await _medicalInvoiceClaimService.GetClaimMedicalReport(personEventId);
            return Ok(result);
        }

        [HttpGet("GetSickNoteByMedicalReportId/{medicalReportId}")]
        public async Task<ActionResult<MedicalReport>> GetSickNoteByMedicalReportId(int medicalReportId)
        {
            var medicalReport = await _medicalInvoiceClaimService.GetSickNoteByMedicalReportId(medicalReportId);
            return Ok(medicalReport);
        }

        [HttpPut("UpdateSickNote")]
        public async Task<ActionResult<bool>> UpdateSickNote([FromBody] MedicalReport medicalReport)
        {
            var isUpdated = await _medicalInvoiceClaimService.UpdateSickNote(medicalReport);
            return Ok(isUpdated);
        }

    }
}
