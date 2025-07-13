using System;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class SmsAuditDetail
    {
        public int SmsAuditDetailId { get; set; }
        public DateTime RegistrationDate { get; set; }
        public DateTime StatusReportDate { get; set; }
        public string SmsNumber { get; set; }
        public string SmsReference { get; set; }
        public string ErrorDescription { get; set; }
        public int Status { get; set; }
        public string StatusDescription { get; set; }
        public string Operator { get; set; }
        public string Campaign { get; set; }
        public string Department { get; set; }
        public string UserName { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int? SmsAuditId { get; set; } // SmsAuditId
        public SmsAudit SmsAudit { get; set; }
    }
}
