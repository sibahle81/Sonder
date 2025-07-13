namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class RatesUploadErrorAudit
    {
        public int Id { get; set; } // Id (Primary key)
        public string FileIdentifier { get; set; } // FileIdentifier (length: 50)
        public string FileName { get; set; } // FileName (length: 50)
        public string ErrorCategory { get; set; } // ErrorCategory (length: 50)
        public string ErrorMessage { get; set; } // ErrorMessage (length: 256)
        public string ExcelRowNumber { get; set; } // ExcelRowNumber (length: 50)
        public System.DateTime UploadDate { get; set; } // UploadDate
    }
}
