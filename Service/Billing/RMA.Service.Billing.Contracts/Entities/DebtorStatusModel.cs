using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorStatusModel
    {
        public DebtCollectionStatusCodeEnum DebtorStatus { get; set; }
        public int RoleplayerId { get; set; }
        public int? PolicyId { get; set; }
    }
}
