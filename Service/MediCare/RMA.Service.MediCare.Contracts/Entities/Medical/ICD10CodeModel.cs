using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ICD10CodeModel
    {
        public EventTypeEnum? EventType { get; set; }
        public int Icd10DiagnosticGroupId { get; set; }
        public int Icd10CategoryId { get; set; }
        public int Icd10SubCategoryId { get; set; }
        public int Icd10CodeId { get; set; }
        public string Icd10Code { get; set; }
        public int ProductId { get; set; }
        public string Icd10DiagnosticGroupCode { get; set; }
        public string Icd10DiagnosticGroupDescription { get; set; }
        public string Icd10CategoryCode { get; set; }
        public string Icd10CategoryDescription { get; set; }
        public string Icd10SubCategoryCode { get; set; }
        public string Icd10SubCategoryDescription { get; set; }
        public string Icd10CodeDescription { get; set; }
        public string DisplayValue { get; set; }
        public bool IsActive { get; set; }
    }
}
