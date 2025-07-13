using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Database.Entities;

namespace RMA.Service.ClaimCare.Mappers
{
    public class ClaimCareMappingProfile : Profile
    {
        public ClaimCareMappingProfile()
        {
            CreateMap<claim_RuleDocumentType, RuleDocumentType>()
                .ForMember(a => a.DocumentTypeId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_RuleDocumentType>(s.Id));

            CreateMap<claim_Claim, Claim>()
                .ForMember(s => s.ClaimNumber, opt => opt.Ignore())
                .ForMember(s => s.TotalBenefitAmount, opt => opt.Ignore())
                .ForMember(s => s.WorkPoolId, opt => opt.Ignore())
                .ForMember(s => s.ClaimStatusId, opt => opt.Ignore())
                .ForMember(s => s.ClaimClosedReasonId, opt => opt.Ignore())
                .ForMember(s => s.PaymentId, opt => opt.Ignore())
                .ForMember(s => s.ClaimantEmail, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.ClaimLiabilityStatusId, opt => opt.Ignore())
                .ForMember(s => s.ClaimInvoices, opt => opt.Ignore())
                .ForMember(s => s.PersonEventDeathDate, opt => opt.Ignore())
                .ForMember(s => s.PolicyCount, opt => opt.Ignore())
                .ForMember(s => s.CAA, opt => opt.Ignore())
                .ForMember(s => s.ClaimNotes, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_Claim>(s.ClaimId));

            CreateMap<claim_DocumentRule, DocumentRule>()
                .ForMember(s => s.DeathTypeId, opt => opt.Ignore())
                .ForMember(s => s.DocumentSetId, opt => opt.Ignore())
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<claim_DocumentRule>(s.Id));

            CreateMap<claim_ClaimBenefit, ClaimBenefit>()
                .ReverseMap()
                .ForMember(s => s.Claim, opt => opt.Ignore())
                .ForMember(s => s.ClaimInvoices, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimBenefit>(s.ClaimBenefitId));

            CreateMap<claim_ClaimsCalculatedAmount, ClaimsCalculatedAmount>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimsCalculatedAmount>(s.ClaimsCalculatedAmountId));

            CreateMap<claim_TracerInvoice, ClaimTracerInvoice>()
                .ForMember(s => s.ClaimBankAccountVerification, opt => opt.Ignore())
                .ForMember(s => s.ProductId, opt => opt.Ignore())
                .ForMember(s => s.Product, opt => opt.Ignore())
                .ForMember(s => s.ClaimInvoiceType, opt => opt.Ignore())
                .ForMember(s => s.InvoiceDate, opt => opt.Ignore())
                .ForMember(s => s.PolicyId, opt => opt.Ignore())
                .ForMember(s => s.PolicyNumber, opt => opt.Ignore())
                .ForMember(s => s.CapturedDate, opt => opt.Ignore())
                .ForMember(s => s.BeneficiaryDetail, opt => opt.Ignore())
                .ForMember(s => s.MessageText, opt => opt.Ignore())
                .ForMember(s => s.BankAccountId, opt => opt.Ignore())
                .ForMember(s => s.TracerEmail, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_TracerInvoice>(s.TracerInvoiceId));

            CreateMap<claim_PersonEvent, PersonEvent>()
                .ForMember(s => s.FirstName, opt => opt.Ignore())
                .ForMember(s => s.LastName, opt => opt.Ignore())
                .ForMember(s => s.RuleResult, opt => opt.Ignore())
                .ForMember(s => s.PolicyIds, opt => opt.Ignore())
                .ForMember(s => s.MedicalReports, opt => opt.Ignore())
                .ForMember(s => s.ClaimNotes, opt => opt.Ignore())
                .ForMember(s => s.IsApproved, opt => opt.Ignore())
                .ForMember(s => s.RolePlayers, opt => opt.Ignore())
                .ForMember(s => s.RolePlayer, opt => opt.Ignore())
                .ForMember(s => s.DocumentSetEnum, opt => opt.Ignore())
                .ForMember(s => s.IsVopdOverridden, opt => opt.Ignore())
                .ForMember(s => s.anyEligiblePolicies, opt => opt.Ignore())
                .ForMember(s => s.FirstMedicalReport, opt => opt.Ignore())
                .ForMember(s => s.ProgressMedicalReportForms, opt => opt.Ignore())
                .ForMember(s => s.FinalMedicalReport, opt => opt.Ignore())
                .ForMember(s => s.Beneficiaries, opt => opt.Ignore())
                .ForMember(s => s.ClaimAccidentCloseLetterTypeEnum, opt => opt.Ignore())
                .ForMember(s => s.ClaimInvoiceId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEvent>(s.PersonEventId));

