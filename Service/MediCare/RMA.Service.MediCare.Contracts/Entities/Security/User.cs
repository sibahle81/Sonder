using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Security
{
    public class User
    {
        public int Id { get; set; } // Id (Primary key)
        public int TenantId { get; set; } // TenantId
        public int RoleId { get; set; } // RoleId
        public AuthenticationTypeEnum AuthenticationType { get; set; }

        public string Email { get; set; } // Email (length: 50)
        public string DisplayName { get; set; } // DisplayName (length: 50)
        public string Password { get; set; } // Password (length: 2048)
        public System.Guid? Token { get; set; } // Token
        public int? FailedAttemptCount { get; set; } // FailedAttemptCount
        public System.DateTime? FailedAttemptDate { get; set; } // FailedAttemptDate
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
    }
}
