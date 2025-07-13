using System.Collections.Generic;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class SmsAudit
    {
        public int Id { get; set; }
        public string ItemType { get; set; }
        public int? ItemId { get; set; }
        public bool? IsSuccess { get; set; }
        public string SmsNumbers { get; set; }
        public string Message { get; set; }
        public string ProcessDescription { get; set; }
        public string Department { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string SmsReference { get; set; }
        public List<SmsAuditDetail> SmsAuditDetails { get; set; }
        public string BusinessArea { get; set; }
    }
}