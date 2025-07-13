
namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Icd10CodeEstimateLookup
    {
        public int Icd10CodeEstimateLookupId { get; set; }
        public int Icd10GroupMapId { get; set; }
        public int? ProductOptionId { get; set; }
        public int? MedicalCostLookupId { get; set; }
        public int? PdExtentLookupId { get; set; }
        public int? DaysOffLookupId { get; set; }
        public System.DateTime StartDate { get; set; }
        public System.DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }

        public virtual DaysOffLookup DaysOffLookup { get; set; }

        public virtual MedicalCostLookup MedicalCostLookup { get; set; }

        public virtual PdExtentLookup PdExtentLookup { get; set; }


    }
}