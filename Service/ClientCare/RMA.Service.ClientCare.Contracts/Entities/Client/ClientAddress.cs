using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class ClientAddress : AuditDetails
    {
        public int CityId { get; set; }
        public int StateProvinceId { get; set; }
        public int CountryId { get; set; }
        public string PostalAddress { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string AddressPostalCode { get; set; }
        public string PostalCode { get; set; }
    }
}