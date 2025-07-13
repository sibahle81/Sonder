using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorProductBalanceRequest
    {
        public int RoleplayerId { get; set; }
        public List<int> PolicyIds { get; set; }
    }
}
