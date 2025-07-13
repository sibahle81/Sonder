using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AuthorityLimitRequest
    {
        public AuthorityLimitItemTypeEnum AuthorityLimitItemType { get; set; }
        public AuthorityLimitValueTypeEnum? AuthorityLimitValueType { get; set; }
        public AuthorityLimitContextTypeEnum? AuthorityLimitContextType { get; set; } // for context under what to be tracked
        public int? ContextId { get; set; } // the contexts id
        public int Value { get; set; }
    }
}