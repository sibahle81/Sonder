using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class AccidentController : RmaApiController
    {
        private readonly IAccidentService _accidentService;
        private readonly IClaimCommunicationService _claimCommunicationService;

        public AccidentController(IAccidentService accidentService, IClaimCommunicationService claimCommunicationService)
        {
            _accidentService = accidentService;
            _claimCommunicationService = claimCommunicationService;
        }

        [HttpGet("GetAccidentClaim/{claimId}")]
        public async Task<ActionResult> GetAccidentClaim(int claimId)
        {
            var claim = await _accidentService.GetAccidentClaim(claimId);
            return Ok(claim);
        }

        [HttpGet("GetPatersonGradingsBySkill/{isSkilled}")]
        public async Task<ActionResult> GetAccidentClaim(bool isSkilled)
        {
            var claim = await _accidentService.GetPatersonGradingsBySkill(isSkilled);
            return Ok(claim);
        }

        [HttpGet("GetClaimBucketClasses")]
        public async Task<ActionResult> GetClaimBucketClasses()
        {
            var claim = await _accidentService.GetClaimBucketClasses();
            return Ok(claim);
        }

        [HttpGet("ProcessFollowUp")]
        public async Task<ActionResult> ProcessFollowUp()
        {
            await _claimCommunicationService.SendFollowUpsForDocumentsRequired();
            return Ok();
        }

        [HttpPost("SetMedicalReportFields")]
        public async Task<ActionResult> SetMedicalReportFields([FromBody] PersonEvent personEvent)
        {
            var results = await _accidentService.SetMedicalReportFields(personEvent);
            return Ok(results);
        }

        [HttpPut("AutoAcceptDocuments")]
        public async Task<ActionResult> AutoAcceptDocuments([FromBody] PersonEvent personEvent)
        {
            await _accidentService.AutoAcceptDocuments(personEvent);
            return Ok();
        }

        [HttpPut("UpdateAccidentClaimStatus")]
        public async Task<ActionResult> UpdateAccidentClaimStatus([FromBody] Claim claim)
        {
            await _accidentService.UpdateAccidentClaimStatus(claim);
            return Ok();
        }

        [HttpPost("SetProgressMedicalReportFields")]
        public async Task<ActionResult> SetProgressMedicalReportFields([FromBody] ProgressMedicalReportForm progressMedicalReportForm)
        {
            var results = await _accidentService.SetProgressMedicalReportFields(progressMedicalReportForm);
            return Ok(results);
        }

        [HttpPost("SetFinalMedicalReportFields")]
        public async Task<ActionResult> SetFinalMedicalReportFields([FromBody] FinalMedicalReportForm finalMedicalReportForm)
        {
            var results = await _accidentService.SetFinalMedicalReportFields(finalMedicalReportForm);
            return Ok(results);
        }

        [HttpPost("ValidateFirstMedicalReportSTP")]
        public async Task<ActionResult> ValidateFirstMedicalReportSTP([FromBody] FirstMedicalReportForm firstMedicalReportForm)
        {
            var results = await _accidentService.ValidateFirstMedicalReportSTP(firstMedicalReportForm);
            return Ok(results);
        }

        [HttpPost("ValidateFirstMedicalReport")]
        public async Task<ActionResult> ValidateFirstMedicalReport([FromBody] FirstMedicalReportForm firstMedicalReportForm)
        {
            var results = await _accidentService.ValidateFirstMedicalReport(firstMedicalReportForm);
            return Ok(results);
        }

        [HttpPost("ValidateProgressMedicalReportSTP")]
        public async Task<ActionResult> ValidateProgressMedicalReportSTP([FromBody] ProgressMedicalReportForm progressMedicalReportForm)
        {
            var results = await _accidentService.ValidateProgressMedicalReportSTP(progressMedicalReportForm);
            return Ok(results);
        }

        [HttpPost("ValidateProgressMedicalReport")]
        public async Task<ActionResult> ValidateProgressMedicalReport([FromBody] ProgressMedicalReportForm progressMedicalReportForm)
        {
            var results = await _accidentService.ValidateProgressMedicalReport(progressMedicalReportForm);
            return Ok(results);
        }

        [HttpPost("UpdateFirstMedicalReportForm")]
        public async Task<ActionResult> UpdateFirstMedicalReportForm([FromBody] FirstMedicalReportForm firstMedicalReportForm)
        {
            var results = await _accidentService.UpdateFirstMedicalReportForm(firstMedicalReportForm);
            return Ok(results);
        }

        [HttpPost("UpdateProgressMedicalReportForm")]
        public async Task<ActionResult> UpdateProgressMedicalReportForm([FromBody] ProgressMedicalReportForm progressMedicalReportForm)
        {
            var results = await _accidentService.UpdateProgressMedicalReportForm(progressMedicalReportForm);
            return Ok(results);
        }

        [HttpPost("UpdateFinalMedicalReportForm")]
        public async Task<ActionResult> UpdateFinalMedicalReportForm([FromBody] FinalMedicalReportForm finalMedicalReportForm)
        {
            var results = await _accidentService.UpdateFinalMedicalReportForm(finalMedicalReportForm);
            return Ok(results);
        }
        
        [HttpPost("ValidateFinalMedicalReportSTP")]
        public async Task<ActionResult> ValidateFinalMedicalReportSTP([FromBody] FinalMedicalReportForm finalMedicalReportForm)
        {
            var results = await _accidentService.ValidateFinalMedicalReportSTP(finalMedicalReportForm);
            return Ok(results);
        }

        [HttpGet("GetProgressMedicalReportForms/{personEventId}")]
        public async Task<ActionResult> GetProgressMedicalReportForms(int personEventId)
        {
            var results = await _accidentService.GetProgressMedicalReportForms(personEventId);
            return Ok(results);
        }

        [HttpGet("GetFirstMedicalReportForm/{personEventId}")]
        public async Task<ActionResult> GetFirstMedicalReportForm(int personEventId)
        {
            var results = await _accidentService.GetFirstMedicalReportForm(personEventId);
            return Ok(results);
        }

        [HttpGet("GetFinalMedicalReportForm/{personEventId}")]
        public async Task<ActionResult> GetFinalMedicalReportForm(int personEventId)
        {
            var results = await _accidentService.GetFinalMedicalReportForm(personEventId);
            return Ok(results);
        }

        [HttpGet("GetFinalMedicalReportForms/{personEventId}")]
        public async Task<ActionResult> GetFinalMedicalReportForms(int personEventId)
        {
            var results = await _accidentService.GetFinalMedicalReportForms(personEventId);
            return Ok(results);
        }

        [HttpPost("RemoveMedicalReportForm")]
        public async Task<ActionResult> RemoveMedicalReportForm([FromBody] MedicalReportFormWizardDetail medicalReportFormWizardDetail)
        {
            await _accidentService.RemoveMedicalReportForm(medicalReportFormWizardDetail);
            return Ok();
        }

        [HttpGet("GetFirstMedicalReportForms/{personEventId}")]
        public async Task<ActionResult> GetFirstMedicalReportForms(int personEventId)
        {
            var results = await _accidentService.GetFirstMedicalReportForms(personEventId);
            return Ok(results);
        }

        [HttpGet("GetMedicalFormDocumentId/{personEventId}/{workItemId}/{medicalFormReportType}")]
        public async Task<ActionResult> GetMedicalFormDocumentId(int personEventId, int workItemId, MedicalFormReportTypeEnum medicalFormReportType)
        {
            var results = await _accidentService.GetMedicalFormDocumentId(personEventId, workItemId, medicalFormReportType);
            return Ok(results);
        }

        [HttpPost("ReopenClaim")]
        public async Task<ActionResult> ReopenClaim([FromBody] PersonEvent personEvent)
        {
            await _accidentService.ReopenClaim(personEvent);
            return Ok();
        }

        [HttpPost("RemovePersonEventFromSTP/{personEventId}")]
        public async Task<ActionResult<int>> RemovePersonEventFromSTP([FromBody] Note note, int personEventId)
        {
            var results = await _accidentService.RemovePersonEventFromSTP(personEventId, note);
            return Ok(results);
        }

        [HttpGet("RerunSTPIntegrationMessage/{serviceBusMessageId}")]
        public async Task<ActionResult> RerunSTPIntegrationMessage(int serviceBusMessageId)
        {
            await _accidentService.RerunSTPIntegrationMessage(serviceBusMessageId);
            return Ok();
        }

        [HttpGet("AutoAcknowledgeAccidentClaim")]
        public async Task<ActionResult> AutoAcknowledgeAccidentClaim()
        {
            await _accidentService.AutoAcknowledgeAccidentClaim();
            return Ok();
        }

        [HttpPost("CloseAccidentClaim")]
        public async Task<ActionResult<bool>> CloseAccidentClaim([FromBody] PersonEvent personEvent)
        {
            var result = await _accidentService.CloseAccidentClaim(personEvent);
            return Ok(result);
        }

        [HttpPost("AddClaimHearingAssessment")]
        public async Task<ActionResult<bool>> AddClaimHearingAssessment([FromBody] ClaimHearingAssessment claimHearingAssessment)
        {
            var result = await _accidentService.AddClaimHearingAssessment(claimHearingAssessment);
            return Ok(result);
        }

        [HttpPost("UpdateClaimHearingAssessment")]
        public async Task<ActionResult<bool>> UpdateClaimHearingAssessment([FromBody] ClaimHearingAssessment claimHearingAssessment)
        {
            var result = await _accidentService.UpdateClaimHearingAssessment(claimHearingAssessment);
            return Ok(result);
        }

        [HttpGet("CalculateNihlPercentage/{frequency}/{lossLeftEar}/{lossRightEar}")]
        public async Task<ActionResult<double>> CalculateNihlPercentage(int frequency, float lossLeftEar, float lossRightEar)
        {
            var result = await _accidentService.CalculateNihlPercentage(frequency, lossLeftEar, lossRightEar);
            return Ok(result);
        }

        [HttpPost("ZeroPercentClosureLetter")]
        public async Task<ActionResult<bool>> ZeroPercentClosureLetter([FromBody] PersonEvent personEvent)
        {
            var result = await _accidentService.SendZeroPercentClosureLetter(personEvent);
            return Ok(result);
        }

        [HttpPost("GenerateClaimsForPolicies/{personEventId}")]
        public async Task<ActionResult> GenerateClaimsForPolicies([FromBody] List<Policy> policies, int personEventId)
        {
            await _accidentService.GenerateClaimsForPolicies(policies, personEventId);
            return Ok();
        }

        [HttpGet("UpdateFirstMedicalReportStatus/{personEventId}/{documentStatus}")]
        public async Task<ActionResult> UpdateFirstMedicalReportStatus(int personEventId, DocumentStatusEnum documentStatus)
        {
            var result = await _accidentService.UpdateFirstMedicalReportStatus(personEventId, documentStatus);
            return Ok(result);
        }

        [HttpPost("CreateDisabiltyToFatalDeathCaptured")]
        public async Task<ActionResult> CreateDisabiltyToFatalDeathCaptured([FromBody] PersonEvent personEvent)
        {
            await _accidentService.CreateDisabiltyToFatalDeathCaptured(personEvent);
            return Ok();
        }

        [HttpGet("GetFirstMedicalReportFormByReportType/{personEventId}/{reportTypeId}")]
        public async Task<ActionResult> GetFirstMedicalReportFormByReportType(int personEventId, int reportTypeId)
        {
            var result = await _accidentService.GetFirstMedicalReportFormByReportType(personEventId, reportTypeId);
            return Ok(result);
        }
    }
}