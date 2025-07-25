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
using RMA.Service.Admin.SecurityManager.Contracts.Enums;

namespace RMA.Service.Admin.SecurityManager.Database.Entities
{
    public partial class security_User : IAuditableEntity, ISoftDeleteEntity, ITenantEntity, IEntityStatus
    {
        public int Id { get; set; } // Id (Primary key)
        public int TenantId { get; set; } // TenantId
        public int RoleId { get; set; } // RoleId
        public AuthenticationTypeEnum AuthenticationType { get; set; } // AuthenticationTypeId
        public string Email { get; set; } // Email (length: 50)
        public string DisplayName { get; set; } // DisplayName (length: 50)
        public string Password { get; set; } // Password (length: 2048)
        public System.Guid? Token { get; set; } // Token
        public int? FailedAttemptCount { get; set; } // FailedAttemptCount
        public System.DateTime? FailedAttemptDate { get; set; } // FailedAttemptDate
        public PortalTypeEnum PortalType { get; set; } // PortalTypeId
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string UserName { get; set; } // UserName (length: 255)
        public string HashAlgorithm { get; set; } // HashAlgorithm (length: 100)
        public System.DateTime? PasswordChangeDate { get; set; } // PasswordChangeDate
        public string TelNo { get; set; } // TelNo (length: 15)
        public bool IsInternalUser { get; set; } // IsInternalUser

        // Reverse navigation

        /// <summary>
        /// Child common_AnnouncementUserAcceptances where [AnnouncementUserAcceptance].[UserId] point to this entity (FK_AnnouncementUserAcceptance_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<common_AnnouncementUserAcceptance> AnnouncementUserAcceptances { get; set; } // AnnouncementUserAcceptance.FK_AnnouncementUserAcceptance_User
        /// <summary>
        /// Child security_Permissions (Many-to-Many) mapped by table [UserPermission]
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_Permission> Permissions { get; set; } // Many to many mapping
        /// <summary>
        /// Child security_Tenants (Many-to-Many) mapped by table [UserTenantMap]
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_Tenant> Tenants { get; set; } // Many to many mapping
        /// <summary>
        /// Child security_UserAddresses where [UserAddress].[UserId] point to this entity (FK_UserAddress_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserAddress> UserAddresses { get; set; } // UserAddress.FK_UserAddress_User
        /// <summary>
        /// Child security_UserAmountLimits where [UserAmountLimit].[UserId] point to this entity (FK_UserAmountLimit_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserAmountLimit> UserAmountLimits { get; set; } // UserAmountLimit.FK_UserAmountLimit_User
        /// <summary>
        /// Child security_UserBranches where [UserBranch].[UserId] point to this entity (FK_UserBranch_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserBranch> UserBranches { get; set; } // UserBranch.FK_UserBranch_User
        /// <summary>
        /// Child security_UserBrokerageMaps where [UserBrokerageMap].[UserId] point to this entity (FK_UserBrokerageMap_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserBrokerageMap> UserBrokerageMaps { get; set; } // UserBrokerageMap.FK_UserBrokerageMap_User
        /// <summary>
        /// Child security_UserCompanyMaps where [UserCompanyMap].[UserId] point to this entity (FK_UserCompanyMap_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserCompanyMap> UserCompanyMaps { get; set; } // UserCompanyMap.FK_UserCompanyMap_User
        /// <summary>
        /// Child security_UserContacts where [UserContact].[UserId] point to this entity (FK_UserContact_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserContact> UserContacts { get; set; } // UserContact.FK_UserContact_User
        /// <summary>
        /// Child security_UserDetails where [UserDetails].[UserId] point to this entity (FK_UserDetails_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserDetail> UserDetails { get; set; } // UserDetails.FK_UserDetails_User
        /// <summary>
        /// Child security_UserHealthCareProviderMaps where [UserHealthCareProviderMap].[UserId] point to this entity (FK_UserHealthCareProviderMap_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserHealthCareProviderMap> UserHealthCareProviderMaps { get; set; } // UserHealthCareProviderMap.FK_UserHealthCareProviderMap_User
        /// <summary>
        /// Child security_UserPasswords where [UserPasswords].[UserId] point to this entity (FK_UserUserPasswords)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserPassword> UserPasswords { get; set; } // UserPasswords.FK_UserUserPasswords
        /// <summary>
        /// Child security_UserPermission2 where [UserPermission2].[UserId] point to this entity (FK_UserPermission2_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserPermission2> UserPermission2 { get; set; } // UserPermission2.FK_UserPermission2_User
        /// <summary>
        /// Child security_UserPmpRegions where [UserPMPRegion].[UserId] point to this entity (FK_UserPMPRegion_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserPmpRegion> UserPmpRegions { get; set; } // UserPMPRegion.FK_UserPMPRegion_User
        /// <summary>
        /// Child security_UserPreferences where [UserPreference].[UserId] point to this entity (FK_UserPreferences_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_UserPreference> UserPreferences { get; set; } // UserPreference.FK_UserPreferences_User
        /// <summary>
        /// Child security_WorkPoolUsers where [WorkPoolUser].[UserId] point to this entity (FK_WorkPoolUser_User)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<security_WorkPoolUser> WorkPoolUsers { get; set; } // WorkPoolUser.FK_WorkPoolUser_User

        // Foreign keys

        /// <summary>
        /// Parent security_Role pointed by [User].([RoleId]) (FK_User_Role)
        /// </summary>
        public virtual security_Role Role { get; set; } // FK_User_Role

        public security_User()
        {
            AuthenticationType = (AuthenticationTypeEnum) 1;
            PortalType = (PortalTypeEnum) 1;
            IsActive = true;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            IsInternalUser = true;
            AnnouncementUserAcceptances = new System.Collections.Generic.List<common_AnnouncementUserAcceptance>();
            UserAddresses = new System.Collections.Generic.List<security_UserAddress>();
            UserAmountLimits = new System.Collections.Generic.List<security_UserAmountLimit>();
            UserBranches = new System.Collections.Generic.List<security_UserBranch>();
            UserBrokerageMaps = new System.Collections.Generic.List<security_UserBrokerageMap>();
            UserCompanyMaps = new System.Collections.Generic.List<security_UserCompanyMap>();
            UserContacts = new System.Collections.Generic.List<security_UserContact>();
            UserDetails = new System.Collections.Generic.List<security_UserDetail>();
            UserHealthCareProviderMaps = new System.Collections.Generic.List<security_UserHealthCareProviderMap>();
            UserPasswords = new System.Collections.Generic.List<security_UserPassword>();
            UserPermission2 = new System.Collections.Generic.List<security_UserPermission2>();
            UserPmpRegions = new System.Collections.Generic.List<security_UserPmpRegion>();
            UserPreferences = new System.Collections.Generic.List<security_UserPreference>();
            WorkPoolUsers = new System.Collections.Generic.List<security_WorkPoolUser>();
            Tenants = new System.Collections.Generic.List<security_Tenant>();
            Permissions = new System.Collections.Generic.List<security_Permission>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
