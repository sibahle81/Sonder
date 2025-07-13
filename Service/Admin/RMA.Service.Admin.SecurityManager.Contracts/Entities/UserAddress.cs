using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserAddress : AuditDetails
    {
        public int UserAddressId { get; set; } // UserAddressId (Primary key)
        public AddressTypeEnum AddressType { get; set; } // AddressTypeId
        public string Address1 { get; set; } // Address1 (length: 50)
        public string Address2 { get; set; } // Address2 (length: 50)
        public string Address3 { get; set; } // Address3 (length: 50)
        public string PostalCode { get; set; } // PostalCode (length: 15)
        public string City { get; set; } // City (length: 50)
        public string Province { get; set; } // Province (length: 50)
        public int CountryId { get; set; } // CountryId
    }
}