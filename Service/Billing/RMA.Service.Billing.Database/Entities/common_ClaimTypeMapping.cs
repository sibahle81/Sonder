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

namespace RMA.Service.Billing.Database.Entities
{
    public partial class common_ClaimTypeMapping : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public ClaimTypeEnum ClaimType { get; set; } // ClaimTypeID (Primary key)
        public EventTypeEnum EventType { get; set; } // EventTypeID (Primary key)
        public int AssurerId { get; set; } // AssurerID (Primary key)
        public int ParentInsuranceTypeId { get; set; } // ParentInsuranceTypeID (Primary key)
        public bool IsActive { get; set; } // IsActive (Primary key)
        public bool IsDeleted { get; set; } // IsDeleted (Primary key)
        public string CreatedBy { get; set; } // CreatedBy (Primary key) (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate (Primary key)
        public string ModifiedBy { get; set; } // ModifiedBy (Primary key) (length: 30)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate (Primary key)
        public ProductCategoryTypeEnum? ProductCategoryType { get; set; } // ProductCategoryTypeId

        public common_ClaimTypeMapping()
        {
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
