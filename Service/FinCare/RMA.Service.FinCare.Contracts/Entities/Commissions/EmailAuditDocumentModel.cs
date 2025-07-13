using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class EmailAuditDocumentModel : AuditDetails
    {
        public int EmailAuditId { get; set; }
        public string Reciepients { get; set; }
        public string Body { get; set; }
        public List<MailAttachment> Attachments { get; set; }
    }
}
