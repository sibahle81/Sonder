namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
    public class ClaimantAddress
    {
        public string StreetNumber { get; set; }
        public string StreetName { get; set; }
        public string Suburb { get; set; }
        public string Town { get; set; }
        public string Province { get; set; }
        public int PostalCode { get; set; }


    }
}
