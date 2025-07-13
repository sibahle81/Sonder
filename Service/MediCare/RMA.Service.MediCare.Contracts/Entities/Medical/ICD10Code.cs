using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ICD10Code : AuditDetails
    {
        public int Icd10CodeId { get; set; }
        public string Icd10Code { get; set; }
        public string Icd10CodeDescription { get; set; }
        public int Icd10SubCategoryId { get; set; }
        public string Icd10SubCategoryDescription { get; set; }
        public int Icd10DiagnosticGroupId { get; set; }
        public int Icd10CategoryId { get; set; }
        public BodySideAffectedTypeEnum? BodySideAffected { get; set; }
        public InjurySeverityTypeEnum? Severity { get; set; }
    }
}
