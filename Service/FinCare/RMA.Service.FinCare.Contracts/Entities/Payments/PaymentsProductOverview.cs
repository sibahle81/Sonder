namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public class PaymentsProductOverview
    {
        public string Product { get; set; }
        public string PaymentStatus { get; set; }
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
    }
}