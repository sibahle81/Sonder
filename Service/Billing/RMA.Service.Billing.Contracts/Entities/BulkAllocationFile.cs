namespace RMA.Service.Billing.Contracts.Entities
{
    public class BulkAllocationFile
    {
        public int BulkAllocationFileId { get; set; } // BulkAllocationFileId (Primary key)
        public System.Guid FileIdentifier { get; set; } // FileIdentifier
        public string FileName { get; set; } // FileName (length: 100)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int TotalLines { get; set; } 
        public int? TotalExceptions { get; set; } // ModifiedBy (length: 50)

        public int? FileProcessingStatusId { get; set; }
        public string FileProcessingStatus { get; set; }

    }
}
