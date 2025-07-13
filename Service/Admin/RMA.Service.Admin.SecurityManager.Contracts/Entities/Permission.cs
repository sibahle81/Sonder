namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class Permission
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int? SecurityRank { get; set; }
        public bool IsActive { get; set; }
        public bool OverridesRolePermission { get; set; }
    }
}