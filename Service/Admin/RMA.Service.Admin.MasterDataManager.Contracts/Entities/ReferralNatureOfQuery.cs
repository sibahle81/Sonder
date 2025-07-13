using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ReferralNatureOfQuery
    {
        public int ReferralNatureOfQueryId { get; set; }
        public ModuleTypeEnum? ModuleType { get; set; }
        public string Name { get; set; }
        public int? RoleId { get; set; }
    }
}