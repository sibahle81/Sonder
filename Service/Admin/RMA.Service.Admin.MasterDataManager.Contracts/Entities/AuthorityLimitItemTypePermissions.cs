using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AuthorityLimitItemTypePermissions
    {
        public AuthorityLimitItemTypeEnum AuthorityLimitItemType { get; set; }
        public List<Permission> Permissions { get; set; }
    }
}