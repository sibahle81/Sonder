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
using RMA.Service.FinCare.Contracts.Enums;

namespace RMA.Service.FinCare.Database.Entities
{
    public partial class billing_JournalUserPassword : ILazyLoadSafeEntity
    {
        public string UserNo { get; set; } // UserNo (Primary key) (length: 6)
        public int Password { get; set; } // Password (Primary key)
        public System.DateTime? LastLoginDate { get; set; } // LastLoginDate

        public billing_JournalUserPassword()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
