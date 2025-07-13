using RMA.Common.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class Role : AuditDetails
    {
        public string Name { get; set; }
        public List<Permission> Permission { get; set; }
        public List<int> PermissionIds { get; set; }
        public DateTime DateViewed { get; set; }
        public int? SecurityRank { get; set; }
    }
}