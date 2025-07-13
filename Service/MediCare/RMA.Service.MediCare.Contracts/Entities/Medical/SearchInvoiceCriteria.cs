using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SearchInvoiceCriteria
    {
        public string PracticeNumber { get; set; }
        public int PractitionerTypeId { get; set; }
        public int InvoiceStatusId { get; set; }
        public string SupplierInvoiceNumber { get; set; }
        public string AccountNumber { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public DateTime? TreatmentFromDate { get; set; }
        public DateTime? TreatmentToDate { get; set; }
        public string ClaimReference { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public int SwitchBatchInvoiceStatusId { get; set; }
    }
}
