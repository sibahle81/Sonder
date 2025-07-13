namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumPaymentException
    {
        public string Company { get; set; }
        public string GroupPolicyNumber { get; set; }
        public string MemberPolicyNumber { get; set; }
        public string MemberIdNumber { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public string PaymentDate { get; set; }
        public decimal PaymentAmount { get; set; }
        public string ErrorMessage { get; set; }
    }
}

