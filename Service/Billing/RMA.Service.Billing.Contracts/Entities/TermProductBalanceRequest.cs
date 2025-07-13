using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermProductBalanceRequest
    {
        public int RoleplayerId { get; set; }
        public int TermBillingCycleId { get; set; }
        public List<int> PolicyIds { get; set; }
    }
}
