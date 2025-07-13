namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceAssessAllocateData
    {
        public InvoiceDetails InvoiceDetail { get; set; }
        public TebaInvoice TebaInvoice { get; set; }
        public MedicalInvoicePaymentAllocation InvoiceAllocation { get; set; }
    }
}
