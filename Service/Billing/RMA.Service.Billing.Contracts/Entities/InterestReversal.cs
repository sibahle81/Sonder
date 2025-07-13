using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterestReversal
    {
        public int RolePlayerId { get; set; }
        public string DisplayName { get; set; }
        public string FinPayeeNumber { get; set; }
        public List<Statement> Transactions { get; set; }
        public Note Note { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
    }
}
