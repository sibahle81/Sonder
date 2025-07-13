
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class InterestSearchRequest
    {
        public IndustryClassEnum? IndustryClass { get; set; }
        public int? PeriodId { get; set; }
        public int? RolePlayerId { get; set; }
        public int? PolicyId { get; set; }
        public int? ProductCategoryId { get; set; }
        public InterestStatusEnum? InterestStatus { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}