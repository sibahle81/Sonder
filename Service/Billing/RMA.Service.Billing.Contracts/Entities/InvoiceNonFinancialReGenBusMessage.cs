using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceNonFinancialReGenBusMessage : ServiceBusMessageBase
    {
        public int InvoiceId { get; set; }
        public System.DateTime IssueDate { get; set; }
        public System.DateTime ExpiryDate { get; set; }
        public List<InvoiceLineItemNonFinancialReGen> InvoiceLineItemNonFinancialReGens { get; set; }
    }
}
