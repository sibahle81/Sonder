using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Collections.Generic;
using System.Threading.Tasks;

using Benefit = RMA.Service.ClientCare.Contracts.Entities.Product.Benefit;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class ClaimInvoiceController : RmaApiController
    {
        private readonly IClaimInvoiceService _claimInvoiceService;

        public ClaimInvoiceController(IClaimInvoiceService claimInvoiceService)
        {
            _claimInvoiceService = claimInvoiceService;
        }

        [HttpPost("CreateClaimInvoice")]
        public async Task<ActionResult<ClaimInvoice>> CreateClaimInvoice([FromBody] ClaimInvoice claimInvoice)
        {
            var result = await _claimInvoiceService.CreateClaimInvoice(claimInvoice);
            return Ok(result);
        }

        [HttpPost("CreateClaimInvoices")]
        public async Task<ActionResult<List<ClaimInvoice>>> CreateClaimInvoices([FromBody] List<ClaimInvoice> claimInvoices)
        {
            var results = await _claimInvoiceService.CreateClaimInvoices(claimInvoices);
            return Ok(results);
        }

        [HttpPost("UpdateClaimInvoiceV2")]
        public async Task<ActionResult<ClaimInvoice>> UpdateClaimInvoiceV2([FromBody] ClaimInvoice claimInvoice)
        {
            var result = await _claimInvoiceService.UpdateClaimInvoiceV2(claimInvoice);
            return Ok(result);
        }

        [HttpGet("GetPagedClaimInvoices/{PersonEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimInvoice>>> GetPagedClaimInvoices(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var claimInvoices = await _claimInvoiceService.GetPagedClaimInvoices(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return Ok(claimInvoices);
        }

        [HttpGet("GetPagedClaimInvoiceAllocations/{PersonEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimInvoice>>> GetPagedClaimInvoiceAllocations(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var claimInvoiceAllocations = await _claimInvoiceService.GetPagedClaimInvoiceAllocations(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return Ok(claimInvoiceAllocations);
        }

        [HttpGet("GetSundryInvoice/{claimInvoiceId}")]
        public async Task<SundryInvoice> GetSundryInvoice(int claimInvoiceId)
        {
            var sundryInvoice = await _claimInvoiceService.GetSundryInvoice(claimInvoiceId);
            return sundryInvoice;
        }

        [HttpGet("GetWidowLumpSumInvoice/{claimInvoiceId}")]
        public async Task<WidowLumpSumInvoice> GetWidowLumpSumInvoice(int claimInvoiceId)
        {
            var widowLumpSumInvoice = await _claimInvoiceService.GetWidowLumpSumInvoice(claimInvoiceId);
            return widowLumpSumInvoice;
        }

        [HttpGet("GetDaysOffInvoicInvoice/{claimInvoiceId}")]
        public async Task<DaysOffInvoice> GetDaysOffInvoicInvoice(int claimInvoiceId)
        {
            var DaysOffInvoice = await _claimInvoiceService.GetDaysOffInvoiceInvoice(claimInvoiceId);
            return DaysOffInvoice;
        }
        [HttpGet("GetClaimDisabilityAssessment/{personEventId}")]
        public async Task<ActionResult> GetClaimDisabilityAssessment(int personEventId)
        {
            var result = await _claimInvoiceService.GetClaimDisabilityAssessment(personEventId);
            return Ok(result);
        }

        [HttpGet("GetClaimDisabilityAssessmentById/{claimDisabilityAssessmentId}")]
        public async Task<ActionResult> GetClaimDisabilityAssessmentById(int claimDisabilityAssessmentId)
        {
            var result = await _claimInvoiceService.GetClaimDisabilityAssessmentById(claimDisabilityAssessmentId);
            return Ok(result);
        }

        [HttpGet("GetFuneralExpenseInvoice/{claimInvoiceId}")]
        public async Task<FuneralExpenseInvoice> GetFuneralExpenseInvoice(int claimInvoiceId)
        {
            var funeralExpenseInvoice = await _claimInvoiceService.GetFuneralExpenseInvoice(claimInvoiceId);
            return funeralExpenseInvoice;
        }

        [HttpGet("GetTravelExpenseInvoice/{claimInvoiceId}")]
        public async Task<TravelInvoice> GetTravelInvoice(int claimInvoiceId)
        {
            var travelInvoice = await _claimInvoiceService.GetTravelInvoice(claimInvoiceId);
            return travelInvoice;
        }

        [HttpGet("GetPartialDependencyLumpSumInvoice/{claimInvoiceId}")]
        public async Task<FatalPDLumpsumInvoice> GetPartialDependencyLumpSumInvoice(int claimInvoiceId)
        {
            return await _claimInvoiceService.GetPartialDependencyLumpSumInvoice(claimInvoiceId);
        }

        [HttpPost("AddClaimEstimate")]
        public async Task<ActionResult<ClaimEstimate>> AddClaimEstimate([FromBody] ClaimEstimate claimEstimate)
        {
            var result = await _claimInvoiceService.CreateEstimate(claimEstimate);
            return Ok(result);
        }

        [HttpPost("AddClaimEstimates/{personEventId}")]
        public async Task<ActionResult<bool>> AddClaimEstimates([FromBody] List<Benefit> benefits, int personEventId)
        {
            var result = await _claimInvoiceService.AddClaimEstimates(benefits, personEventId);
            return Ok(result);
        }

        [HttpPost("AddDaysOffInvoice")]
        public async Task<ActionResult<bool>> AddDaysOffInvoice([FromBody] DaysOffInvoice daysOffInvoice)
        {
            var result = await _claimInvoiceService.AddDaysOffInvoice(daysOffInvoice);
            return Ok(result);
        }

        [HttpPost("AddSundryInvoice")]
        public async Task<ActionResult<bool>> AddSundryInvoice([FromBody] SundryInvoice sundryInvoice)
        {
            var result = await _claimInvoiceService.AddSundryInvoice(sundryInvoice);
            return Ok(result);
        }

        [HttpPost("AddWidowLumpsumInvoice")]
        public async Task<ActionResult<bool>> AddWidowLumpsumInvoice([FromBody] WidowLumpSumInvoice widowLumpSumInvoice)
        {
            var result = await _claimInvoiceService.AddWidowLumpsumInvoice(widowLumpSumInvoice);
            return Ok(result);
        }

        [HttpPost("AddFatalPDLumpsumInvoice")]
        public async Task<ActionResult<bool>> AddFatalPDLumpsumInvoice([FromBody] FatalPDLumpsumInvoice fatalPDLumpsumInvoice)
        {
            var result = await _claimInvoiceService.AddFatalPDLumpsumInvoice(fatalPDLumpsumInvoice);
            return Ok(result);
        }

        [HttpPost("AddFuneralExpenseInvoice")]
        public async Task<ActionResult<bool>> AddFuneralExpenseInvoice([FromBody] FuneralExpenseInvoice funeralExpenseInvoice)
        {
            var result = await _claimInvoiceService.AddFuneralExpenseInvoice(funeralExpenseInvoice);
            return Ok(result);
        }

        [HttpPost("AddTravelInvoice")]
        public async Task<ActionResult<bool>> AddTravelInvoice([FromBody] TravelInvoice travelInvoice)
        {
            var result = await _claimInvoiceService.AddTravelInvoice(travelInvoice);
            return Ok(result);
        }

        [HttpPost("AddClaimDisabilityAssessment")]
        public async Task<ActionResult<int>> AddClaimDisabilityAssessment([FromBody] ClaimDisabilityAssessment claimDisabilityAssessment)
        {
            var result = await _claimInvoiceService.AddClaimDisabilityAssessment(claimDisabilityAssessment);
            return Ok(result);
        }

        [HttpPut("ApproveClaimDisabilityAssessmentStatus")]
        public async Task<ActionResult<bool>> ApproveClaimDisabilityAssessmentStatus([FromBody] ClaimDisabilityAssessment claimDisabilityAssessment)
        {
            var result = await _claimInvoiceService.ApproveClaimDisabilityAssessmentStatus(claimDisabilityAssessment);
            return Ok(result);
        }

        [HttpPost("AddTravelAuthorisation")]
        public async Task<ActionResult<bool>> AddTravelAuthorisation([FromBody] TravelAuthorisation travelAuthorisation)
        {
            var result = await _claimInvoiceService.AddTravelAuthorisation(travelAuthorisation);
            return Ok(result);
        }

        [HttpGet("GetTravelAuthorisedParties")]
        public async Task<ActionResult> GetTravelAuthorisedParties()
        {
            var result = await _claimInvoiceService.GetTravelAuthorisedParties();
            return Ok(result);
        }

        [HttpGet("GetTravelRateTypes")]
        public async Task<ActionResult> GetTravelRateTypes()
        {
            var result = await _claimInvoiceService.GetTravelRateTypes();
            return Ok(result);
        }

        [HttpGet("GetClaimBenefitTypes")]
        public async Task<ActionResult> GetClaimBenefitTypes()
        {
            var result = await _claimInvoiceService.GetClaimBenefitTypes();
            return Ok(result);
        }

        [HttpPost("RejectTTD")]
        public async Task<ActionResult<bool>> RejectTTD([FromBody] DaysOffInvoice daysOffInvoice)
        {
            var result = await _claimInvoiceService.RejectTTD(daysOffInvoice);
            return Ok(result);
        }


        [HttpGet("GetClaimEstimateByPersonEventId/{personEventId}")]
        public async Task<List<ClaimEstimate>> GetClaimEstimateByPersonEventId(int personEventId)
        {
            var result = await _claimInvoiceService.GetClaimEstimateByPersonEventId(personEventId);
            return result;
        }

        [HttpGet("GetClaimInvoiceByClaimInvoiceId/{claimInvoiceId}")]
        public async Task<ActionResult<ClaimInvoice>> GetClaimInvoiceByClaimInvoiceId(int claimInvoiceId)
        {
            var result = await _claimInvoiceService.GetClaimInvoiceByClaimInvoiceId(claimInvoiceId);
            return Ok(result);
        }

        [HttpGet("GetClaimInvoicesByClaimId/{claimId}")]
        public async Task<ActionResult<List<ClaimInvoice>>> GetClaimInvoicesByClaimId(int claimId)
        {
            var result = await _claimInvoiceService.GetClaimInvoicesByClaimId(claimId);
            return Ok(result);
        }

        [HttpPost("CreateEstimates/{policyId}")]
        public async Task<ActionResult<bool>> CreateEstimates([FromBody] Earning input, int policyId)
        {
            var result = await _claimInvoiceService.CreateEstimates(input, policyId);
            return Ok(result);
        }

        [HttpPost("SendPdPaidCloseletter")]
        public async Task<ActionResult> SendPdPaidCloseletter([FromBody] int personEventId)
        {
            var results = await _claimInvoiceService.SendPdPaidCloseletter(personEventId);
            return Ok(results);
        }

        [HttpPost("CreateInvoiceAllocation")]
        public async Task<ActionResult<bool>> CreateInvoiceAllocation([FromBody] ClaimInvoice claimInvoice)
        {
            var result = await _claimInvoiceService.CreateInvoiceAllocation(claimInvoice);
            return Ok(result);
        }

        [HttpPost("UpdateSundryInvoice")]
        public async Task<ActionResult<bool>> UpdateSundryInvoice([FromBody] SundryInvoice sundryInvoice)
        {
            var result = await _claimInvoiceService.UpdateSundryInvoice(sundryInvoice);
            return Ok(result);
        }

        [HttpPost("UpdateWidowLumpsumInvoice")]
        public async Task<ActionResult<bool>> UpdateWidowLumpsumInvoice([FromBody] WidowLumpSumInvoice widowLumpSumInvoice)
        {
            var result = await _claimInvoiceService.UpdateWidowLumpsumInvoice(widowLumpSumInvoice);
            return Ok(result);
        }

        [HttpPost("UpdateDaysOffInvoice")]
        public async Task<ActionResult<bool>> UpdateDaysOffInvoice([FromBody] DaysOffInvoice daysOffInvoice)
        {
            var result = await _claimInvoiceService.UpdateDaysOffInvoice(daysOffInvoice);
            return Ok(result);
        }

        [HttpPost("UpdateFuneralExpInvoice")]
        public async Task<ActionResult<bool>> UpdateFuneralExpInvoice([FromBody] FuneralExpenseInvoice funeralExpenseInvoice)
        {
            var result = await _claimInvoiceService.UpdateFuneralExpInvoice(funeralExpenseInvoice);
            return Ok(result);
        }

        [HttpPost("UpdatePartialDependencyLumpsumInvoice")]
        public async Task<ActionResult<bool>> UpdatePartialDependencyLumpsumInvoice([FromBody] FatalPDLumpsumInvoice fatalPDLumpsumInvoice)
        {
            var result = await _claimInvoiceService.UpdatePartialDependencyLumpsumInvoice(fatalPDLumpsumInvoice);
            return Ok(result);
        }

        [HttpGet("DeleteClaimInvoice/{claimInvoiceId}")]
        public async Task<ActionResult<bool>> DeleteClaimInvoice(int claimInvoiceId)
        {
            var result = await _claimInvoiceService.DeleteClaimInvoice(claimInvoiceId);
            return Ok(result);
        }

        [HttpGet("GetPagedClaimDisabilityAssessment/{personEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimDisabilityAssessment>>> GetPagedClaimDisabilityAssessment(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var result = await _claimInvoiceService.GetPagedClaimDisabilityAssessment(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return Ok(result);
        }

        [HttpPost("UpdateEstimates")]
        public async Task<ActionResult<bool>> UpdateEstimates([FromBody] Earning input)
        {
            var result = await _claimInvoiceService.UpdateEstimates(input);
            return Ok(result);
        }

        [HttpGet("GetPagedClaimTravelAuthorisation/{PersonEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimInvoice>>> GetPagedClaimTravelAuthorisations(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var result = await _claimInvoiceService.GetPagedClaimTravelAuthorisation(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return Ok(result);
        }

        [HttpPut("UpdateClaimDisabilityAssessment")]
        public async Task<ActionResult<bool>> UpdateClaimDisabilityAssessment([FromBody] ClaimDisabilityAssessment claimDisabilityAssessment)
        {
            var result = await _claimInvoiceService.UpdateClaimDisabilityAssessment(claimDisabilityAssessment);
            return Ok(result);
        }

        [HttpPut("DeleteClaimDisabilityAssessment")]
        public async Task<ActionResult<bool>> DeleteClaimDisabilityAssessment([FromBody] ClaimDisabilityAssessment claimDisabilityAssessment)
        {
            var result = await _claimInvoiceService.DeleteClaimDisabilityAssessment(claimDisabilityAssessment);
            return Ok(result);
        }

        [HttpGet("GetPagedPdLumpSumAwards/{personEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PdAward>>> GetPagedPdLumpSumAwards(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var pdLumpsumAwards = await _claimInvoiceService.GetPagedPdLumpSumAwards(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return pdLumpsumAwards;
        }

        [HttpPost("AddClaimPdLumpsumAward")]
        public async Task<bool> AddClaimPdLumpsumAward([FromBody] PdAward pdAward)
        {
            var result = await _claimInvoiceService.AddClaimPdLumpsumAward(pdAward);
            return result;
        }

        [HttpPut("ApprovePDLumpsumAward")]
        public async Task<bool> ApprovePDLumpsumAward([FromBody] PdAward pdAward)
        {
            var result = await _claimInvoiceService.ApprovePDLumpsumAward(pdAward);
            return result;
        }


        [HttpPost("GetClaimBenefitFormula")]
        public async Task<ActionResult<bool>> GetClaimBenefitFormula(int claimInvoiceType)
        {
            var result = await _claimInvoiceService.GetClaimBenefit(claimInvoiceType);
            return Ok(result);
        }

        [HttpGet("ReinstateClaimInvoice/{claimInvoiceId}")]
        public async Task<ActionResult<bool>> ReinstateClaimInvoice(int claimInvoiceId)
        {
            var result = await _claimInvoiceService.ReinstateClaimInvoice(claimInvoiceId);
            return Ok(result);
        }

        [HttpPost("UpdateClaimInvoice")]
        public async Task<ActionResult<bool>> UpdateClaimInvoice([FromBody] ClaimInvoice claimInvoice)
        {
            var result = await _claimInvoiceService.UpdateClaimInvoice(claimInvoice);
            return Ok(result);
        }

        [HttpGet("GetPagedClaimEstimates/{PersonEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimEstimate>>> GetPagedClaimEstimates(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var claimEstimates = await _claimInvoiceService.GetPagedClaimEstimates(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return Ok(claimEstimates);
        }

        [HttpGet("GetDaysOffInvoiceByClaimId/{claimId}")]
        public async Task<ActionResult<List<ClaimInvoice>>> GetDaysOffInvoiceByClaimId(int claimId)
        {
            var results = await _claimInvoiceService.GetDaysOffInvoiceByClaimId(claimId);
            return Ok(results);
        }

        [HttpGet("GetTTDBenefit/{industryClass}/{daysOff}/{personEventId}")]
        public async Task<ActionResult<decimal>> GetTTDBenefit(IndustryClassEnum industryClass, int daysOff, int personEventId)
        {
            var result = await _claimInvoiceService.GetTTDBenefit(industryClass, daysOff, personEventId);
            return Ok(result);
        }

        [HttpGet("GetClaimHearingAssessment/{personEventId}")]
        public async Task<ActionResult<List<ClaimDisabilityAssessment>>> GetClaimHearingAssessment(int personEventId)
        {
            var result = await _claimInvoiceService.GetClaimHearingAssessment(personEventId);
            return Ok(result);
        }

        [HttpGet("GetClaimEstimateByPersonEventAndEstimateType/{personEventId}/{estimateType}")]
        public async Task<ActionResult<List<ClaimEstimate>>> GetClaimEstimateByPersonEventAndEstimateType(int personEventId, EstimateTypeEnum estimateType)
        {
            var result = await _claimInvoiceService.GetClaimEstimateByPersonEventAndEstimateType(personEventId, estimateType);
            return Ok(result);
        }

        [HttpGet("GetTTDs18MonthsOld")]
        public async Task<ActionResult<List<DaysOffInvoice>>> GetTTDs18MonthsOld()
        {
            var result = await _claimInvoiceService.GetTTDs18MonthsOld();
            return Ok(result);
        }

        [HttpGet("GetWidowLumpsumInvoiceByClaimId/{claimId}")]
        public async Task<ActionResult<List<ClaimInvoice>>> GetWidowLumpsumInvoiceByClaimId(int claimId)
        {
            var results = await _claimInvoiceService.GetWidowLumpsumInvoiceByClaimId(claimId);
            return Ok(results);
        }

        [HttpGet("DaysOffInvoiceRejectCommunication/{personEventId}/{claimInvoiceId}")]
        public async Task<ActionResult<bool>> DaysOffInvoiceRejectCommunication(int personEventId, int claimInvoiceId)
        {
            var result = await _claimInvoiceService.DaysOffInvoiceRejectCommunication(personEventId, claimInvoiceId);
            return Ok(result);
        }

        [HttpGet("GetFuneralExpenseInvoiceByClaimId/{claimId}")]
        public async Task<ActionResult<List<ClaimInvoice>>> GetFuneralExpenseInvoiceByClaimId(int claimId)
        {
            var results = await _claimInvoiceService.GetFuneralExpenseInvoiceByClaimId(claimId);
            return Ok(results);
        }

        [HttpGet("GetSundryInvoiceByClaimId/{claimId}")]
        public async Task<ActionResult<List<ClaimInvoice>>> GetSundryInvoiceByClaimId(int claimId)
        {
            var results = await _claimInvoiceService.GetSundryInvoiceByClaimId(claimId);
            return Ok(results);
        }

        [HttpPost("UpdateEstimate")]
        public async Task<ActionResult<bool>> UpdateEstimate([FromBody] ClaimEstimate claimEstimate)
        {
            var result = await _claimInvoiceService.UpdateEstimate(claimEstimate);
            return Ok(result);
        }

        [HttpPost("UpdateClaimEstimatesV2")]
        public async Task<ActionResult<List<ClaimEstimate>>> UpdateClaimEstimatesV2([FromBody] List<ClaimEstimate> claimEstimates)
        {
            var result = await _claimInvoiceService.UpdateClaimEstimatesV2(claimEstimates);
            return Ok(result);
        }

        [HttpGet("GetClaimBenefitsByClaimId/{claimId}")]
        public async Task<ActionResult<List<ClaimBenefit>>> GetClaimBenefitsByClaimId(int claimId)
        {
            var result = await _claimInvoiceService.GetClaimBenefitsClaimId(claimId);
            return Ok(result);
        }

        [HttpPost("AddClaimBenefit")]
        public async Task<ActionResult<int>> AddClaimBenefit([FromBody] ClaimBenefit claimBenefit)
        {
            var result = await _claimInvoiceService.AddClaimBenefit(claimBenefit);
            return Ok(result);
        }

        [HttpGet("GetClaimBenefitFormulaByEstimateType/{estimateType}")]
        public async Task<ActionResult<ClaimBenefitFormula>> GetClaimBenefitFormulaByEstimateType(EstimateTypeEnum estimateType)
        {
            var result = await _claimInvoiceService.GetClaimBenefitFormulaByEstimateType(estimateType);
            return Ok(result);
        }

        [HttpPost("GetTopRankedEstimatesFromMedicalReport")]
        public async Task<ActionResult<TopRankedEstimateAmount>> GetTopRankedEstimatesFromMedicalReport([FromBody] PersonEvent personEvent)
        {
            var result = await _claimInvoiceService.GetTopRankedEstimatesFromMedicalReport(personEvent);
            return Ok(result);
        }

        [HttpPost("ReCalculateAllClaimEstimates/{isMedicalReportOverride}")]
        public async Task<ActionResult<List<ClaimEstimate>>> ReCalculateAllClaimEstimates([FromBody] PersonEvent personEvent, bool isMedicalReportOverride)
        {
            var result = await _claimInvoiceService.ReCalculateAllClaimEstimates(personEvent, isMedicalReportOverride);
            return Ok(result);
        }

        [HttpPost("ReCalculateClaimEstimates")]
        public async Task<ActionResult<List<ClaimEstimate>>> ReCalculateClaimEstimates([FromBody] List<ClaimEstimate> claimEstimates)
        {
            var result = await _claimInvoiceService.ReCalculateClaimEstimates(claimEstimates);
            return Ok(result);
        }

        [HttpGet("GetDaysOffInvoiceByPersonEventId/{personEventId}")]
        public async Task<ActionResult<List<DaysOffInvoice>>> GetDaysOffInvoiceByPersonEventId(int personEventId)
        {
            var result = await _claimInvoiceService.GetDaysOffInvoiceByPersonEventId(personEventId);
            return Ok(result);
        }

        [HttpPost("AddFatalLumpsumInvoice")]
        public async Task<ActionResult<bool>> AddFatalLumpsumInvoice([FromBody] FatalLumpsumInvoice fatalLumpSumInvoice)
        {
            var result = await _claimInvoiceService.AddFatalLumpsumInvoice(fatalLumpSumInvoice);
            return Ok(result);
        }

        [HttpGet("GetFatalLumpSumInvoice/{claimInvoiceId}")]
        public async Task<FatalLumpsumInvoice> GetFatalLumpSumInvoice(int claimInvoiceId)
        {
            var fatalLumpSumInvoice = await _claimInvoiceService.GetFatalLumpSumInvoice(claimInvoiceId);
            return fatalLumpSumInvoice;
        }

        [HttpPost("UpdateFatalLumpsumInvoice")]
        public async Task<ActionResult<bool>> UpdateFatalLumpsumInvoice([FromBody] FatalLumpsumInvoice fatalLumpSumInvoice)
        {
            var result = await _claimInvoiceService.UpdateFatalLumpsumInvoice(fatalLumpSumInvoice);
            return Ok(result);
        }

        [HttpPost("AutoGenerateInvoices")]
        public async Task<ActionResult<bool>> AutoGenerateInvoices([FromBody] int personEventId)
        {
            var result = await _claimInvoiceService.AutoGenerateInvoices(personEventId);
            return Ok(result);
        }
    }
}