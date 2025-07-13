using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BadDebtReinstateRequest
    {
        public int RoleplayerId { get; set; }
        public List<BadDebtReinstate> BadDebtReinstates { get; set; }
        public string Reason { get; set; }
        public PeriodStatusEnum Period { get; set; }
    }
}
