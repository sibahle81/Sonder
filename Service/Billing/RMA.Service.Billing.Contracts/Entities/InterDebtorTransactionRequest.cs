using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterDebtorTransactionRequest
    {
        public int RoleplayerId { get; set; }
        public string RmaBankAccount { get; set; }
        public PeriodStatusEnum Period { get; set; }

    }
}
