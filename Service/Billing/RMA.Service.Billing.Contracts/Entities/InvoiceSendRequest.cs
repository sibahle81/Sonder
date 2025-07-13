using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceSendRequest
    {
        public List<int> InvoiceIds { get; set; }
        public int RoleplayerId { get; set; }
        public string InvoiceNumber { get; set; }
        public string ToAddress { get; set; }
    }
}
