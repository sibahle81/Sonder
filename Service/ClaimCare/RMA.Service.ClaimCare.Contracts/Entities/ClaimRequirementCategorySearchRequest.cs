using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRequirementCategorySearchRequest
    {
        public EventTypeEnum? EventType { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}