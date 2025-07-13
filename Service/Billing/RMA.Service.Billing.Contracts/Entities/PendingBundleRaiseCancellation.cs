namespace RMA.Service.Billing.Contracts.Entities
{
    public class PendingBundleRaiseCancellation
    {
        public int InvoiceId { get; set; }
        public int PolicyId { get; set; }
        public decimal Amount { get; set; }
        public int TransactionId { get; set; }
        public int RoleplayerId { get; set; }
    }
}
