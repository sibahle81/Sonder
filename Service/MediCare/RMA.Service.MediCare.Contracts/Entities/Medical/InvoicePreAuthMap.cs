namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoicePreAuthMap : Common.Entities.AuditDetails
    {
        public int InvoicePreAuthMapId { get; set; }
        public int? InvoiceId { get; set; }
        public int? TebaInvoiceId { get; set; }
        public int PreAuthId { get; set; }
    }
}

