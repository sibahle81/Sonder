using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterestCalculation
    {
        public int RolePlayerId { get; set; }
        public List<Transaction> Transactions { get; set; }
        public Note Note { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
    }
}
