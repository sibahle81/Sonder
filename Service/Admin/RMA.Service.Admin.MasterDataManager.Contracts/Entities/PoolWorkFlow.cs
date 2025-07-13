
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class PoolWorkFlow
    {
        public int PoolWorkFlowId { get; set; } // PoolWorkFlowId (Primary key)
        public PoolWorkFlowItemTypeEnum PoolWorkFlowItemType { get; set; }
        public int ItemId { get; set; } // ItemId
        public WorkPoolEnum WorkPool { get; set; } // WorkPoolId
        public int AssignedByUserId { get; set; } // AssignedByUserId
        public int? AssignedToUserId { get; set; } // AssignedToUserId
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
        public string Instruction { get; set; } // Instruction
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}