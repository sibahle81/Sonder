namespace RMA.Service.Billing.Contracts.Entities
{
    public class TransactionDocumentSendRequest
    {
        public int TransactionId { get; set; }
        public int? InvoiceId { get; set; }
        public int RolePlayerId { get; set; }
        public string DocumentType { get; set; }
        public string DocumentNumber { get; set; }
        public string PolicyNumber { get; set; }
        public string DisplayName { get; set; }
        public string ToAddress { get; set; }
        public string FinPayeNumber { get; set; }

    }
}
