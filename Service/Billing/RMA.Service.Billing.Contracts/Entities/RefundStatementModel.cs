namespace RMA.Service.Billing.Contracts.Entities
{
    public class RefundStatementModel
    {
        public int TransactionId { get; set; }
        public int? InvoiceId { get; set; }
        public int? PolicyId { get; set; }
        public System.DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; }
        public string DocumentNumber { get; set; }
        public string Reference { get; set; }
        public string Description { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal Balance { get; set; }
        public decimal RunningBalance { get; set; }
        public decimal Amount { get; set; }
    }
}
