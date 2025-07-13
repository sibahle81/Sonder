
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ReferralSearchRequest
    {
        public ModuleTypeEnum? SourceModuleType { get; set; }
        public ModuleTypeEnum? TargetModuleType { get; set; }
        public int? AssignedToRoleId { get; set; }
        public int? AssignedByUserId { get; set; }
        public int? AssignedToUserId { get; set; }
        public ReferralStatusEnum? ReferralStatus { get; set; }
        public ReferralItemTypeEnum? ReferralItemType { get; set; }
        public int? ItemId { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}