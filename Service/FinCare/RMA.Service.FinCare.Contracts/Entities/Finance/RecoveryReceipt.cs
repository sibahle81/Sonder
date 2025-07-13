using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class RecoveryReceipt
    {
        public int RecoveryReceiptId { get; set; }
        public RecoveryReceiptTypeEnum RecoveryReceiptType { get; set; }
        public int? RecoveredByRolePlayerId { get; set; }
        public int EventId { get; set; }
        public decimal Amount { get; set; }
        public bool IsDeleted { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }

        public List<RecoveryReceiptAllocation> RecoveryReceiptAllocations { get; set; }
        public List<RecoveryReceiptDeduction> RecoveryReceiptDeductions { get; set; }
    }
}
