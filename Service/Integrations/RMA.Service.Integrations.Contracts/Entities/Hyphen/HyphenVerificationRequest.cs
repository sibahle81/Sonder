namespace RMA.Service.Integrations.Contracts.Entities.Hyphen
{
    public class HyphenVerificationRequest
    {
        public string @operator { get; set; }
        public string accountNumber { get; set; }
        public string accountType { get; set; }
        public string branchCode { get; set; }
        public string idNumber { get; set; }
        public string initials { get; set; }
        public string lastName { get; set; }
        public string phoneNumber { get; set; }
        public string emailAddress { get; set; }
        public string userReference { get; set; }
    }
}
