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
    public partial class common_Menu : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int Id { get; set; } // Id (Primary key)
        public int ModuleId { get; set; } // ModuleId
        public int OderIndex { get; set; } // OderIndex
        public string Title { get; set; } // Title (length: 50)
        public string Url { get; set; } // Url (length: 255)
        public string Api { get; set; } // Api (length: 50)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent common_Module pointed by [Menu].([ModuleId]) (FK_common.Menu_Module)
        /// </summary>
        public virtual common_Module Module { get; set; } // FK_common.Menu_Module

        public common_Menu()
        {
            IsActive = true;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
