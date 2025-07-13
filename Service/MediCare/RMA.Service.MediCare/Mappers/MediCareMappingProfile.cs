using AutoMapper;

using CommonServiceLocator;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace RMA.Service.MediCare.Mappers
{
    public class MediCareMappingProfile : Profile
    {
        /// <summary>
        /// Create the mappers that map the database types to the contract types
        /// </summary>
        public MediCareMappingProfile()
        {
            CreateMap<medical_HealthCareProvider, HealthCareProvider>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PractitionerTypeName, opt => opt.Ignore())
                .ForMember(s => s.IsHospital, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_LevelOfCare, LevelOfCare>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.LevelOfCareId, opt => opt.MapFrom(t => t.Id))
                .ReverseMap();

            CreateMap<medical_MedicalItem, MedicalItem>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.MedicalItemId, opt => opt.MapFrom(t => t.MedicalItemId))
                .ReverseMap();

            CreateMap<medical_MedicalItemTreatmentCode, MedicalItemTreatmentCode>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.MedicalItemTreatmentCodeId, opt => opt.MapFrom(t => t.MedicalItemTreatmentCodeId))
                .ReverseMap();

            CreateMap<medical_MedicalItemType, MedicalItemType>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.MedicalItemTypeId, opt => opt.MapFrom(t => t.MedicalItemTypeId))
                .ReverseMap();

            CreateMap<medical_PractitionerType, PractitionerType>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.PractitionerTypeId, opt => opt.MapFrom(t => t.PractitionerTypeId))
                .ReverseMap();

            CreateMap<medical_PreAuthActivity, PreAuthActivity>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthActivityId, opt => opt.MapFrom(t => t.PreAuthActivityId))
                .ForMember(s => s.PreAuthStatus, opt => opt.MapFrom(t => t.PreAuthStatus))
                .ReverseMap();

            CreateMap<medical_PreAuthCodeLimit, PreAuthCodeLimit>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthCodeLimitId, opt => opt.MapFrom(t => t.PreAuthCodeLimitId))
                .ForMember(s => s.PractitionerTypeId, opt => opt.MapFrom(t => t.PractitionerType))
                .ReverseMap();

            CreateMap<medical_PreAuthIcd10Code, PreAuthIcd10Code>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthIcd10CodeId, opt => opt.MapFrom(t => t.PreAuthIcd10CodeId))
                .ForMember(s => s.ClinicalUpdateId, opt => opt.MapFrom(t => t.ClinicalUpdateId))
                .ForMember(s => s.Description, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_PreAuthLevelOfCare, PreAuthLevelOfCare>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthLevelOfCareId, opt => opt.MapFrom(t => t.PreAuthLevelOfCareId))
                .ForMember(s => s.TariffCode, opt => opt.Ignore())
                .ForMember(s => s.LevelOfCare, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_PreAuthorisation, PreAuthorisation>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthId, opt => opt.MapFrom(t => t.PreAuthId))
                .ForMember(s => s.PreAuthorisationBreakdowns, opt => opt.MapFrom(t => t.PreAuthorisationBreakdowns))
                .ForMember(s => s.PreAuthorisationUnderAssessReasons, opt => opt.MapFrom(t => t.PreAuthorisationUnderAssessReasons))
                .ForMember(s => s.PreAuthIcd10Codes, opt => opt.MapFrom(t => t.PreAuthIcd10Code))
                .ForMember(s => s.PractitionerTypeId, opt => opt.Ignore())
                .ForMember(s => s.SubPreAuthorisations, opt => opt.MapFrom(t => t.PreAuthorisations))
                .ForMember(s => s.PreAuthTreatmentBaskets, opt => opt.MapFrom(t => t.PreAuthTreatmentBaskets))
                .ForMember(s => s.HealthCareProviderId, opt => opt.MapFrom(t => t.HealthCareProviderId))
                .ForMember(s => s.HealthCareProviderName, opt => opt.Ignore())
                .ForMember(s => s.PracticeNumber, opt => opt.Ignore())
                .ForMember(s => s.ClaimReferenceNumber, opt => opt.Ignore())
                .ForMember(s => s.PreAuthActivities, opt => opt.MapFrom(t => t.PreAuthActivities))
                .ForMember(s => s.PreAuthMotivationForClaimReopenings, opt => opt.MapFrom(t => t.PreAuthMotivationForClaimReopenings))
                .ForMember(s => s.PreAuthType, opt => opt.MapFrom(t => t.PreAuthType))
                .ForMember(s => s.PreAuthChronicRequestTypeId, opt => opt.MapFrom(t => t.PreAuthChronicRequestTypeId))
                .ForMember(s => s.PreAuthRehabilitations, opt => opt.MapFrom(t => t.PreAuthRehabilitations))
                .ForMember(s => s.ChronicMedicationForms, opt => opt.MapFrom(t => t.ChronicMedicationForms))
                .ForMember(s => s.ProsthetistQuoteId, opt => opt.Ignore())
                .ForMember(s => s.EventDate, opt => opt.Ignore())
                .ForMember(s => s.AssignToUserId, opt => opt.Ignore())
                 .ForMember(s => s.ReviewWizardConfigId, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_PreAuthRehabilitation, PreAuthRehabilitation>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.HealthCareProviderName, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_PreAuthorisationBreakdown, PreAuthorisationBreakdown>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthBreakdownId, opt => opt.MapFrom(t => t.PreAuthBreakdownId))
                .ForMember(s => s.TariffCode, opt => opt.Ignore())
                .ForMember(s => s.TariffDescription, opt => opt.Ignore())
                .ForMember(s => s.LevelOfCare, opt => opt.MapFrom(t => t.PreAuthLevelOfCares))
                .ForMember(s => s.ClinicalUpdateId, opt => opt.MapFrom(t => t.ClinicalUpdateId))
                .ForMember(s => s.TreatmentCode, opt => opt.Ignore())
                .ForMember(s => s.TreatmentCodeDescription, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_PreAuthorisationUnderAssessReason, PreAuthorisationUnderAssessReason>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthorisationUnderAssessReasonId, opt => opt.MapFrom(t => t.Id))
                .ReverseMap();

            CreateMap<medical_PreAuthRejectReason, PreAuthRejectReason>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthRejectReasonId, opt => opt.MapFrom(t => t.Id))
                .ReverseMap();

            CreateMap<medical_PreAuthPractitionerTypeSetting, PreAuthPractitionerTypeSetting>()
                .ForMember(s => s.PreAuthPractitionerTypeSettingId, opt => opt.MapFrom(t => t.Id))
                .ForMember(s => s.PractitionerTypeId, opt => opt.MapFrom(t => t.PractitionerTypeId))
                .ReverseMap();
            CreateMap<medical_Workflow, Workflow>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.WorkflowId, opt => opt.MapFrom(t => t.WorkflowId))
                .ForMember(s => s.WizardId, opt => opt.MapFrom(t => t.WizardId))
                .ForMember(s => s.ReferenceId, opt => opt.MapFrom(t => t.ReferenceId))
                .ForMember(s => s.ReferenceType, opt => opt.MapFrom(t => t.ReferenceType))
                .ForMember(s => s.WorkPool, opt => opt.MapFrom(t => t.WorkPool))
                .ForMember(s => s.AssignedToRoleId, opt => opt.MapFrom(t => t.AssignedToRoleId))
                .ForMember(s => s.AssignedToUserId, opt => opt.MapFrom(t => t.AssignedToUserId))
                .ForMember(s => s.Description, opt => opt.MapFrom(t => t.Description))
                .ForMember(s => s.StartDateTime, opt => opt.MapFrom(t => t.StartDateTime))
                .ForMember(s => s.EndDateTime, opt => opt.MapFrom(t => t.EndDateTime))
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<medical_Workflow>(s.WorkflowId));

            CreateMap<medical_PreAuthTreatmentBasket, PreAuthTreatmentBasket>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.ClinicalUpdateId, opt => opt.MapFrom(t => t.ClinicalUpdateId))
                .ReverseMap();

            CreateMap<medical_Publication, Publication>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PublicationId, opt => opt.MapFrom(t => t.PublicationId))
                .ReverseMap();

            CreateMap<medical_Section, Section>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.SectionId, opt => opt.MapFrom(t => t.SectionId))
                .ReverseMap();

            CreateMap<medical_Tariff, Tariff>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.TariffId, opt => opt.MapFrom(t => t.TariffId))
                .ForMember(s => s.PractitionerTypeId, opt => opt.MapFrom(t => t.PractitionerType))
                .ForMember(s => s.VatCodeId, opt => opt.MapFrom(t => t.VatCode))
                .ReverseMap();

            CreateMap<medical_TariffBaseUnitCost, TariffBaseUnitCost>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.TariffBaseUnitCostId, opt => opt.MapFrom(t => t.TariffBaseUnitCostId))
                .ForMember(s => s.UnitTypeId, opt => opt.MapFrom(t => t.UnitType))
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<medical_TariffBaseUnitCost>(s.TariffBaseUnitCostId)); ;

            CreateMap<medical_TariffBaseUnitCostType, TariffBaseUnitCostType>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.TariffBaseUnitCostTypeId, opt => opt.MapFrom(t => t.TariffBaseUnitCostTypeId))
                .ReverseMap();

            CreateMap<medical_TariffType, TariffType>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.TariffTypeId, opt => opt.MapFrom(t => t.TariffTypeId))
                .ReverseMap();

            CreateMap<medical_TreatmentCode, TreatmentCode>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.TreatmentCodeId, opt => opt.MapFrom(t => t.TreatmentCodeId))
                .ReverseMap();

            CreateMap<medical_TreatmentBasketMedicalItem, TreatmentBasketMedicalItem>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.TreatmentCodeId, opt => opt.MapFrom(t => t.TreatmentCodeId))
                .ReverseMap();

            CreateMap<medical_TreatmentBasketInjury, TreatmentBasket>()
                .ForMember(s => s.Icd10Code, opt => opt.MapFrom(x => x.TreatmentBasket.Description))
                .ForMember(s => s.Description, opt => opt.MapFrom(x => x.TreatmentBasket.Description));

            CreateMap<medical_Invoice, Invoice>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsMedicalReportExist, opt => opt.Ignore())
                .ForMember(s => s.SwitchBatchId, opt => opt.Ignore())
                .ForMember(s => s.SwitchBatchInvoiceId, opt => opt.Ignore())
                .ForMember(s => s.MedicalInvoiceReports, opt => opt.Ignore())
                .ForMember(s => s.MedicalInvoicePreAuths, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_InvoiceLine, InvoiceLine>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_TebaInvoice, TebaInvoice>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.SwitchBatchInvoiceId, opt => opt.Ignore())
                .ForMember(s => s.ClaimReferenceNumber, opt => opt.Ignore())
                .ForMember(s => s.HealthCareProviderName, opt => opt.Ignore())
                .ForMember(s => s.PracticeNumber, opt => opt.Ignore())
                .ForMember(s => s.MedicalInvoicePreAuths, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_TebaTariff, TebaTariff>()
                 .ForMember(s => s.Id, opt => opt.Ignore())
                 .ForMember(s => s.IsActive, opt => opt.Ignore())
                 .ReverseMap();

            CreateMap<medical_TebaInvoiceLine, TebaInvoiceLine>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_AdmissionCode, AdmissionCode>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.AdmissionCodeId, opt => opt.MapFrom(t => t.Id))
                .ForMember(s => s.PractitionerTypeId, opt => opt.MapFrom(t => t.PractitionerType))
                .ReverseMap();

            CreateMap<medical_ClinicalUpdate, ClinicalUpdate>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.PreAuthorisationBreakdowns, opt => opt.Ignore())
                .ForMember(s => s.PreAuthIcd10Codes, opt => opt.Ignore())
                .ForMember(s => s.ClinicalUpdateTreatmentPlans, opt => opt.MapFrom(t => t.ClinicalUpdateTreatmentPlans))
                .ForMember(s => s.ClinicalUpdateTreatmentProtocols,
                    opt => opt.MapFrom(t => t.ClinicalUpdateTreatmentProtocols))
                .ForMember(s => s.PreAuthNumber, opt => opt.Ignore())
                .ForMember(s => s.PreAuthTreatmentBaskets, opt => opt.Ignore())
                .ForMember(s => s.ClinicalUpdateStatus, opt => opt.MapFrom(t => (PreAuthStatusEnum)t.StatusId))
                .ReverseMap();

            CreateMap<medical_ClinicalUpdateTreatmentPlan, ClinicalUpdateTreatmentPlan>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_ClinicalUpdateTreatmentProtocol, ClinicalUpdateTreatmentProtocol>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_TreatmentPlan, TreatmentPlan>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.TreatmentPlanId, opt => opt.MapFrom(t => t.Id))
                .ReverseMap();

            CreateMap<medical_TreatmentProtocol, TreatmentProtocol>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.TreatmentProtocolId, opt => opt.MapFrom(t => t.Id))
                .ReverseMap();

            CreateMap<medical_Icd10Code, ICD10Code>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.Icd10SubCategoryDescription, opt => opt.Ignore())
                .ForMember(s => s.Icd10DiagnosticGroupId, opt => opt.Ignore())
                .ForMember(s => s.Icd10CategoryId, opt => opt.Ignore())
                .ForMember(s => s.BodySideAffected, opt => opt.Ignore())
                .ForMember(s => s.Severity, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_Icd10SubCategory, ICD10SubCategory>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_Icd10Category, ICD10Category>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_Icd10DiagnosticGroup, ICD10DiagnosticGroup>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_Switch, Switch>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_SwitchBatch, SwitchBatch>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.AssignedUser, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_SwitchBatchInvoice, SwitchBatchInvoice>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.ActiveUnderAssessReason, opt => opt.MapFrom(i => GetSwitchInvoiceActiveUnderAssessReason(i)))
                .ForMember(s => s.Status, opt => opt.MapFrom(i => GetSwitchInvoiceStatusDescription(i)))
                .ForMember(s => s.MedicalInvoiceUnderAssessReasons, opt => opt.MapFrom(i => GetMedicalInvoiceUnderAssessReasons(i)))
                .ForMember(s => s.EmployeeNumber, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_SwitchBatchInvoiceLine, SwitchBatchInvoiceLine>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_InvoiceUnderAssessReason, InvoiceUnderAssessReason>()
                .ForMember(s => s.InvoiceStatus, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_InvoiceLineUnderAssessReason, InvoiceLineUnderAssessReason>()
                .ReverseMap();

            CreateMap<medical_SwitchBatchInvoiceUnderAssessReason, SwitchBatchInvoiceUnderAssessReason>()
                .ReverseMap();

            CreateMap<medical_SwitchBatchInvoiceLineUnderAssessReason, SwitchBatchInvoiceLineUnderAssessReason>()
                .ReverseMap();

            CreateMap<medical_MutualInclusiveExclusiveCode, MutualInclusiveExclusiveCode>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_InvoiceReportMap, InvoiceReportMap>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.MedicalReportId, opt => opt.MapFrom(t => t.ReportId))
                .ReverseMap();

            CreateMap<medical_PreAuthBreakdownUnderAssessReason, PreAuthBreakdownUnderAssessReason>()
                .ReverseMap();

            CreateMap<medical_InvoiceCompCareMap, InvoiceCompCareMap>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_InvoicePreAuthMap, InvoicePreAuthMap>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<medical_SwitchUnderAssessReasonSetting, SwitchUnderAssessReasonSetting>()
                .ReverseMap();

            CreateMap<medical_PreAuthMotivationForClaimReopening, PreAuthMotivationForClaimReopening>()
               .ForMember(s => s.Id, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_ChronicMedicationForm, ChronicMedicationForm>()
               .ForMember(s => s.Id, opt => opt.Ignore())
               .ForMember(s => s.IsActive, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_ChronicScriptMedicine, ChronicScriptMedicine>()
               .ForMember(s => s.Id, opt => opt.Ignore())
               .ForMember(s => s.IsActive, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_ChronicMedicalHistory, ChronicMedicationHistory>()
               .ForMember(s => s.Id, opt => opt.Ignore())
               .ForMember(s => s.IsActive, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_ChronicMedicationFormRenewal, ChronicMedicationFormRenewal>()
             .ForMember(s => s.Id, opt => opt.Ignore())
             .ForMember(s => s.IsActive, opt => opt.Ignore())
             .ReverseMap();

            CreateMap<medical_ChronicScriptMedicineRenewal, ChronicScriptMedicineRenewal>()
             .ForMember(s => s.Id, opt => opt.Ignore())
             .ForMember(s => s.IsActive, opt => opt.Ignore())
             .ReverseMap();

            CreateMap<medical_ProsthetistQuote, ProsthetistQuote>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.ProstheticQuotationType, opt => opt.MapFrom(t => t.ProstheticQuotationType))
                .ForMember(s => s.ProstheticType, opt => opt.MapFrom(t => t.ProstheticType))
                .ForMember(s => s.ProstheticQuoteStatus, opt => opt.MapFrom(t => t.ProstheticQuoteStatus))
                .ForMember(s => s.PreAuthNumber, opt => opt.Ignore())
                .ForMember(s => s.ClaimReferenceNumber, opt => opt.Ignore())
                .ForMember(s => s.HealthCareProviderName, opt => opt.Ignore())
                .ForMember(s => s.PersonEventId, opt => opt.Ignore())
                .ForMember(s => s.IsInternalUser, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_QuotationType, QuotationType>()
                 .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.QuotationTypeId, opt => opt.MapFrom(t => t.ProstheticQuotationType))
               .ReverseMap();

            CreateMap<medical_ProsthetistType, ProsthetistType>()
                .ForMember(s => s.Id, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_ProstheticItem, ProstheticItem>()
                .ForMember(s => s.Id, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_ProstheticItemCategory, ProstheticItemCategory>()
                .ForMember(s => s.Id, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_Modifier, Modifier>()
                .ForMember(s => s.IsModifier, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_ModifierTariff, ModifierTariff>()
               .ReverseMap();

            CreateMap<medical_Service, RMA.Service.MediCare.Contracts.Entities.Medical.Service>()
                .ForMember(s => s.Id, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<medical_PensionerInterviewForm, PensionerInterviewForm>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<medical_PensionerInterviewForm>(s.PensionerInterviewFormId));

            CreateMap<medical_PensionerInterviewFormDetail, PensionerInterviewFormDetail>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<medical_PensionerInterviewFormDetail>(s.PensionerInterviewFormDetailsId));

            CreateMap<medical_PmpRegionTransfer, PmpRegionTransfer>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<medical_PmpRegionTransfer>(s.PmpRegionTransferId));

            CreateMap<medical_TariffBaseGazettedUnitCost, TariffBaseGazettedUnitCost>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<medical_TariffBaseGazettedUnitCost>(s.TariffBaseGazettedUnitCostId));

            CreateMap<medical_TravelAuthorisation, TravelAuthorisation>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<medical_TravelAuthorisation>(s.TravelAuthorisationId));

        }

        private readonly SemaphoreSlim _locker = new SemaphoreSlim(1, 1);

        private List<InvoiceUnderAssessReason> GetMedicalInvoiceUnderAssessReasons(medical_SwitchBatchInvoice switchInvoice)
        {
            _locker.Wait();

            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                var medicalInvoiceUnderAssessReasonsRepository =
                    ServiceLocator.Current.GetInstance<IRepository<medical_InvoiceUnderAssessReason>>();
                using (factory.CreateReadOnly())
                {
                    if (switchInvoice.InvoiceId > 0)
                    {
                        var medicalInvoiceUnderAssessReasons = medicalInvoiceUnderAssessReasonsRepository.Where(t => t.InvoiceId == switchInvoice.InvoiceId).ToList();

                        return Mapper.Map<List<InvoiceUnderAssessReason>>(medicalInvoiceUnderAssessReasons);
                    }

                    return new List<InvoiceUnderAssessReason>();
                }
            }
            finally
            {
                _locker.Release();
            }
        }

        private string GetSwitchInvoiceStatusDescription(medical_SwitchBatchInvoice switchInvoice)
        {
            _locker.Wait();

            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                var medicalInvoiceRepository =
                    ServiceLocator.Current.GetInstance<IRepository<medical_Invoice>>();
                using (factory.CreateReadOnly())
                {
                    if (switchInvoice.InvoiceId > 0)
                    {
                        var medicalInvoice =
                            medicalInvoiceRepository.FirstOrDefault(t => t.InvoiceId == switchInvoice.InvoiceId);

                        if (medicalInvoice != null)
                        {
                            return medicalInvoice.InvoiceStatus.GetDescription();
                        }

                        return string.Empty;
                    }

                    if (switchInvoice.SwitchInvoiceStatus != null)
                    {
                        return switchInvoice.SwitchInvoiceStatus.GetDescription();
                    }

                    return string.Empty;
                }
            }
            finally
            {
                _locker.Release();
            }
        }

        private string GetSwitchInvoiceActiveUnderAssessReason(medical_SwitchBatchInvoice switchBatchInvoice)
        {
            if (switchBatchInvoice == null)
                return null;

            _locker.Wait();

            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                var switchBatchInvoiceUnderAssessReasonRepository =
                    ServiceLocator.Current.GetInstance<IRepository<medical_SwitchBatchInvoiceUnderAssessReason>>();
                using (factory.CreateReadOnly())
                {
                    var existingUnderAssessReasons = switchBatchInvoiceUnderAssessReasonRepository.Where(i => i.SwitchBatchInvoiceId == switchBatchInvoice.SwitchBatchInvoiceId).ToList();

                    if (existingUnderAssessReasons.Any())
                    {
                        var reason = existingUnderAssessReasons.FirstOrDefault(i => i.IsActive);
                        if (reason != null)
                        {
                            return reason.UnderAssessReason;
                        }
                    }

                    return null;
                }

            }
            finally
            {
                _locker.Release();
            }

        }
    }
}
