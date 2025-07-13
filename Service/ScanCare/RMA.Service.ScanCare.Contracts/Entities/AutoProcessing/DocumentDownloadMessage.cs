using RMA.Common.Entities;
using System.Collections.Generic;
using System;

namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    public class DocumentDownloadMessage : ServiceBusMessageBase
    {
        public Guid BatchId { get; set; }
        public string MailboxAddress { get; set; }
        public string GraphMessageId { get; set; }
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
        public string SystemName { get; set; }
        public List<AttachmentMeta> Attachments { get; set; }
    }

    public class AttachmentMeta
    {
        public string AttachmentId { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
    }
}