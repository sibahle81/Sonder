using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Injury
    {
        public int InjuryId { get; set; } // InjuryId (Primary key)
        public int PhysicalDamageId { get; set; } // PhysicalDamageId
        public int Icd10CodeId { get; set; } // ICD10CodeId
        public BodySideAffectedTypeEnum? BodySideAffectedType { get; set; } // BodySideAffectedId
        public InjurySeverityTypeEnum? InjurySeverityType { get; set; } // InjurySeverityId
        public InjuryStatusEnum? InjuryStatus { get; set; } // InjuryStatusId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int? InjuryRank { get; set; } // InjuryRank
        public int? MmiDays { get; set; } // MMIDays
        public int? Icd10DiagnosticGroupId { get; set; } // ICD10DiagnosticGroupId
        public int? IcdCategoryId { get; set; } // IcdCategoryId
        public int? IcdSubCategoryId { get; set; } // IcdSubCategoryId
    }
}