using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BulkPremiumTransferDetail
    {
        public string PolicyNumber { get; set; }
        public decimal PolicyPremiumAmount { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal InvoiceAmount { get; set; }
        public DateTime InvoiceDate { get; set; }
        public decimal CollectedAmount { get; set; }
        public DateTime CollectionDate { get; set; }
        public bool IsSuccesFullyAllocated { get; set; }
        public string ResponseMessage { get; set; }
    }
}
