using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceSearchByBankRefResult
    {
        public int InvoiceId { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string FinPayeNumber { get; set; }
        public int PolicyOwnerId { get; set; }
        public decimal TotalInvoiceAmount { get; set; }
        public DateTime InvoiceDate { get; set; }
        public int InvoiceStatusId { get; set; }
    }
}
