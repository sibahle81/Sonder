using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadAddress
    {
        public int AddressId { get; set; } // AddressId (Primary key)
        public int LeadId { get; set; } // LeadId
        public AddressTypeEnum AddressType { get; set; } // AddressTypeId
        public string AddressLine1 { get; set; } // AddressLine1 (length: 50)
        public string AddressLine2 { get; set; } // AddressLine2 (length: 50)
        public string PostalCode { get; set; } // PostalCode (length: 15)
        public string City { get; set; } // City (length: 50)
        public string Province { get; set; } // Province (length: 50)
        public int? CountryId { get; set; } // CountryId

        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}