using RMA.Common.Entities;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class EmailAuditAttachment : AuditDetails
    {
        public int? EmailAuditId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public int? DocumentId { get; set; }
    }
}