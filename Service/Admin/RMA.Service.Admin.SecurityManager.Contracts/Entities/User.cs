using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class User : AuditDetails
    {
        public string Email { get; set; }
        public string UserName { get; set; }
        public int TenantId { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Token { get; set; }

        public AuthenticationTypeEnum AuthenticationType { get; set; }
        public DateTime DateViewed { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public string DisplayName { get; set; }
        public int? FailedAttemptCount { get; set; }
        public DateTime? FailedAttemptDate { get; set; }
        public string Preferences { get; set; }
        public string PlainTextPassword { get; set; }
        public bool IsApproved { get; set; }
        public int ClientId { get; set; }
        public string HashAlgorithm { get; set; }
        public DateTime? PasswordChangeDate { get; set; }
        public string TelNo { get; set; }
        public bool IsInternalUser { get; set; }
        public string IpAddress { get; set; }
        public List<int> PermissionIds { get; set; }
        public List<int> Tenants { get; set; }
        public List<UserCompanyMap> UserCompanyMaps { get; set; }
        public Role Role { get; set; }

        public int AuthenticationTypeId
        {
            get => (int)AuthenticationType;
            set => AuthenticationType = (AuthenticationTypeEnum)value;
        }

        public PortalTypeEnum PortalType { get; set; }

        public int PortalTypeId
        {
            get => (int)PortalType;
            set => PortalType = (PortalTypeEnum)value;
        }
    }
}