using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class UserAddress
    {
        public int UserAddressId { get; set; }
        public AddressTypeEnum AddressType { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string PostalCode { get; set; }
        public string City { get; set; }
        public string Province { get; set; }
        public int CountryId { get; set; }
    }
}