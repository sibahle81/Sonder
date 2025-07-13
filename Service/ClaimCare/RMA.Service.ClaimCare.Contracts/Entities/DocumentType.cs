namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class DocumentType
    {
        public int Id { get; set; } // Id (Primary key)
        public string Name { get; set; } // Name (length: 100)
        public string Description { get; set; } // Name (length: 100)
        public int? DocumentTemplateId { get; set; } // DocumentTemplateId
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
