using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    public class Address
    {
        public AddressTypeEnum AddressType { get; set; }
        public string Line1 { get; set; }
        public string Line2 { get; set; }
        public string City { get; set; }
        public string Code { get; set; }
    }
}
