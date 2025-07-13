using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class StagePolicyIntegrationRequest
    {
        public int StagePolicyIntegrationRequestId { get; set; }
        public string PartnerName { get; set; }
        public string Payload { get; set; }
        public string Response { get; set; }
        public string ClientReference { get; set; }
        public string PolicyNumber { get; set; }
        public PolicyIntegrationRequestStatusTypeEnum PolicyIntegrationRequestStatusType { get; set; }
        public PolicyIntegrationRequestMethodTypeEnum PolicyIntegrationRequestMethodType { get; set; }
        public int? IterationNumber { get; set; }
        public bool IsDeleted { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
    }
}
