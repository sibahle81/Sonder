using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class RolePlayerItemQueryItemTypeRole : AuditDetails
    {
        public int RoleId { get; set; }
        public RolePlayerQueryItemTypeEnum RolePlayerQueryItemType { get; set; }
    }
}
