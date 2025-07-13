using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class RolePlayerItemQueryResponse : AuditDetails
    {
        public int RolePlayerItemQueryId { get; set; }
        public string QueryResponse { get; set; }
    }
}
