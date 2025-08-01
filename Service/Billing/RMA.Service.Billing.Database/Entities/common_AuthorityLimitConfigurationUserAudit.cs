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
    public partial class common_AuthorityLimitConfigurationUserAudit : IAuditableEntity, ISoftDeleteEntity
    {
        public int AuthorityLimitConfigurationUserAuditId { get; set; } // AuthorityLimitConfigurationUserAuditId (Primary key)
        public int AuthorityLimitConfigurationId { get; set; } // AuthorityLimitConfigurationId
        public int UserId { get; set; } // UserId
        public AuthorityLimitContextTypeEnum AuthorityLimitContextType { get; set; } // AuthorityLimitContextTypeId
        public int ContextId { get; set; } // ContextId
        public int Value { get; set; } // Value
        public bool IsDeleted { get; set; } // IsDeleted
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate

        // Foreign keys

        /// <summary>
        /// Parent common_AuthorityLimitConfiguration pointed by [AuthorityLimitConfigurationUserAudit].([AuthorityLimitConfigurationId]) (FK_AuthorityLimitConfigurationUserAudit_AuthorityLimitConfiguration)
        /// </summary>
        public virtual common_AuthorityLimitConfiguration AuthorityLimitConfiguration { get; set; } // FK_AuthorityLimitConfigurationUserAudit_AuthorityLimitConfiguration

        public common_AuthorityLimitConfigurationUserAudit()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
