namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceDocumentModel
    {
        public int InvoiceId { get; set; }
        public byte[] InvoiceDocumentBytes { get; set; }
    }
}
