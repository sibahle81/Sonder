using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TransactionsReversalRequest
    {
        public List<int> TransactionIds { get; set; }
        public int ToRoleplayerId { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
    }
}
