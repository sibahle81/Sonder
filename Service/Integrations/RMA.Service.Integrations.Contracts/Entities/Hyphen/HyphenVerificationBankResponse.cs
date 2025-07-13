namespace RMA.Service.Integrations.Contracts.Entities.Hyphen
{
    public class HyphenVerificationBankResponse
    {
        public string accountNumber { get; set; }
        public string accountType { get; set; }
        public string branchCode { get; set; }
        public string idNumber { get; set; }
        public string initials { get; set; }
        public string lastName { get; set; }
        public string phoneNumber { get; set; }
        public string emailAddress { get; set; }
        public string userReference { get; set; }
        public string accountExists { get; set; }
        public string accountIdMatch { get; set; }
        public string initialMatch { get; set; }
        public string lastNameMatch { get; set; }
        public string accountOpen { get; set; }
        public string accountAcceptsCredits { get; set; }
        public string accountAcceptsDebits { get; set; }
        public string accountOpenGtThreeMonths { get; set; }
        public string phoneValid { get; set; }
        public string emailValid { get; set; }
        public string accountTypeValid { get; set; }
        public string transactionReference { get; set; }
        public string messageCode { get; set; }
        public string messageDescription { get; set; }
    }
}
