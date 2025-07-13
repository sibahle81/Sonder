using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class DocumentTemplate : AuditDetails
    {
        public string Name { get; set; }
        public string Location { get; set; }
        public string SchemaValidator { get; set; }
        public string DocumentHtml { get; set; } // DocumentHtml
        public byte[] DocumentBinary { get; set; } // DocumentBinary
        public string DocumentName { get; set; } // DocumentName (length: 250)
        public string DocumentExtension { get; set; } // DocumentExtension (length: 50)
        public string DocumentMimeType { get; set; } // DocumentMimeType (length: 50)
        public DocumentTypeEnum DocumentType { get; set; } // DocumentTypeId

        public int DocumentTypeId
        {
            get => (int)DocumentType;
            set => DocumentType = (DocumentTypeEnum)value;
        }
    }

}