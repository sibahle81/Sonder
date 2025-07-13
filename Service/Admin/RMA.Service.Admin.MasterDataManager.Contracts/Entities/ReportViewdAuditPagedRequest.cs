
using RMA.Common.Entities.DatabaseQuery;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ReportViewedAuditPagedRequest
    {
        public string ItemType { get; set; }
        public int ItemId { get; set; }
        public string ReportUrl { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}