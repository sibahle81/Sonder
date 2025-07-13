using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorStatusRule
    {
        public int Id { get; set; } // Id (Primary key)
        public DebtorStatusEnum DebtorStatus { get; set; } // DebtorStatusId
        public bool InterestIndicator { get; set; } // InterestIndicator
    }
}
