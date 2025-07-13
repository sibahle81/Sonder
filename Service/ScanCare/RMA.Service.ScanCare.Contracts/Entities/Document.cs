using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ScanCare.Contracts.Entities
{
    public class Document
    {
        public int Id { get; set; }
        public int DocTypeId { get; set; }
        public string SystemName { get; set; }
        public string DocumentUri { get; set; }
        public string VerifiedBy { get; set; }
        public DateTime? VerifiedByDate { get; set; }
        public string FileHash { get; set; }
        public string FileName { get; set; }
        public string FileExtension { get; set; }
        public DocumentStatusEnum? DocumentStatus { get; set; }
        public string FileAsBase64 { get; set; }
        public Dictionary<string, string> Keys { get; set; }
        public string DocumentTypeName { get; set; }
        public DocumentSetEnum? DocumentSet { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string MimeType { get; set; }
        public bool DocumentExist { get; set; }
        public bool Required { get; set; }
        public string DocumentDescription { get; set; }
        public bool IsMemberVisible { get; set; }
    }
}
