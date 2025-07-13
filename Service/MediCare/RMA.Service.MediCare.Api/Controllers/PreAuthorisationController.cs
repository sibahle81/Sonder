using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkPool = RMA.Service.MediCare.Contracts.Entities.Medical.WorkPool;
//using WorkPool = 

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class PreAuthorisationController : RmaApiController
    {
        private readonly IPreAuthorisationService _preAuthorisationService;        
        private const string DefaultSortOrder = "desc";
        private const string AscendingOrder = "asc";

        public PreAuthorisationController(IPreAuthorisationService preAuthorisationService)
        {
            _preAuthorisationService = preAuthorisationService;            
        }

        [HttpGet("GetPreAuthorisationById/{preAuthorisationId}")]
        public async Task<ActionResult<PreAuthorisation>> GetPreAuthorisationById(int preAuthorisationId)
        {
            var preAuthorisation = await _preAuthorisationService.GetPreAuthorisationById(preAuthorisationId);
            return Ok(preAuthorisation);
        }

        [HttpGet("GetPreAuthorisationByPreAuthNumber/{preAuthNumber}")]
        public async Task<ActionResult<PreAuthorisation>> GetPreAuthorisationByPreAuthNumber(string preAuthNumber)
        {
            var preAuthorisation = await _preAuthorisationService.GetPreAuthorisationByPreAuthNumber(preAuthNumber);
            return Ok(preAuthorisation);
        }

        [HttpGet("GetPreAuthorisationsByUser/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> GetPreAuthorisationsByUser(int page = 1, int pageSize = 5, string orderBy = "PreAuthId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var preAuthorisations = await _preAuthorisationService.GetPreAuthorisationsByUser(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(preAuthorisations);
        }

        [HttpGet("GetPreAuthorisationsByPersonEvent/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> GetPreAuthorisationsByPersonEvent(int page = 1, int pageSize = 5, string orderBy = "PreAuthId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var preAuthorisations = await _preAuthorisationService.GetPreAuthorisationsByPersonEvent(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(preAuthorisations);
        }

        [HttpGet("SearchPreAuthorisation/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> SearchPreAuthorisation(int page = 1, int pageSize = 5, string orderBy = "PreAuthId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _preAuthorisationService.SearchPreAuthorisation(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(result);
        }

        [HttpGet("SearchPreAuthorisations/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> SearchPreAuthorisations(int page = 1, int pageSize = 5, string orderBy = "PreAuthId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _preAuthorisationService.SearchPreAuthorisations(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(result);
        }

        [HttpPost("AddPreAuthorisation")]
        public async Task<ActionResult<int>> AddPreAuthorisation([FromBody] PreAuthorisation preAuthorisation)
        {
            var id = await _preAuthorisationService.AddPreAuthorisation(preAuthorisation);
            return Ok(id);
        }

        [HttpGet("CheckIfDuplicateLineItem/{personEventId}/{healthCareProviderId}/{tariffId}/{preAuthFromDate}/{preAuthToDate}")]
        public async Task<ActionResult<IEnumerable<bool>>> CheckIfDuplicateLineItem(int personEventId, int healthCareProviderId, int tariffId, DateTime preAuthFromDate, DateTime preAuthToDate)
        {
            var result = await _preAuthorisationService.CheckIfDuplicateLineItem(personEventId, healthCareProviderId, tariffId, preAuthFromDate, preAuthToDate);
            return Ok(result);
        }

        [HttpGet("IsDuplicatePreAuth/{personEventId}/{healthCareProviderId}/{preAuthFromDate}/{preAuthToDate}")]
        public async Task<ActionResult<IEnumerable<bool>>> IsDuplicatePreAuth(int personEventId, int healthCareProviderId, DateTime preAuthFromDate, DateTime preAuthToDate)
        {
            var result = await _preAuthorisationService.IsDuplicatePreAuth(personEventId, healthCareProviderId, preAuthFromDate, preAuthToDate);
            return Ok(result);
        }

        [HttpGet("GetPreAuthRejectReasonList")]
        public async Task<ActionResult<IEnumerable<PreAuthRejectReason>>> GetPreAuthRejectReasonList()
        {
            var preAuthRejectReasons = await _preAuthorisationService.GetPreAuthRejectReasonList();
            return Ok(preAuthRejectReasons);
        }

        [HttpPut("UpdatePreAuthorisation")]
        public async Task<ActionResult<int>> UpdatePreAuthorisation([FromBody] PreAuthorisation preAuthorisation)
        {
            await _preAuthorisationService.UpdatePreAuthorisation(preAuthorisation);
            return Ok();
        }

        [HttpDelete("DeletePreAuthorisation/{preAuthId}")]
        public async Task DeletePreAuthorisation(int preAuthId)
        {
            await _preAuthorisationService.DeletePreAuthorisation(preAuthId);
        }

        [HttpGet("GetClinicalUpdate/{clinicalUpdateId}")]
        public async Task<ActionResult<IEnumerable<ClinicalUpdate>>> GetClinicalUpdate(int clinicalUpdateId)
        {
            var clinicalUpdate = await _preAuthorisationService.GetClinicalUpdate(clinicalUpdateId);
            return Ok(clinicalUpdate);
        }

        [HttpGet("GetPreAuthClinicalUpdates/{preAuthId}")]
        public async Task<ActionResult<IEnumerable<ClinicalUpdate>>> GetPreAuthClinicalUpdates(int preAuthId)
        {
            var clinicalUpdates = await _preAuthorisationService.GetPreAuthClinicalUpdates(preAuthId);
            return Ok(clinicalUpdates);
        }

        [HttpGet("GetClinicalUpdatesList/{requestData?}")]
        public async Task<ActionResult<IEnumerable<ClinicalUpdate>>> GetClinicalUpdatesList(string requestData)
        {
            var clinicalUpdates = await _preAuthorisationService.GetClinicalUpdatesList(requestData);
            return Ok(clinicalUpdates);
        }

        [HttpGet("GetClinicalUpdatesData/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<ClinicalUpdate>>> GetClinicalUpdatesData(int page = 1, int pageSize = 5, string orderBy = "ClinicalUpdateId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _preAuthorisationService.GetClinicalUpdatesData(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(result);
        }

        [HttpGet("GetAuthorisedPreAuths/{personEventId}/{includeTreatingDoctor}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> GetAuthorisedPreAuths(int personEventId, bool includeTreatingDoctor)
        {
            var preAuthorisations = await _preAuthorisationService.GetAuthorisedPreAuths(personEventId, includeTreatingDoctor);
            return Ok(preAuthorisations);
        }

        [HttpGet("GetPreAuthsForPractitionerTypeTreatmentBasket/{personEventId}/{practitionerTypeId}/{invoiceTreatmentFromDate}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> GetPreAuthsForPractitionerTypeTreatmentBasket(int personEventId, int practitionerTypeId, DateTime invoiceTreatmentFromDate)
        {
            var preAuthorisations = await _preAuthorisationService.GetPreAuthsForPractitionerTypeTreatmentBasket(personEventId, practitionerTypeId, invoiceTreatmentFromDate);
            return Ok(preAuthorisations);
        }

        [HttpGet("GetPreAuthsByClaimId/{claimId}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> GetPreAuthsByClaimId(int claimId)
        {
            var preAuthorisations = await _preAuthorisationService.GetPreAuthsByClaimId(claimId);
            return Ok(preAuthorisations);
        }

        [HttpPost("AddClinicalUpdate")]
        public async Task<ActionResult<int>> AddClinicalUpdate([FromBody] ClinicalUpdate clinicalUpdate)
        {
            var id = await _preAuthorisationService.AddClinicalUpdate(clinicalUpdate);
            return Ok(id);
        }

        [HttpPost("UpdateClinicalUpdate")]
        public async Task<ActionResult<int>> UpdateClinicalUpdate([FromBody] ClinicalUpdate clinicalUpdate)
        {
            await _preAuthorisationService.UpdateClinicalUpdate(clinicalUpdate);
            return Ok();
        }

        [HttpDelete("DeleteClinicalUpdate")]
        public async Task DeleteClinicalUpdate(int clinicalUpdateId)
        {
            await _preAuthorisationService.DeleteClinicalUpdate(clinicalUpdateId);
        }

        [HttpGet("GetPreAuthPractitionerTypeSetting/{preAuthTypeId}/{practitionerTypeId}")]
        public async Task<PreAuthPractitionerTypeSetting> GetPreAuthPractitionerTypeSetting(int preAuthTypeId, int practitionerTypeId)
        {
            var preAuthPractitionerTypeSetting = await _preAuthorisationService.GetPreAuthPractitionerTypeSetting(preAuthTypeId, practitionerTypeId);
            return preAuthPractitionerTypeSetting;
        }

        [HttpGet("GetPreAuthActivity/{preAuthId}/{preAuthStatus}")]
        public async Task<PreAuthActivity> GetPreAuthActivity(int preAuthId, PreAuthStatusEnum preAuthStatus)
        {
            var preAuthActivity = await _preAuthorisationService.GetPreAuthActivity(preAuthId, preAuthStatus);
            return preAuthActivity;
        }

        [HttpGet("GetMedicalBusinessProcesses/{workPool}/{userId}/{pageNumber}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<PagedRequestResult<WorkPool>> GetMedicalBusinessProcesses(WorkPoolEnum workPool, int userId, int pageNumber, int pageSize = 5, string orderBy = "Wizard.Id", string sortDirection = "desc", string query = "")
        {
            var workflows = await _preAuthorisationService.GetMedicalBusinessProcesses(workPool, userId, new PagedRequest(query, pageNumber, pageSize, orderBy, sortDirection == "desc"));
            return workflows;
        }

        [HttpPost("CreateWorkflow")]
        public async Task<ActionResult<int>> CreateWorkflow([FromBody] Workflow workflow)
        {
            await _preAuthorisationService.CreateWorkflow(workflow);
            return Ok();
        }

        [HttpPut("UpdateWorkflow")]
        public async Task<ActionResult<int>> UpdateWorkflow([FromBody] Workflow workflow)
        {
            await _preAuthorisationService.UpdateWorkflow(workflow);
            return Ok();
        }

        [HttpPost("LockOrUnlockWorkflow")]
        public async Task<ActionResult<int>> LockOrUnlockWorkflow([FromBody] Workflow workflow)
        {
            return await _preAuthorisationService.LockOrUnlockWorkflow(workflow);
        }

        [HttpPost("AssignWorkflow")]
        public async Task<ActionResult<int>> AssignWorkflow([FromBody] Workflow workflow)
        {
            return await _preAuthorisationService.AssignWorkflow(workflow);
        }

        [HttpPost("ReAssignWorkflow")]
        public async Task<ActionResult<int>> ReAssignWorkflow([FromBody] Workflow workflow)
        {
            return await _preAuthorisationService.ReAssignWorkflow(workflow);
        }

        [HttpPut("CloseWorkFlow")]
        public async Task<ActionResult<int>> CloseWorkFlow([FromBody] Workflow workflow)
        {
            await _preAuthorisationService.CloseWorkFlow(workflow);
            return Ok();
        }

        [HttpPut("EscalateWorkflow")]
        public async Task<ActionResult<int>> EscalateWorkflow([FromBody] Workflow workflow)
        {
            await _preAuthorisationService.EscalateWorkflow(workflow);
            return Ok();
        }

        [HttpPost("SearchForPreAuthorisation")]
        public async Task<ActionResult<List<PreAuthorisation>>> SearchForPreAuthorisation([FromBody] PreAuthSearchModel preAuthSearchModel)
        {
            var preAuthorisations = await _preAuthorisationService.SearchForPreAuthorisation(preAuthSearchModel);
            return Ok(preAuthorisations);
        }

        [HttpPost("SearchForPreAuthorisations")]
        public async Task<ActionResult<PagedRequestResult<PreAuthorisation>>> SearchForPreAuthorisations([FromBody] SearchPreAuthCriteria searchPreAuthCriteria)
        {
            if (searchPreAuthCriteria != null)
            {
                var preAuthorisations = await _preAuthorisationService.SearchForPreAuthorisations(new SearchPreAuthPagedRequest(searchPreAuthCriteria.PageNumber, searchPreAuthCriteria.PageSize, searchPreAuthCriteria.PreAuthNumber, searchPreAuthCriteria.PreAuthTypeId, searchPreAuthCriteria.PreAuthStatusId, searchPreAuthCriteria.HealthCareProviderId, searchPreAuthCriteria.DateAuthorisedFrom, searchPreAuthCriteria.DateAuthorisedTo, searchPreAuthCriteria.ClaimId));
                return Ok(preAuthorisations);
            }
            return Ok();
        }

        [HttpPost("ExecutePreauthBreakdownUnderAssessReasonValidations")]
        public async Task<ActionResult<List<PreAuthBreakdownUnderAssessReason>>> ExecutePreauthBreakdownUnderAssessReasonValidations([FromBody] PreAuthorisation preAuthorisation)
        {
            var result = await _preAuthorisationService.ExecutePreauthBreakdownUnderAssessReasonValidations(preAuthorisation);
            return Ok(result);
        }

        [HttpGet("GetInvoicePreAuthNumbers/{treatmentFromDate}/{healthCareProviderId}/{personEventId}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> GetInvoicePreAuthNumbers(DateTime treatmentFromDate, int healthCareProviderId, int personEventId)
        {
            var invoicePreAuthNumbers = await _preAuthorisationService.GetInvoicePreAuthNumbers(treatmentFromDate, healthCareProviderId, personEventId);
            return Ok(invoicePreAuthNumbers);
        }

        [HttpGet("GetProsthetistQuotationsById/{prosthetistQuoteId}")]
        public async Task<ActionResult<ProsthetistQuote>> GetProsthetistQuotationsById(int prosthetistQuoteId)
        {
            var prosthetistQuotation = await _preAuthorisationService.GetProsthetistQuotationsById(prosthetistQuoteId);
            return Ok(prosthetistQuotation);
        }

        [HttpGet("SearchProsthetistQuotations/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<PreAuthorisation>>> SearchProsthetistQuotations(int page = 1, int pageSize = 5, string orderBy = "PreAuthId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _preAuthorisationService.SearchProsthetistQuotations(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(result);
        }

        [HttpGet("GetMedicalWorkPool/{assignedToUserId}/{userLoggedIn}/{isUserBox}/{workPoolId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimPool>>> GetClaimWorkPool(string assignedToUserId, int userLoggedIn, bool isUserBox, int workPoolId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _preAuthorisationService.GetMedicalWorkPool(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), assignedToUserId, userLoggedIn, workPoolId, isUserBox);
            return Ok(personEvents);
        }

        [HttpPost("AddPreAuthorisationUnderAssessReason")]        
        public async Task<ActionResult<int>> AddPreAuthorisationUnderAssessReason([FromBody] PreAuthorisationUnderAssessReason preAuthorisationUnderAssessReasonModel)
        {
            var id = await _preAuthorisationService.AddPreAuthorisationUnderAssessReason(preAuthorisationUnderAssessReasonModel);
            return Ok(id);
        }

        [HttpPost("CreateProstheticReviewWizard/{wizardId}/{roleId}")]
        public async Task<ActionResult<bool>> CreateProstheticReviewWizard(int wizardId, int roleId)
        {
           var isReviewCreated = await _preAuthorisationService.CreateProstheticReviewWizard(wizardId, roleId);
            
            return Ok(isReviewCreated);
        }
    }
}
