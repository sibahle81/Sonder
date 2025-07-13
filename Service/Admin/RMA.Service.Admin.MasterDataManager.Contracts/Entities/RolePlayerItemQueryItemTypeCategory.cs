using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class RolePlayerItemQueryItemTypeCategory : AuditDetails
    {
        public RolePlayerQueryItemTypeEnum RolePlayerQueryItemType { get; set; }
        public RolePlayerItemQueryCategoryEnum RolePlayerItemQueryCategory { get; set; }
    }
}
