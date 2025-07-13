
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SlaStatusChangeAuditSearchRequest
    {
        public SLAItemTypeEnum SLAItemType { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}