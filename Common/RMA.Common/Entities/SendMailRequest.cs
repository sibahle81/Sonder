using RMA.Common.Enums;

namespace RMA.Common.Entities
{
    public class SendMailRequest
    {
        public string ItemType { get; set; }
        public int? ItemId { get; set; }
        public string Subject { get; set; }
        public string FromAddress { get; set; }
        public string Recipients { get; set; }
        public string RecipientsCC { get; set; }
        public string RecipientsBCC { get; set; }
        public string Body { get; set; }
        public bool IsHtml { get; set; }
        public int? EmailId { get; set; }
        public MailAttachment[] Attachments { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public bool? isSuccess { get; set; }
        public string ProcessDescription { get; set; }
        public RMADepartmentEnum Department { get; set; }
        public BusinessAreaEnum BusinessArea { get; set; }
        public string PasswordHint { get; set; }
    }
}