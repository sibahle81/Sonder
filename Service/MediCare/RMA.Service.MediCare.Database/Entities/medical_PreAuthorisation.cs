//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Database.Entities
{
    public partial class medical_PreAuthorisation : IAuditableEntity, ISoftDeleteEntity
    {
        public int PreAuthId { get; set; } // PreAuthId (Primary key)
        public int HealthCareProviderId { get; set; } // HealthCareProviderId
        public int RequestingHealthCareProviderId { get; set; } // RequestingHealthCareProviderId
        public int? PersonEventId { get; set; } // PersonEventId
        public int? ClaimId { get; set; } // ClaimId
        public string PreAuthNumber { get; set; } // PreAuthNumber (length: 50)
        public PreAuthTypeEnum PreAuthType { get; set; } // PreAuthTypeId
        public PreAuthStatusEnum PreAuthStatus { get; set; } // PreAuthStatusId
        public System.DateTime DateAuthorisedFrom { get; set; } // DateAuthorisedFrom
        public System.DateTime DateAuthorisedTo { get; set; } // DateAuthorisedTo
        public System.DateTime? DateAuthorised { get; set; } // DateAuthorised
        public decimal? RequestedAmount { get; set; } // RequestedAmount
        public decimal? AuthorisedAmount { get; set; } // AuthorisedAmount
        public string RequestComments { get; set; } // RequestComments (length: 2048)
        public string ReviewComments { get; set; } // ReviewComments (length: 2048)
        public int? HospitalAuthId { get; set; } // HospitalAuthId
        public bool IsHighCost { get; set; } // IsHighCost
        public bool? IsRequestFromHcp { get; set; } // IsRequestFromHCP
        public int? RejectPendReasonId { get; set; } // RejectPendReasonId
        public string TemporaryReferenceNo { get; set; } // TemporaryReferenceNo (length: 25)
        public System.DateTime? InjuryDate { get; set; } // InjuryDate
        public bool? IsClaimLinked { get; set; } // IsClaimLinked
        public bool? IsPatientVerified { get; set; } // IsPatientVerified
        public string PreAuthContactNumber { get; set; } // PreAuthContactNumber (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool? IsRehabilitationRequest { get; set; } // IsRehabilitationRequest
        public bool? IsWoundCareTreatment { get; set; } // IsWoundCareTreatment
        public bool? IsMedicationRequired { get; set; } // IsMedicationRequired
        public bool? IsClaimReopeningRequest { get; set; } // IsClaimReopeningRequest
        public bool? IsPreRequest { get; set; } // IsPreRequest
        public bool? IsInHospital { get; set; } // IsInHospital
        public byte? PreAuthChronicRequestTypeId { get; set; } // PreAuthChronicRequestTypeID
        public ProstheticQuotationTypeEnum? ProstheticQuotationType { get; set; } // QuotationTypeID

        // Reverse navigation

        /// <summary>
        /// Child medical_ChronicMedicationForms where [ChronicMedicationForm].[PreAuthId] point to this entity (FK_Medical_ChronicMedicationForm_PreAuthId)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_ChronicMedicationForm> ChronicMedicationForms { get; set; } // ChronicMedicationForm.FK_Medical_ChronicMedicationForm_PreAuthId
        /// <summary>
        /// Child medical_ChronicMedicationFormRenewals where [ChronicMedicationFormRenewal].[PreAuthId] point to this entity (FK_Medical_ChronicMedicationFormRenewal_PreAuthId)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_ChronicMedicationFormRenewal> ChronicMedicationFormRenewals { get; set; } // ChronicMedicationFormRenewal.FK_Medical_ChronicMedicationFormRenewal_PreAuthId
        /// <summary>
        /// Child medical_ClinicalUpdates where [ClinicalUpdate].[PreAuthId] point to this entity (FK_ClinicalUpdate_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_ClinicalUpdate> ClinicalUpdates { get; set; } // ClinicalUpdate.FK_ClinicalUpdate_PreAuthorisation
        /// <summary>
        /// Child medical_InvoicePreAuthMaps where [InvoicePreAuthMap].[PreAuthId] point to this entity (FK_InvoicePreAuthMap_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_InvoicePreAuthMap> InvoicePreAuthMaps { get; set; } // InvoicePreAuthMap.FK_InvoicePreAuthMap_PreAuthorisation
        /// <summary>
        /// Child medical_PreAuthActivities where [PreAuthActivity].[PreAuthId] point to this entity (FK_PreAuthActivity_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthActivity> PreAuthActivities { get; set; } // PreAuthActivity.FK_PreAuthActivity_PreAuthorisation
        /// <summary>
        /// Child medical_PreAuthIcd10Code where [PreAuthICD10Code].[PreAuthId] point to this entity (FK_PreAuthICD10Code_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthIcd10Code> PreAuthIcd10Code { get; set; } // PreAuthICD10Code.FK_PreAuthICD10Code_PreAuthorisation
        /// <summary>
        /// Child medical_PreAuthMotivationForClaimReopenings where [PreAuthMotivationForClaimReopening].[PreAuthId] point to this entity (FK_Medical_PreAuthMotivationForClaimReopening_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthMotivationForClaimReopening> PreAuthMotivationForClaimReopenings { get; set; } // PreAuthMotivationForClaimReopening.FK_Medical_PreAuthMotivationForClaimReopening_PreAuthorisation
        /// <summary>
        /// Child medical_PreAuthorisations where [PreAuthorisation].[HospitalAuthId] point to this entity (PreAuthorisation_Parent)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthorisation> PreAuthorisations { get; set; } // PreAuthorisation.PreAuthorisation_Parent
        /// <summary>
        /// Child medical_PreAuthorisationBreakdowns where [PreAuthorisationBreakdown].[PreAuthId] point to this entity (FK_PreAuthorisationBreakdown_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthorisationBreakdown> PreAuthorisationBreakdowns { get; set; } // PreAuthorisationBreakdown.FK_PreAuthorisationBreakdown_PreAuthorisation
        /// <summary>
        /// Child medical_PreAuthorisationUnderAssessReasons where [PreAuthorisationUnderAssessReason].[PreAuthId] point to this entity (FK_medical_PreAuthorisationUnderAssessReason_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthorisationUnderAssessReason> PreAuthorisationUnderAssessReasons { get; set; } // PreAuthorisationUnderAssessReason.FK_medical_PreAuthorisationUnderAssessReason_PreAuthorisation
        /// <summary>
        /// Child medical_PreAuthRehabilitations where [PreAuthRehabilitation].[PreAuthId] point to this entity (FK_medical_PreAuthRehabilitation_PreAuthID)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthRehabilitation> PreAuthRehabilitations { get; set; } // PreAuthRehabilitation.FK_medical_PreAuthRehabilitation_PreAuthID
        /// <summary>
        /// Child medical_PreAuthTreatmentBaskets where [PreAuthTreatmentBasket].[PreAuthId] point to this entity (FK_PreAuthTreatmentBasket_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthTreatmentBasket> PreAuthTreatmentBaskets { get; set; } // PreAuthTreatmentBasket.FK_PreAuthTreatmentBasket_PreAuthorisation
        /// <summary>
        /// Child medical_ProsthetistQuotes where [ProsthetistQuote].[PreAuthId] point to this entity (FK_ProsthetistQuote_PreAuthorisation_PreAuthId)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_ProsthetistQuote> ProsthetistQuotes { get; set; } // ProsthetistQuote.FK_ProsthetistQuote_PreAuthorisation_PreAuthId
        /// <summary>
        /// Child medical_SwitchBatchInvoices where [SwitchBatchInvoice].[PreAuthId] point to this entity (FK_SwitchBatchInvoice_PreAuthorisation)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_SwitchBatchInvoice> SwitchBatchInvoices { get; set; } // SwitchBatchInvoice.FK_SwitchBatchInvoice_PreAuthorisation

        // Foreign keys

        /// <summary>
        /// Parent medical_PreAuthorisation pointed by [PreAuthorisation].([HospitalAuthId]) (PreAuthorisation_Parent)
        /// </summary>
        public virtual medical_PreAuthorisation HospitalAuth { get; set; } // PreAuthorisation_Parent

        public medical_PreAuthorisation()
        {
            PreAuthStatus = (PreAuthStatusEnum) 2;
            IsHighCost = false;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            IsRehabilitationRequest = false;
            IsWoundCareTreatment = false;
            IsMedicationRequired = false;
            IsClaimReopeningRequest = false;
            IsPreRequest = false;
            ChronicMedicationForms = new System.Collections.Generic.List<medical_ChronicMedicationForm>();
            ChronicMedicationFormRenewals = new System.Collections.Generic.List<medical_ChronicMedicationFormRenewal>();
            ClinicalUpdates = new System.Collections.Generic.List<medical_ClinicalUpdate>();
            InvoicePreAuthMaps = new System.Collections.Generic.List<medical_InvoicePreAuthMap>();
            PreAuthActivities = new System.Collections.Generic.List<medical_PreAuthActivity>();
            PreAuthIcd10Code = new System.Collections.Generic.List<medical_PreAuthIcd10Code>();
            PreAuthMotivationForClaimReopenings = new System.Collections.Generic.List<medical_PreAuthMotivationForClaimReopening>();
            PreAuthorisations = new System.Collections.Generic.List<medical_PreAuthorisation>();
            PreAuthorisationBreakdowns = new System.Collections.Generic.List<medical_PreAuthorisationBreakdown>();
            PreAuthorisationUnderAssessReasons = new System.Collections.Generic.List<medical_PreAuthorisationUnderAssessReason>();
            PreAuthRehabilitations = new System.Collections.Generic.List<medical_PreAuthRehabilitation>();
            PreAuthTreatmentBaskets = new System.Collections.Generic.List<medical_PreAuthTreatmentBasket>();
            ProsthetistQuotes = new System.Collections.Generic.List<medical_ProsthetistQuote>();
            SwitchBatchInvoices = new System.Collections.Generic.List<medical_SwitchBatchInvoice>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
