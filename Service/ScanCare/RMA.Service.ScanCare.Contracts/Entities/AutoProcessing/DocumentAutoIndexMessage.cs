using RMA.Common.Entities;
using System;
using System.Collections.Generic;

namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    public class DocumentAutoIndexMessage : ServiceBusMessageBase
    {
        public Guid BatchId { get; set; }
        public string SystemName { get; set; }
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
        public List<DocumentReferenceItem> Docs { get; set; }
    }

    public class DocumentReferenceItem
    {
        public string BlobUri { get; set; }
        public string FileName { get; set; }
    }

}
