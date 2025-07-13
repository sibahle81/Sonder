using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadCompany
    {
        public int LeadId { get; set; } // LeadId (Primary key)
        public string Name { get; set; } // Name (length: 255)
        public RegistrationTypeEnum? RegistrationType { get; set; } // RegistrationTypeId
        public string RegistrationNumber { get; set; } // RegistrationNumber (length: 50)
        public string CompensationFundReferenceNumber { get; set; } // CompensationFundReferenceNumber (length: 50)
        public string CompensationFundRegistrationNumber { get; set; } // CompensationFundRegistrationNumber (length: 50)
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassId
        public int IndustryTypeId { get; set; } // IndustryTypeId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}