using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class RefundTransactionsRequest
    {
        public int RoleplayerId { get; set; }
        public List<int> PolicyIds { get; set; }
    }
}
