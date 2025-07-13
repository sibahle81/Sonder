using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AuthorityLimitConfigurationUserAudit
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
    }
}