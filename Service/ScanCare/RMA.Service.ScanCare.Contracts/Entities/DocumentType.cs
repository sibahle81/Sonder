using System;
using System.Collections.Generic;

namespace RMA.Service.ScanCare.Contracts.Entities
{
    public class DocumentType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ValidDays { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string Manager { get; set; } // Manager (length: 255)

        public List<Document> Documents { get; set; }
        public List<DocumentSetDocumentType> DocumentSetDocumentTypes { get; set; }

    }
}