            CreateMap<claim_PersonEventDeathDetail, PersonEventDeathDetail>()
                .ForMember(s => s.DeathTypeId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEventDeathDetail>(s.PersonEventId));

            CreateMap<claim_ClaimAdditionalRequiredDocument, ClaimAdditionalRequiredDocument>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimAdditionalRequiredDocument>(s.ClaimAdditionalRequiredDocumentId));

            CreateMap<claim_MedicalReport, MedicalReport>()
                .ForMember(s => s.MedicalReportTypeId, opt => opt.Ignore())
                .ForMember(s => s.MedicalReportCategoryId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_MedicalReport>(s.MedicalReportId));

            CreateMap<claim_PersonEventDiseaseDetail, PersonEventDiseaseDetail>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEventDiseaseDetail>(s.PersonEventId));


            CreateMap<claim_PersonEventNoiseDetail, PersonEventNoiseDetail>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEventNoiseDetail>(s.PersonEventId));

            CreateMap<claim_ClaimBucketClass, ClaimBucketClass>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimBucketClass>(s.ClaimBucketClassId));

            CreateMap<claim_Event, Event>()
                .ForMember(s => s.CompanyRolePlayer, opt => opt.Ignore())
                .ForMember(s => s.ProductCategoryType, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_Event>(s.EventId));


            CreateMap<claim_EarningType, EarningType>()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_EarningType>(s.EarningTypeId));

            CreateMap<claim_Earning, Earning>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_Earning>(s.EarningId));

            CreateMap<claim_EarningDetail, EarningDetail>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_EarningDetail>(s.EarningDetailId));

            CreateMap<claim_PersonEventAccidentDetail, PersonEventAccidentDetail>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEventAccidentDetail>(s.PersonEventId));

            CreateMap<claim_PersonEventAssaultDetail, PersonEventAssaultDetail>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEventAssaultDetail>(s.PersonEventAssaultDetailId));

            CreateMap<claim_PersonEventQuestionnaire, PersonEventQuestionnaire>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEventQuestionnaire>(s.PersonEventId));

            CreateMap<claim_ClaimRuleAudit, ClaimRuleAudit>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimRuleAudit>(s.ClaimId));

            CreateMap<claim_ClaimNote, ClaimNote>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimNote>(s.ClaimNoteId));

            CreateMap<claim_ClaimWorkflow, ClaimWorkflow>()
                .ForMember(s => s.ClaimStatusId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimWorkflow>(s.ClaimWorkflowId));

            CreateMap<claim_ClaimsTracing, ClaimsTracing>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimsTracing>(s.ClaimsTracingId));

            CreateMap<claim_ClaimInvoice, ClaimInvoice>()
                .ForMember(s => s.UnclaimedPaymentInterest, opt => opt.Ignore())
                .ForMember(s => s.TracingFees, opt => opt.Ignore())
                .ForMember(s => s.CapAmount, opt => opt.Ignore())
                .ForMember(s => s.CoverAmount, opt => opt.Ignore())
                .ForMember(s => s.Benefits, opt => opt.Ignore())
                .ForMember(s => s.Decision, opt => opt.Ignore())
                .ForMember(s => s.DecisionId, opt => opt.Ignore())
                .ForMember(s => s.ClaimAmount, opt => opt.Ignore())
                .ForMember(s => s.Refund, opt => opt.Ignore())
                .ForMember(s => s.ClaimStatusId, opt => opt.Ignore())
                .ForMember(s => s.OutstandingPremium, opt => opt.Ignore())
                .ForMember(s => s.DecisionReasonId, opt => opt.Ignore())
                .ForMember(s => s.ClaimReferenceNumber, opt => opt.Ignore())
                .ForMember(s => s.PolicyId, opt => opt.Ignore())
                .ForMember(s => s.PolicyNumber, opt => opt.Ignore())
                .ForMember(s => s.CapturedDate, opt => opt.Ignore())
                .ForMember(s => s.ProductId, opt => opt.Ignore())
                .ForMember(s => s.Product, opt => opt.Ignore())
                .ForMember(s => s.BeneficiaryDetail, opt => opt.Ignore())
                .ForMember(s => s.MessageText, opt => opt.Ignore())
                .ForMember(s => s.BankAccountId, opt => opt.Ignore())
                .ForMember(s => s.ClaimantEmail, opt => opt.Ignore())
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.ClaimNote, opt => opt.Ignore())
                .ForMember(s => s.MobileNumber, opt => opt.Ignore())
                .ForMember(s => s.IsBankingApproved, opt => opt.Ignore())
                .ForMember(s => s.ReversalReasonId, opt => opt.Ignore())
                .ForMember(s => s.ClaimBankAccountVerification, opt => opt.Ignore())
                .ForMember(s => s.ReferToManagerId, opt => opt.Ignore())
                .ForMember(s => s.Payee, opt => opt.Ignore())
                .ForMember(s => s.PayeeTypeId, opt => opt.Ignore())
                .ForMember(s => s.DaysOffFrom, opt => opt.Ignore())
                .ForMember(s => s.DaysOffTo, opt => opt.Ignore())
                .ForMember(s => s.TotalDaysOff, opt => opt.Ignore())
                .ForMember(s => s.ClaimEstimateId, opt => opt.Ignore())
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimInvoice>(s.ClaimInvoiceId));

            CreateMap<claim_FuneralInvoice, FuneralInvoice>()
               .ForMember(s => s.Id, opt => opt.Ignore())
               .ForMember(s => s.IsActive, opt => opt.Ignore())
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<claim_FuneralInvoice>(s.ClaimInvoiceId));

            CreateMap<claim_UnclaimedBenefitHeader, UnclaimedBenefitHeader>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_UnclaimedBenefitHeader>(s.UnclaimedBenefitHeaderId));

            CreateMap<claim_UnclaimedBenefitInterest, UnclaimedBenefitInterest>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_UnclaimedBenefitInterest>(s.UnclaimedBenefitInterestId));

            CreateMap<claim_ParentInsuranceType, ParentInsuranceType>()
                .ForMember(s => s.EventTypeId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_ParentInsuranceType>(s.ParentInsuranceTypeId));

            CreateMap<claim_EventCause, EventCause>()
                .ForMember(s => s.EventTypeId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_EventCause>(s.EventCauseId));

            CreateMap<claim_PhysicalDamage, PhysicalDamage>()
                .ForMember(s => s.Icd10DiagnosticGroupCode, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PhysicalDamage>(s.PhysicalDamageId));

            CreateMap<claim_Injury, Injury>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_Injury>(s.InjuryId));

            CreateMap<claim_SecondaryInjury, SecondaryInjury>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_SecondaryInjury>(s.SecondaryInjuryId));

            CreateMap<claim_PatersonGrading, PatersonGrading>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PatersonGrading>(s.PatersonGradingId));

            CreateMap<claim_Icd10CodeEstimateLookup, Icd10CodeEstimateLookup>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<claim_Icd10CodeEstimateLookup>(s.Icd10CodeEstimateLookupId));

            CreateMap<claim_DaysOffLookup, DaysOffLookup>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<claim_DaysOffLookup>(s.DaysOffLookupId));

            CreateMap<claim_MedicalCostLookup, MedicalCostLookup>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<claim_MedicalCostLookup>(s.MedicalCostLookupId));

            CreateMap<claim_PdExtentLookup, PdExtentLookup>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<claim_PdExtentLookup>(s.PdExtentLookupId));

            CreateMap<claim_MedicalReportFormWizardDetail, MedicalReportFormWizardDetail>()
                .ReverseMap();

            CreateMap<claim_PersonEventStpExitReason, PersonEventStpExitReason>()
                .ForMember(s => s.CompCarePersonEventId, opt => opt.Ignore())
                .ForMember(s => s.MessageId, opt => opt.Ignore())
                .ForMember(s => s.SuspiciousTransactionStatus, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEventStpExitReason>(s.ClaimStpExitReasonId));

            CreateMap<claim_StpExitReason, StpExitReason>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<claim_StpExitReason>(s.StpExitReasonId));

            CreateMap<claim_ClaimRequirementCategory, ClaimRequirementCategory>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimRequirementCategory>(s.ClaimRequirementCategoryId));

            CreateMap<claim_ClaimRequirementCategoryMapping, ClaimRequirementCategoryMapping>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimRequirementCategoryMapping>(s.ClaimRequirementCategoryMappingId));


            CreateMap<claim_PersonEventClaimRequirement, PersonEventClaimRequirement>()
                .ReverseMap()
            .ForMember(s => s.ClaimRequirementCategory, opt => opt.Ignore())
            .ForMember(s => s.PersonEvent, opt => opt.Ignore())
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_PersonEventClaimRequirement>(s.PersonEventClaimRequirementId));

            CreateMap<claim_TtdInvoice, TtdInvoice>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_TtdInvoice>(s.ClaimInvoiceId));

            CreateMap<claim_DaysOffInvoice, DaysOffInvoice>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_DaysOffInvoice>(s.ClaimInvoiceId));

            CreateMap<claim_SundryInvoice, SundryInvoice>()
               .ReverseMap()
           .ConstructUsing(s => MapperExtensions.GetEntity<claim_SundryInvoice>(s.ClaimInvoiceId));

            CreateMap<claim_WidowLumpSumInvoice, WidowLumpSumInvoice>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_WidowLumpSumInvoice>(s.ClaimInvoiceId));

            CreateMap<claim_FatalPdLumpsumInvoice, FatalPDLumpsumInvoice>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_FatalPdLumpsumInvoice>(s.ClaimInvoiceId));

            CreateMap<claim_FuneralExpenseInvoice, FuneralExpenseInvoice>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_FuneralExpenseInvoice>(s.ClaimInvoiceId));

            CreateMap<claim_SundryServiceProvider, SundryServiceProvider>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_SundryServiceProvider>(s.RolePlayerId));

            CreateMap<claim_ClaimDisabilityAssessment, ClaimDisabilityAssessment>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimDisabilityAssessment>(s.ClaimDisabilityAssessmentId));

            CreateMap<claim_HearingAssessment, ClaimHearingAssessment>()
                .ForMember(s => s.HearingAssessmentType, opt => opt.Ignore())
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_HearingAssessment>(s.HearingAssessmentId));

            CreateMap<claim_AudioGramItem, ClaimAudioGramItem>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_AudioGramItem>(s.AudioGramItemId));

            CreateMap<claim_ClaimDisabilityPension, ClaimDisabilityPension>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimDisabilityPension>(s.DisabilityPensionId));

            CreateMap<claim_TravelAuthorisation, TravelAuthorisation>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_TravelAuthorisation>(s.TravelAuthorisationId));

            CreateMap<claim_TravelAuthorisedParty, TravelAuthorisedParty>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_TravelAuthorisedParty>(s.TravelAuthorisedPartyId));

            CreateMap<claim_TravelRateType, TravelRateType>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_TravelRateType>(s.TravelRateTypeId));

            CreateMap<claim_ClaimBenefitType, ClaimBenefitType>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimBenefitType>(s.ClaimBenefitTypeId));

            CreateMap<claim_ClaimEstimate, ClaimEstimate>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimEstimate>(s.ClaimEstimateId));

            CreateMap<claim_ClaimBenefitFormula, ClaimBenefitFormula>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimBenefitFormula>(s.ClaimBenefitFormulaId));

            CreateMap<claim_PdAward, PdAward>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_PdAward>(s.PdAwardId));

            CreateMap<claim_ClaimBenefitsAmount, ClaimsBenefitsAmount>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_ClaimBenefitsAmount>(s.ClaimBenefitAmountId));

            CreateMap<claim_FatalLumpSumInvoice, FatalLumpsumInvoice>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<claim_FatalLumpSumInvoice>(s.ClaimInvoiceId));

        }
    }
}