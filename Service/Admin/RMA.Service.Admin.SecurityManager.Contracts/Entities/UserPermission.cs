using System;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserPermission : IEquatable<UserPermission>
    {
        public int UserId { get; set; } // UserId (Primary key)
        public int PermissionId { get; set; } // PermissionId (Primary key)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public override bool Equals(object obj) => this.Equals(obj as UserPermission);

        public bool Equals(UserPermission userPermission)
        {
            if (userPermission is null)
                return false;

            if (ReferenceEquals(this, userPermission))
                return true;

            if (GetType() != userPermission.GetType())
                return false;

            return (UserId == userPermission.UserId) && (PermissionId == userPermission.PermissionId) & (IsActive == userPermission.IsActive) && (IsDeleted == userPermission.IsDeleted);
        }

        public override int GetHashCode() => (UserId, PermissionId, IsDeleted, IsDeleted).GetHashCode();

        public static bool operator ==(UserPermission lhs, UserPermission rhs)
        {
            if (lhs is null && rhs is null)
                return true;

            if (lhs is null)
                return false;

            return lhs.Equals(rhs);
        }

        public static bool operator !=(UserPermission lhs, UserPermission rhs)
        {
            if (lhs is null && rhs is null)
                return false;

            if (lhs is null || rhs is null)
                return true;

            return lhs.GetHashCode() != rhs.GetHashCode();
        }

    }
}
