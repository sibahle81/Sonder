using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BadDebtWriteOffRequest
    {
        public int RoleplayerId { get; set; }
        public List<BadDebtWriteOff> BadDebtWriteOffs { get; set; }
        public string Reason { get; set; }
        public PeriodStatusEnum Period { get; set; }
        public decimal Amount { get; set; }
    }
}
