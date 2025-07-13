using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AuthorityLimitConfiguration
    {
        public int AuthorityLimitConfigurationId { get; set; } // AuthorityLimitConfigurationId (Primary key)
        public AuthorityLimitConfigurationTypeEnum AuthorityLimitConfigurationType { get; set; } // AuthorityLimitConfigurationTypeId
        public AuthorityLimitValueTypeEnum AuthorityLimitValueType { get; set; } // AuthorityLimitValueTypeId
        public AuthorityLimitItemTypeEnum AuthorityLimitItemType { get; set; } // AuthorityLimitItemTypeId
        public int Value { get; set; } // Value
        public string PermissionName { get; set; } // PermissionName (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate

    }
}