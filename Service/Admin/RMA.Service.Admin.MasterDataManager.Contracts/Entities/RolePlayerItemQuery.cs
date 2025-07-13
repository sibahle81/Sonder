using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class RolePlayerItemQuery : AuditDetails
    {
        public string QueryReferenceNumber { get; set; }
        public RolePlayerItemQueryTypeEnum RolePlayerItemQueryType { get; set; }
        public int? RolePlayerId { get; set; }
        public RolePlayerQueryItemTypeEnum RolePlayerQueryItemType { get; set; }
        public RolePlayerItemQueryCategoryEnum RolePlayerItemQueryCategory { get; set; }
        public RolePlayerItemQueryStatusEnum RolePlayerItemQueryStatus { get; set; }
        public string QueryDescription { get; set; }
        public List<RolePlayerItemQueryItem> RolePlayerItemQueryItems { get; set; }
        public List<RolePlayerItemQueryResponse> RolePlayerItemQueryResponses { get; set; }        
    }
}
