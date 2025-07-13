using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ICD10DiagnosticGroup : AuditDetails
    {
        public int Icd10DiagnosticGroupId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
    }
}
