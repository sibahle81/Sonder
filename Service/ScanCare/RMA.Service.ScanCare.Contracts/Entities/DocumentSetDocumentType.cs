using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ScanCare.Contracts.Entities
{
    public class DocumentSetDocumentType
    {
        public int Id { get; set; } // Id (Primary key)
        public int DocTypeId { get; set; } // DocTypeId
        public DocumentSetEnum DocumentSet { get; set; } // DocumentSetId
        public bool Required { get; set; } // Required
        public bool StatusEnabled { get; set; } // Required
        public bool TemplateAvailable { get; set; } // Required
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string DocumentTypeName { get; set; }
    }
}
