using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadsUploadErrorAuditDetails
    {
        public int Id { get; set; } // Id (Primary key)
        public string FileIdentifier { get; set; } // FileIdentifier (length: 128)
        public string FileName { get; set; }
        public string MemberName { get; set; } // MemberName (length: 128)
        public string ErrorCategory { get; set; } // ErrorCategory (length: 128)
        public string ErrorMessage { get; set; } // ErrorMessage (length: 256)
        public string ExcelRowNumber { get; set; } // ExcelRowNumber (length: 50)
        public DateTime? CreatedDate { get; set; }
    }
}
