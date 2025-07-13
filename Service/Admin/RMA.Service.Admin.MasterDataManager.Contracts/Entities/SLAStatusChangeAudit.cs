using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SlaStatusChangeAudit
    {
        public SlaStatusChangeAudit()
        {
            EffectiveFrom = DateTimeHelper.SaNow;
        }

        public int SlaStatusChangeAuditId { get; set; } // SLAStatusChangeAuditId (Primary key)
        public SLAItemTypeEnum SLAItemType { get; set; } // SLAItemTypeId
        public int ItemId { get; set; } // ItemId
        public string Status { get; set; } // Status (length: 50)
        public string Reason { get; set; } // Reason (length: 250)
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffictiveTo { get; set; } // EffictiveTo
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}