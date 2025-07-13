using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthorisation : Common.Entities.AuditDetails
    {
        public int PreAuthId { get; set; } // PreAuthId (Primary key)
        public int? PersonEventId { get; set; } // PersonEventId
        public int? ClaimId { get; set; } // ClaimId
        public int HealthCareProviderId { get; set; } // HealthCareProviderId
        public int RequestingHealthCareProviderId { get; set; } // RequestingHealthCareProviderId
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
        public string TemporaryReferenceNo { get; set; } // TemporaryReferenceNo (length: 25)
        public System.DateTime? InjuryDate { get; set; } // InjuryDate
        public bool? IsClaimLinked { get; set; } // IsClaimLinked
        public bool? IsPatientVerified { get; set; } // IsPatientVerified
        public string PreAuthContactNumber { get; set; } // PreAuthContactNumber (length: 50)
        public bool? IsRehabilitationRequest { get; set; } // IsRehabilitationRequest
        public bool? IsWoundCareTreatment { get; set; } // IsWoundCareTreatment
        public bool? IsMedicationRequired { get; set; } // IsMedicationRequired
        public bool? IsClaimReopeningRequest { get; set; } // IsClaimReopeningRequest
        public bool? IsPreRequest { get; set; } // IsPreRequest
        public bool? IsInHospital { get; set; } // IsInHospital
        public List<PreAuthorisationBreakdown> PreAuthorisationBreakdowns { get; set; }
        public List<PreAuthorisationUnderAssessReason> PreAuthorisationUnderAssessReasons { get; set; }
        public List<PreAuthIcd10Code> PreAuthIcd10Codes { get; set; }
        public int PractitionerTypeId { get; set; }
        public List<PreAuthorisation> SubPreAuthorisations { get; set; }
        public List<PreAuthTreatmentBasket> PreAuthTreatmentBaskets { get; set; }
        public string HealthCareProviderName { get; set; }
        public string PracticeNumber { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public List<PreAuthActivity> PreAuthActivities { set; get; }
        public List<PreAuthRehabilitation> PreAuthRehabilitations { get; set; }

        public List<PreAuthMotivationForClaimReopening> PreAuthMotivationForClaimReopenings { get; set; }
        public List<ChronicMedicationForm> ChronicMedicationForms { get; set; }
        public List<ChronicMedicationFormRenewal> ChronicMedicationFormRenewals { get; set; }

        public int PreAuthChronicRequestTypeId { get; set; }

        public int? ProsthetistQuoteId { get; set; } // ProsthetistQuoteId (Primary key) for linking
        public ProstheticQuotationTypeEnum? ProstheticQuotationType { get; set; } // QuotationTypeID
        public System.DateTime? EventDate { get; set; } // EventDate
        public int? AssignToUserId { get; set; }
        public int? ReviewWizardConfigId { get; set; }
    }
}
