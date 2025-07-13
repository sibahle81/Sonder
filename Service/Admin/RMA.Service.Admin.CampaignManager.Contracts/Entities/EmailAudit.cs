using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class EmailAudit : AuditDetails
    {
        public string ItemType { get; set; } // ItemType (length: 50)
        public int? ItemId { get; set; } // ItemId
        public bool? IsSuccess { get; set; } // isSuccess
        public string Subject { get; set; } // Subject (length: 100)
        public string FromAddress { get; set; } // FromAddress (length: 50)
        public string Reciepients { get; set; } // Reciepients
        public string ReciepientsCc { get; set; } // ReciepientsCC
        public string ReciepientsBcc { get; set; } // ReciepientsBCC
        public string Body { get; set; } // Body
        public bool? IsHtml { get; set; } // IsHtml
        public string ProcessDescription { get; set; } // ProcessDescription (length: 50)
        public string Department { get; set; } // Department (length: 50)
        public string BusinessArea { get; set; } // BusinessArea (length: 50)

        public List<MailAttachment> Attachments { get; set; }
    }
}