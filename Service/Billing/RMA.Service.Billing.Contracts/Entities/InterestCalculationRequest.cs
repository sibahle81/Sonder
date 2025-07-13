
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class InterestCalculationRequest
    {
        public IndustryClassEnum? IndustryClass { get; set; }
        public int? PeriodId { get; set; }
        public int? RolePlayerId { get; set; }
        public int? PolicyId { get; set; }
        public int? ProductCategoryId { get; set; }
    }
}