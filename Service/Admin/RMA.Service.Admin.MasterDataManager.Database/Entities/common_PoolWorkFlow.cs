//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Database.Entities
{
    public partial class common_PoolWorkFlow : IAuditableEntity, ILazyLoadSafeEntity
    {
        public int PoolWorkFlowId { get; set; } // PoolWorkFlowId (Primary key)
        public int ItemId { get; set; } // ItemId
        public WorkPoolEnum WorkPool { get; set; } // WorkPoolId
        public int AssignedByUserId { get; set; } // AssignedByUserId
        public int? AssignedToUserId { get; set; } // AssignedToUserId
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public PoolWorkFlowItemTypeEnum PoolWorkFlowItemType { get; set; } // PoolWorkFlowItemTypeId
        public string Instruction { get; set; } // Instruction (length: 256)
        public int? AssignedToRoleId { get; set; } // AssignedToRoleId

        public common_PoolWorkFlow()
        {
            PoolWorkFlowItemType = (PoolWorkFlowItemTypeEnum) 1;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
