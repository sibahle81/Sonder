namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyDataOrganisation
    {
        public string OrganisationType { get; set; }
        public string CountryIncorporated { get; set; }
        public string RegisteredName { get; set; }
        public string TradingName { get; set; }
        public string RegistrationNumber { get; set; }
        public string SourceOfFunds { get; set; }
        public string TaxNumber { get; set; }
        public string VATNumber { get; set; }
        public string Email { get; set; }
        public PolicyDataAddress PhysicalAddress { get; set; }
    }
}
