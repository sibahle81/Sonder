using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ICD10SubCategory : AuditDetails
    {
        public int Icd10SubCategoryId { get; set; }
        public int Icd10CategoryId { get; set; }
        public string Icd10SubCategoryCode { get; set; }
        public string Icd10SubCategoryDescription { get; set; }
        public string Icd10Code { get; set; }
    }
}
