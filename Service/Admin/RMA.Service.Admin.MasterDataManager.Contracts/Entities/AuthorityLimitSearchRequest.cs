
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AuthorityLimitSearchRequest
    {
        public AuthorityLimitItemTypeEnum? AuthorityLimitItemType { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}