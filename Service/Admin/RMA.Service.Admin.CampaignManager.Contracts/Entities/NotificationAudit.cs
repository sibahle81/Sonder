using System.Collections.Generic;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class NotificationAudit
    {
        public EmailAudit EmailAudit { get; set; }
        public List<EmailAuditAttachment> EmailAuditAttachment { get; set; }

    }
}