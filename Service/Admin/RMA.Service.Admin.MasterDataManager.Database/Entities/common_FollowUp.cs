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
    public partial class common_FollowUp : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int Id { get; set; } // Id (Primary key)
        public int ItemId { get; set; } // ItemId
        public string ItemType { get; set; } // ItemType (length: 50)
        public string Reference { get; set; } // Reference (length: 50)
        public string Description { get; set; } // Description (length: 500)
        public string Name { get; set; } // Name (length: 50)
        public System.DateTime AlertDate { get; set; } // AlertDate
        public bool AlertSent { get; set; } // AlertSent
        public string Email { get; set; } // Email (length: 50)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public common_FollowUp()
        {
            AlertSent = true;
            IsActive = true;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
