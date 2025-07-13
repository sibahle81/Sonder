using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PaymentAllocationRecord
    {
        public string PolicyNumber { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime PolicyMonth { get; set; }
        public string PaymentStatus { get; set; }
        public double? InvoiceAmount { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public double AmountAllocated { get; set; }
    }
}
