using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SftpRequest
    {
        public int SftpRequestId { get; set; }
        public SftpRequestTypeEnum SftpRequestType { get; set; }
        public string FileName { get; set; }
        public SftpRequestStatusEnum SftpRequestStatus { get; set; }
        public int? ItemsInRequest { get; set; } 
        public int NoResponses { get; set; } 
        public System.DateTime RequestedDate { get; set; }
        public bool IsDeleted { get; set; } 
        public System.DateTime CreatedDate { get; set; } 
        public string CreatedBy { get; set; } 
        public System.DateTime ModifiedDate { get; set; } 
        public string ModifiedBy { get; set; } 

    }
}