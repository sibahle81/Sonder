using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimDisabilityAssessment
    {
        public int ClaimDisabilityAssessmentId { get; set; } // ClaimDisabilityAssessmentId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public string FinalDiagnosis { get; set; } // FinalDiagnosis (length: 250)
        public decimal RawPdPercentage { get; set; } // RawPdPercentage
        public decimal NettAssessedPdPercentage { get; set; } // NettAssessedPdPercentage
        public int AssessedBy { get; set; } // AssessedBy
        public System.DateTime AssessmentDate { get; set; } // AssessmentDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public DisabilityAssessmentStatusEnum? DisabilityAssessmentStatus { get; set; } // DisabilityAssessmentStatusId
        public int? ClaimId { get; set; } // ClaimId
        public bool IsAuthorised { get; set; } // IsAuthorised
        public int? MedicalReportFormId { get; set; } // MedicalReportFormId
    }
}
