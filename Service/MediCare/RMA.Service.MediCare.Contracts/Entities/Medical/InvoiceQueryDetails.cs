using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceQueryDetails: AuditDetails
    {
        public RolePlayerItemQueryTypeEnum RolePlayerItemQueryType { get; set; }
        public int RolePlayerId { get; set; }
        public RolePlayerQueryItemTypeEnum RolePlayerQueryItemType { get; set; }
        public RolePlayerItemQueryCategoryEnum RolePlayerItemQueryCategory { get; set; }
        public RolePlayerItemQueryStatusEnum RolePlayerItemQueryStatus { get; set; }
        public string QueryDescription { get; set; }
        public string QueryResponse { get; set; }
        public string QueryReferenceNumber { get; set; }
    }
}
