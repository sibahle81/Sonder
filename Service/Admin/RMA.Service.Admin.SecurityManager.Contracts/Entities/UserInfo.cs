using System.Collections.Generic;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserInfo
    {
        public int Sub { get; set; }

        public string Username { get; set; }

        public string Name { get; set; }

        public string Role { get; set; }

        public int RoleId { get; set; }

        public string Email { get; set; }

        public string Token { get; set; }

        public string Preferences { get; set; }

        public List<string> Permissions { get; set; }

        public int TenantId { get; set; }
    }
}
