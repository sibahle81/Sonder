
namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class DiseaseType
    {
        public int DiseaseTypeId { get; set; } // DiseaseTypeID (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string Description { get; set; } // Description (length: 250)
        public string DiseaseCode { get; set; } // DiseaseCode (length: 250)
        public int ParentInsuranceTypeId { get; set; } // ParentInsuranceTypeID
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}