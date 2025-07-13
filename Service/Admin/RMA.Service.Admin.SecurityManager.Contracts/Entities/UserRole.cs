using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserRole : AuditDetails
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public bool? IsPoolSuperUser { get; set; }
        public bool IsWorkPool { get; set; }
    }
}