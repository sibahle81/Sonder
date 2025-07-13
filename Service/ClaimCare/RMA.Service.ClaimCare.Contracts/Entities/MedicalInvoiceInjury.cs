using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class MedicalInvoiceInjury : Common.Entities.AuditDetails
    {
        public int InjuryId { get; set; } // InjuryId (Primary key)
        public int PhysicalDamageId { get; set; } // PhysicalDamageId
        public int Icd10CodeId { get; set; } // ICD10CodeId
        public string Icd10Code { get; set; } // ICD10Code
        public int ICD10DiagnosticGroupId { get; set; }
        public string ICD10DiagnosticGroupCode { get; set; }
        public int ICD10CategoryId { get; set; }
        public string ICD10CategoryCode { get; set; }
        public bool IsPrimary { get; set; }
        public BodySideAffectedTypeEnum? BodySideAffectedType { get; set; } // BodySideAffectedId
        public InjurySeverityTypeEnum? InjurySeverityType { get; set; } // InjurySeverityId
        public InjuryStatusEnum? InjuryStatus { get; set; } // InjuryStatusId
    }
}