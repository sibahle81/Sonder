namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRequest
    {
        public string ClientCode { get; set; }
        public string PolicyNumber { get; set; }
        public string ClaimNumber { get; set; }
    }
}