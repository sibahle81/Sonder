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
    public partial class policy_PolicyBinder : IAuditableEntity, ISoftDeleteEntity
    {
        public int PolicyBinderId { get; set; } // PolicyBinderId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public int BinderId { get; set; } // BinderId
        public int? BinderContactId { get; set; } // BinderContactId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent policy_Policy pointed by [PolicyBinder].([PolicyId]) (Policy_PolicyBinder)
        /// </summary>
        public virtual policy_Policy Policy { get; set; } // Policy_PolicyBinder

        public policy_PolicyBinder()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
