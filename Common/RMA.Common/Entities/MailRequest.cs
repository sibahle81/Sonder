using System.Collections.Generic;

namespace RMA.Common.Entities
{
    public class MailRequest
    {
        public string Subject { get; set; }
        public string FromAddress { get; set; }
        public List<string> Recipients { get; set; }
        public List<string> RecipientsCC { get; set; }
        public List<string> RecipientsBCC { get; set; }
        public string Body { get; set; }
        public bool IsHtml { get; set; }
        public List<MailAttachment> Attachments { get; set; }
    }
}
