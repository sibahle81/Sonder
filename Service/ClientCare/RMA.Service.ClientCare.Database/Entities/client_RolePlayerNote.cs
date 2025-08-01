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
    public partial class client_RolePlayerNote : IAuditableEntity, ISoftDeleteEntity
    {
        public int RolePlayerNoteId { get; set; } // RolePlayerNoteId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public string Text { get; set; } // Text
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent client_RolePlayer pointed by [RolePlayerNote].([RolePlayerId]) (FK_RolePlayerNote_RolePlayer)
        /// </summary>
        public virtual client_RolePlayer RolePlayer { get; set; } // FK_RolePlayerNote_RolePlayer

        public client_RolePlayerNote()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
