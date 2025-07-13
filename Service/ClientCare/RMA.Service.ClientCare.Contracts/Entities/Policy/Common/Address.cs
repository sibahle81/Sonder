namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Common
{
    public class Address
    {
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; } = "";
        public string Suburb { get; set; } = "";
        public string City { get; set; }
        public string Province { get; set; }
        public string Country { get; set; }
        public string PostalCode { get; set; }
    }
}
