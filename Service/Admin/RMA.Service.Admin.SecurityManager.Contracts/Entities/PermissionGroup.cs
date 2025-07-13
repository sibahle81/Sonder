using System.Collections.Generic;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class PermissionGroup
    {
        public int Id { get; set; }
        public int ModuleId { get; set; }
        public string Name { get; set; }
        public List<Permission> Permissions { get; set; }
    }
}
