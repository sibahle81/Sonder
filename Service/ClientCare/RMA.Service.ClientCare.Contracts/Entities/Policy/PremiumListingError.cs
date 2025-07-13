namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumListingError
    {
        public int Id { get; set; }
        public string FileIdentifier { get; set; }
        public string ErrorCategory { get; set; }
        public string ErrorMessage { get; set; }
    }
}
