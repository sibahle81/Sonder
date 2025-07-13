namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PBPayment
    {
        public string Reference { get; set; }
        public string PolicyNumber { get; set; }
        public decimal Amount { get; set; }
        public int PaymentId { get; set; }
        public int RolePlayerIdentificationTypeId { get; set; }

    }
}
