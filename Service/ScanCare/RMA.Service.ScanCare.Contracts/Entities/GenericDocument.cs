using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ScanCare.Contracts.Entities
{
    public class GenericDocument
    {
        public int Id { get; set; }
        public string KeyName { get; set; }
        public string KeyValue { get; set; }
        public string SystemName { get; set; }
        public DocumentSetEnum DocumentSet { get; set; }
        public DocumentTypeEnum DocumentType { get; set; }
        public bool Required { get; set; }
        public string FileName { get; set; }
        public string FileExtension { get; set; }
        public string DocumentDescription { get; set; }
        public bool IsMemberVisible { get; set; }
        public DocumentStatusEnum DocumentStatus { get; set; }
        public string DocumentUri { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }

        private int? DocumentStatusId
        {
            get => (int?)DocumentStatus;
            set => DocumentStatus = (DocumentStatusEnum)value;
        }

        private int? DocumentSetId
        {
            get => (int?)DocumentSet;
            set => DocumentSet = (DocumentSetEnum)value;
        }

        private int? DocumentTypeId
        {
            get => (int?)DocumentType;
            set => DocumentType = (DocumentTypeEnum)value;
        }
    }
}
