using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEvent
    {
        public int PersonEventId { get; set; }
        public string PersonEventReferenceNumber { get; set; }
        public int? PersonEmploymentId { get; set; }
        public int? CompanyRolePlayerId { get; set; }
        public int EventId { get; set; }
        public int InsuredLifeId { get; set; }
        public int ClaimantId { get; set; }
        public int InformantId { get; set; }
        public PersonEventStatusEnum PersonEventStatus { get; set; }
        public int PersonEventBucketClassId { get; set; }
        public System.DateTime DateReceived { get; set; }
        public System.DateTime DateCaptured { get; set; }
        public int CapturedByUserId { get; set; }
        public System.DateTime? DateSubmitted { get; set; }
        public int? SubmittedByUserId { get; set; }
        public System.DateTime? DateAuthorised { get; set; }
        public int? AuthorisedByUserId { get; set; }
        public System.DateTime? DateRejected { get; set; }
        public int? RejectedByUserId { get; set; }
        public string RejectionReason { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DocumentSetEnum? DocumentSetEnum { get; set; }
        public int? InsuranceTypeId { get; set; } // InsuranceTypeId
        public SuspiciousTransactionStatusEnum SuspiciousTransactionStatus { get; set; } // SuspiciousTransactionStatusId
        public bool IsSpectacles { get; set; } // isSpectacles
        public bool IsDentures { get; set; } // isDentures
        public bool IsAssault { get; set; } // isAssault
        public bool IsHijack { get; set; } // isHijack
        public bool IsStraightThroughProcess { get; set; }
        public ClaimTypeEnum? ClaimType { get; set; } // ClaimTypeId
        public int? CompCarePersonEventId { get; set; }
        public string CompCareIntegrationMessageId { get; set; }
        public string CompCarePevRefNumber { get; set; }
        public DateTime? DateOfStabilisation { get; set; }
        public bool? IsFatal { get; set; }
        public int ClaimInvoiceId { get; set; }

        public PersonEventNoiseDetail PersonEventNoiseDetail { get; set; }
        public PersonEventAccidentDetail PersonEventAccidentDetail { get; set; }
        public PersonEventAssaultDetail PersonEventAssaultDetail { get; set; }
        public PersonEventDiseaseDetail PersonEventDiseaseDetail { get; set; }
        public PersonEventDeathDetail PersonEventDeathDetail { get; set; }
        public List<RolePlayer> RolePlayers { get; set; }
        public List<RolePlayer> Beneficiaries { get; set; }
        public RolePlayer RolePlayer { get; set; }
        public List<Claim> Claims { get; set; }
        public List<MedicalReport> MedicalReports { get; set; }
        public List<ClaimNote> ClaimNotes { get; set; }
        public List<PhysicalDamage> PhysicalDamages { get; set; }
        public PersonEventQuestionnaire PersonEventQuestionnaire { get; set; }


        public List<int> PolicyIds { get; set; }
        public FuneralRuleResult RuleResult { get; set; }
        public bool IsVopdOverridden { get; set; }
        public bool IsApproved { get; set; }
        public bool SendBrokerEmail { get; set; }
        public int? AssignedToUserId { get; set; }
        public DateTime? AssignedDate { get; set; }
        public bool anyEligiblePolicies { get; set; }
        public FirstMedicalReportForm FirstMedicalReport { get; set; }
        public List<ProgressMedicalReportForm> ProgressMedicalReportForms { get; set; }
        public FinalMedicalReportForm FinalMedicalReport { get; set; }
        public List<MedicalReportFormWizardDetail> MedicalReportFormWizardDetails { get; set; }
        public List<PersonEventStpExitReason> PersonEventStpExitReasons { get; set; }
        public List<PersonEventClaimRequirement> PersonEventClaimRequirements { get; set; }
        public ClaimAccidentCloseLetterTypeEnum? ClaimAccidentCloseLetterTypeEnum { get; set; }
        public List<ClaimAdditionalRequiredDocument> ClaimAdditionalRequiredDocuments { get; set; }
        public List<Earning> Earnings { get; set; }
        public List<ClaimDisabilityPension> ClaimDisabilityPensions { get; set; }
        public List<ClaimEstimate> ClaimEstimates { get; set; }
    }
}
