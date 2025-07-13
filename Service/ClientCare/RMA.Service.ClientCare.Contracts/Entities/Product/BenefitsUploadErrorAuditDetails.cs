namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitsUploadErrorAuditDetails
    {
        public int Id { get; set; } // Id (Primary key)
        public string FileIdentifier { get; set; } // FileIdentifier (length: 128)
        public string FileName { get; set; } // FileName (length: 100)
        public string BenefitName { get; set; } // BenefitName (length: 128)
        public string ErrorCategory { get; set; } // ErrorCategory (length: 128)
        public string ErrorMessage { get; set; } // ErrorMessage (length: 256)
        public string ExcelRowNumber { get; set; } // ExcelRowNumber (length: 50)
        public System.DateTime? CreatedDate { get; set; } // CreatedDate

    }
}
