
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.SecurityManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserSearchRequest
    {
        public List<int> RoleIds { get; set; }
        public List<string> Permissions { get; set; }
        public UserTypeEnum? UserType { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}