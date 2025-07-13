namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimDisabilityPension
    {
        public int DisabilityPensionId { get; set; } // DisabilityPensionId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public System.DateTime InterviewDate { get; set; } // InterviewDate
        public bool IsInjury { get; set; } // IsInjury
        public bool IsDisease { get; set; } // IsDisease
        public string OccupationalName { get; set; } // OccupationalName (length: 255)
        public bool IsAmputee { get; set; } // IsAmputee
        public bool IsParaplegic { get; set; } // IsParaplegic
        public bool IsWheelchairIssued { get; set; } // IsWheelchairIssued
        public System.DateTime? WheelchairIssuedDate { get; set; } // WheelchairIssuedDate
        public string MakeModel { get; set; } // MakeModel (length: 255)
        public System.DateTime? ApplianceReviewDate { get; set; } // ApplianceReviewDate
        public string LimbAmputated { get; set; } // LimbAmputated (length: 255)
        public string LevelOfAmputation { get; set; } // LevelOfAmputation (length: 255)
        public string ProstheticIssued { get; set; } // ProstheticIssued (length: 255)
        public System.DateTime? ProstheticReviewDate { get; set; } // ProstheticReviewDate
        public bool? IsCaa { get; set; } // IsCAA
        public bool? IsFamilyAllowance { get; set; } // IsFamilyAllowance
        public string NameOfInstitution { get; set; } // NameOfInstitution (length: 255)
        public string LandlineNumberInstitution { get; set; } // LandlineNumberInstitution (length: 50)
        public int? ClaimId { get; set; } // ClaimId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string ChronicMedicinesAndSundries { get; set; } // ChronicMedicinesAndSundries
        public string CertificationOfLifeYearlyAndSuspension { get; set; } // CertificationOfLifeYearlyAndSuspension
        public string InformationBrochure { get; set; } // InformationBrochure
        public bool? ExplainedCalculation { get; set; } // ExplainedCalculation
        public bool? ExplainedPayDates { get; set; } // ExplainedPayDates
        public bool? ExplainedProofOfLife { get; set; } // ExplainedProofOfLife
        public bool? ExplainedIncreases { get; set; } // ExplainedIncreases
        public bool? ExplainedMedicalTreatment { get; set; } // ExplainedMedicalTreatment
        public bool? ExplainedPreAuthorisation { get; set; } // ExplainedPreAuthorisation
        public bool? ExplainedMaintenance { get; set; } // ExplainedMaintenance
        public bool? SuppliedBooklet { get; set; } // SuppliedBooklet
        public bool? SuppliedContactDetails { get; set; } // SuppliedContactDetails
        public bool? ExplainedChronicMedication { get; set; } // ExplainedChronicMedication
        public bool? ExplainedTransportation { get; set; } // ExplainedTransportation
    }
}
