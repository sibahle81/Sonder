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
using RMA.Service.ClaimCare.Contracts.Enums;

namespace RMA.Service.ClaimCare.Database.Entities
{
    public partial class common_SlaMovementAudit : IAuditableEntity, ILazyLoadSafeEntity
    {
        public int SlaMovementAuditId { get; set; } // SLAMovementAuditId (Primary key)
        public SLAItemTypeEnum SLAItemType { get; set; } // SLAItemTypeId
        public int ItemId { get; set; } // ItemId
        public string Comment { get; set; } // Comment (length: 250)
        public string AssignedBy { get; set; } // AssignedBy (length: 50)
        public string AssignedTo { get; set; } // AssignedTo (length: 50)
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public common_SlaMovementAudit()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
