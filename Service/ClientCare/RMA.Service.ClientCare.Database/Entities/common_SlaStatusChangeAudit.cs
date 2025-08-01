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

namespace RMA.Service.ClientCare.Database.Entities
{
    public partial class common_SlaStatusChangeAudit : IAuditableEntity, ILazyLoadSafeEntity
    {
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

        public common_SlaStatusChangeAudit()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
