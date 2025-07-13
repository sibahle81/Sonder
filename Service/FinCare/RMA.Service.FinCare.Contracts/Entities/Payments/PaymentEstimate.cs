namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentEstimate
    {
        public string PaymentType { get; set; }
        public decimal Amount { get; set; }
        public int NumberOfTransactions { get; set; }
        public string Time { get; set; }
        public string SenderAccountNumber { get; set; }
        public int NumberOfPayees { get; set; }
    }
}
