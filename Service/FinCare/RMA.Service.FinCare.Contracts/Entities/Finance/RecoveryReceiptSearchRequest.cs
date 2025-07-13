using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class RecoveryReceiptSearchRequest
    {
        public RecoveryReceiptTypeEnum? RecoveryReceiptType { get; set; }
        public int? RecoveredByRolePlayerId { get; set; }
        public int? EventId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public PagedRequest PagedRequest { get; set; }
    }
}
