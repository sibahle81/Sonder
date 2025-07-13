
namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ReportViewedAudit
    {
        public int ReportViewedAuditId { get; set; }
        public int UserId { get; set; }
        public string ItemType { get; set; }
        public int ItemId { get; set; }
        public string ReportUrl { get; set; }
        public string Action { get; set; }
        public System.DateTime ActionDate { get; set; }
    }
}