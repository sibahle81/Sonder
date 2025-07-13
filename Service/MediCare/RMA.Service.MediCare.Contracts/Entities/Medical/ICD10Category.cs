using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ICD10Category : AuditDetails
    {
        public int Icd10CategoryId { get; set; }
        public string Icd10CategoryCode { get; set; }
        public string Icd10CategoryDescription { get; set; }
    }
}
