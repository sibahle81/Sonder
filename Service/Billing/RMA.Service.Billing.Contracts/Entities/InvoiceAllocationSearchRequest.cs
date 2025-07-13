using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceAllocationSearchRequest
    {
        public int RoleplayerId { get; set; }
        public List<int> PolicyIds { get; set; }
    }
}
