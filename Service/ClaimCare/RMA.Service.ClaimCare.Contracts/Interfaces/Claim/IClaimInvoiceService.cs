using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    using Entities;
    using Benefit = ClientCare.Contracts.Entities.Product.Benefit;

    public interface IClaimInvoiceService : IService
    {
        Task<ClaimInvoice> CreateClaimInvoice(ClaimInvoice claimInvoice);
        Task<List<ClaimInvoice>> CreateClaimInvoices(List<ClaimInvoice> claimInvoices);
        Task<ClaimInvoice> UpdateClaimInvoiceV2(ClaimInvoice claimInvoice);
        Task<PagedRequestResult<ClaimInvoice>> GetPagedClaimInvoices(PagedRequest request, int personEventId);
        Task<PagedRequestResult<TravelAuthorisation>> GetPagedClaimTravelAuthorisation(PagedRequest request, int personEventId);
        Task<PagedRequestResult<ClaimInvoice>> GetPagedClaimInvoiceAllocations(PagedRequest request, int personEventId);
        Task<SundryInvoice> GetSundryInvoice(int claimInvoiceId);
        Task<WidowLumpSumInvoice> GetWidowLumpSumInvoice(int claimInvoiceId);
        Task<PdAward> GetPDAward(int claimInvoiceId);
        Task<TravelInvoice> GetTravelInvoice(int claimInvoiceId);
        Task<FuneralExpenseInvoice> GetFuneralExpenseInvoice(int claimInvoiceId);
        Task<FatalPDLumpsumInvoice> GetPartialDependencyLumpSumInvoice(int claimInvoiceId);
        Task<DaysOffInvoice> GetDaysOffInvoiceInvoice(int claimInvoiceId);
        Task<bool> AddDaysOffInvoice(DaysOffInvoice daysOffInvoice);
        Task<bool> AddSundryInvoice(SundryInvoice sundryInvoice);
        Task<bool> AddWidowLumpsumInvoice(WidowLumpSumInvoice widowLumpSumInvoice);
        Task<bool> AddFatalPDLumpsumInvoice(FatalPDLumpsumInvoice fatalPDLumpsumInvoice);
        Task<bool> AddFuneralExpenseInvoice(FuneralExpenseInvoice funeralExpenseInvoice);
        Task<bool> AddTravelInvoice(TravelInvoice travelInvoice);
        Task<List<ClaimDisabilityAssessment>> GetClaimDisabilityAssessment(int personEventId);
        Task<bool> ApproveClaimDisabilityAssessmentStatus(ClaimDisabilityAssessment claimDisabilityAssessment);
        Task<int> AddClaimDisabilityAssessment(ClaimDisabilityAssessment claimDisabilityAssessment);
        Task<bool> AddTravelAuthorisation(TravelAuthorisation travelAuthorisation);
        Task<List<TravelAuthorisedParty>> GetTravelAuthorisedParties();
        Task<List<TravelRateType>> GetTravelRateTypes();
        Task<List<ClaimBenefitType>> GetClaimBenefitTypes();
        Task<bool> RejectTTD(DaysOffInvoice daysOffInvoice);
        Task<ClaimEstimate> AddClaimEstimate(ClaimEstimate claimEstimate);
        Task<bool> AddClaimEstimates(List<Benefit> benefits, int personEventId);
        Task<ClaimEstimate> GetClaimEstimateByClaimEstimateId(int claimEstimateId);
        Task<bool> UpdateClaimEstimate(ClaimEstimate claimEstimate);
        Task<ClaimInvoice> GetClaimInvoiceByClaimInvoiceId(int claimInvoiceId);
        Task<List<ClaimInvoice>> GetClaimInvoicesByClaimId(int claimId);
        Task<List<ClaimEstimate>> GetClaimEstimateByPersonEventId(int personEventId);
        Task<bool> CreateEstimates(Earning earning, int policyId);
        Task<bool> SendPdPaidCloseletter(int personEventId);
        Task<bool> CreateInvoiceAllocation(ClaimInvoice claimInvoice);
        Task<bool> UpdateSundryInvoice(SundryInvoice sundryInvoice);
        Task<bool> UpdateWidowLumpsumInvoice(WidowLumpSumInvoice widowLumpSumInvoice);
        Task<bool> DeleteClaimInvoice(int claimInvoiceId);
        Task<PagedRequestResult<ClaimDisabilityAssessment>> GetPagedClaimDisabilityAssessment(PagedRequest request, int personEventId);
        Task<bool> UpdateEstimates(Earning earning);
        Task<ClaimDisabilityAssessment> GetClaimDisabilityAssessmentById(int claimDisabilityAssessmentId);
        Task<bool> UpdateClaimDisabilityAssessment(ClaimDisabilityAssessment claimDisabilityAssessment);
        Task<bool> DeleteClaimDisabilityAssessment(ClaimDisabilityAssessment claimDisabilityAssessment);
        Task<bool> UpdateDaysOffInvoice(DaysOffInvoice daysOffInvoice);
        Task<bool> AddClaimPdLumpsumAward(PdAward pdAward);
        Task<PagedRequestResult<PdAward>> GetPagedPdLumpSumAwards(PagedRequest request, int personEventId);
        Task<bool> ApprovePDLumpsumAward(PdAward pdAward);
        Task<ClaimBenefitFormula> GetClaimBenefit(int claimInvoiceType);
        Task<bool> ReinstateClaimInvoice(int claimInvoiceId);
        Task<bool> UpdateFuneralExpInvoice(FuneralExpenseInvoice funeralExpenseInvoice);
        Task<bool> UpdatePartialDependencyLumpsumInvoice(FatalPDLumpsumInvoice fatalPDLumpsumInvoice);
        Task<decimal> CalculateClaimBenefits(int benefitId, Dictionary<string, string> Tokens);
        Task<bool> RejectTTDLiabilityDecisionNotMade(int claimId, ClaimStatusEnum claimStatus, ClaimLiabilityStatusEnum claimLiabilityStatus);
        Task<bool> UpdateClaimInvoice(ClaimInvoice claimInvoice);
        Task<PagedRequestResult<ClaimEstimate>> GetPagedClaimEstimates(PagedRequest request, int personEventId);
        Task<List<ClaimInvoice>> GetDaysOffInvoiceByClaimId(int claimId);
        Task<decimal> GetTTDBenefit(IndustryClassEnum industryClass, int daysOff, int personEventId);
        Task<List<ClaimHearingAssessment>> GetClaimHearingAssessment(int personEventId);
        Task<List<ClaimEstimate>> GetClaimEstimateByPersonEventAndEstimateType(int personEventId, EstimateTypeEnum estimateType);
        Task<List<DaysOffInvoice>> GetTTDs18MonthsOld();
        Task<List<ClaimInvoice>> GetWidowLumpsumInvoiceByClaimId(int claimId);
        Task<bool> DaysOffInvoiceRejectCommunication(int personEventId, int claimInvoiceId);
        Task<List<ClaimInvoice>> GetFuneralExpenseInvoiceByClaimId(int claimId);
        Task<List<ClaimInvoice>> GetSundryInvoiceByClaimId(int claimId);
        Task<bool> UpdateClaimInvoiceStatus(int claimInvoiceId, ClaimInvoiceStatus claimInvoiceStatus);
        Task<bool> UpdateEstimate(ClaimEstimate claimEstimate);
        Task<bool> CreateEstimate(ClaimEstimate claimEstimate);
        Task<List<ClaimBenefit>> GetClaimBenefitsClaimId(int claimId);
        Task<int> AddClaimBenefit(ClaimBenefit claimBenefit);
        Task<ClaimEstimate> CalculateClaimEstimateValue(Benefit benefit, Earning earning, TopRankedEstimateAmount topRankedEstimate);
        Task<ClaimBenefitFormula> GetClaimBenefitFormulaByEstimateType(EstimateTypeEnum estimateTypeEnum);
        Task<List<ClaimEstimate>> AddClaimEstimatesV2(List<ClaimEstimate> claimEstimates);
        Task<List<ClaimEstimate>> UpdateClaimEstimatesV2(List<ClaimEstimate> claimEstimates);
        Task<TopRankedEstimateAmount> GetTopRankedEstimatesFromMedicalReport(PersonEvent personEvent);
        Task<TopRankedEstimateAmount> GetTopRankedEstimatesFromPhysicalInjury(PersonEvent personEvent);
        Task<List<ClaimEstimate>> ReCalculateAllClaimEstimates(PersonEvent personEvent, bool isMedicalReportOverride);
        Task<List<ClaimEstimate>> ReCalculateClaimEstimates(List<ClaimEstimate> claimEstimates);
        Task<List<DaysOffInvoice>> GetDaysOffInvoiceByPersonEventId(int personEventId);
        Task<ClaimInvoice> GetClaimInvoiceByClaimId(int claimId);
        Task<bool> AddFatalLumpsumInvoice(FatalLumpsumInvoice fatalLumpsumInvoice);
        Task<FatalLumpsumInvoice> GetFatalLumpSumInvoice(int claimInvoiceId);
        Task<bool> UpdateFatalLumpsumInvoice(FatalLumpsumInvoice fatalLumpSumInvoice);
        Task<List<ClaimEstimate>> ReCalculateTTDClaimEstimates(PersonEvent personEvent);
        Task<List<ClaimEstimate>> ReCalculatePDClaimEstimates(PersonEvent personEvent);
        Task<bool> AddNonStatutaryAugKickInClaimEstimates(List<Benefit> benefits, int personEventId, List<int> claimIds);
        Task<bool> AutoGenerateInvoices(int personEventId);
    }
}