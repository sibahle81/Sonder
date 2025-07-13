using RMA.Common.Entities;
using System;
using System.Collections.Generic;

namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    public class DocumentSaveMessage : ServiceBusMessageBase
    {
        public Guid BatchId { get; set; }
        public string MailboxAddress { get; set; }
        public string GraphMessageId { get; set; }
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
        public string SystemName { get; set; }
        public List<AttachmentMeta> Attachments { get; set; }
    }
}