using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DuplicateInvoiceSearchResult
    {
        public int InvoiceId { get; set; }
        public int PolicyId { get; set; }
        public decimal Amount { get; set; } // Amount
        public DateTime CreatedDate { get; set; }
        public DateTime InvoiceDate { get; set; }
    }
}
