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
    public partial class common_PreviousInsurer : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // ID (Primary key)
        public string Name { get; set; } // Name (length: 50)

        // Reverse navigation

        /// <summary>
        /// Child client_PreviousInsurerRolePlayers where [PreviousInsurerRolePlayer].[PreviousInsurerID] point to this entity (fk_Previous_Insurer_Id)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<client_PreviousInsurerRolePlayer> PreviousInsurerRolePlayers { get; set; } // PreviousInsurerRolePlayer.fk_Previous_Insurer_Id

        public common_PreviousInsurer()
        {
            PreviousInsurerRolePlayers = new System.Collections.Generic.List<client_PreviousInsurerRolePlayer>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
