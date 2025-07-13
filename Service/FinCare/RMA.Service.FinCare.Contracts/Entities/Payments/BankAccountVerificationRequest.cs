namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class BankAccountVerificationRequest
    {
        public string Operator { get; set; }
        public string AccountNumber { get; set; }
        public string AccountType { get; set; }
        public string BranchCode { get; set; }
        public string IdNumber { get; set; }
        public string Initials { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string EmailAddress { get; set; }
        public string UserReference { get; set; }
    }
}
