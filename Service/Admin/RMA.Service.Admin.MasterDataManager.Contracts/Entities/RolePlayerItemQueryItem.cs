using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class RolePlayerItemQueryItem : AuditDetails
    {
        public int RolePlayerItemQueryId { get; set; }
        public int ItemId { get; set; }
    }
}
