using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class UpdateDebtorStatusRequest
    {
        public int RolePlayerId { get; set; }
        public DebtorStatusEnum? DebtorStatus { get; set; }
    }
}
