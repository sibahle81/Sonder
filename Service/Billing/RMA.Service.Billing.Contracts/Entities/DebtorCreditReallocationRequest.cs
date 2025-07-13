using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorCreditReallocationRequest
    {
        public int FromRoleplayerId { get; set; }
        public int ToRoleplayerId { get; set; }
        public PeriodStatusEnum Period { get; set; }
        public string DocumentUniqueId { get; set; }
        public decimal AmountRealllocated { get; set; }
    }
}
