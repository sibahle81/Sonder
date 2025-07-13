using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class ClientRateUploadErrorAudit
    {
        public int Id { get; set; } // Id (Primary key)
        public string FileIdentifier { get; set; } // FileIdentifier (length: 128)
        public string FileName { get; set; } // FileName (length: 100)
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassId
        public string MemberNo { get; set; } // MemberNo (length: 150)
        public string RefNo { get; set; } // RefNo (length: 50)
        public string ErrorCategory { get; set; } // ErrorCategory (length: 128)
        public string ErrorMessage { get; set; } // ErrorMessage (length: 256)
        public string ExcelRowNumber { get; set; } // ExcelRowNumber (length: 50)
        public System.DateTime? CreatedDate { get; set; } // CreatedDate
    }
}
