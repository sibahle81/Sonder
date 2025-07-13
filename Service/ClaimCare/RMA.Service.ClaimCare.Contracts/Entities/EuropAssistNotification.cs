using RMA.Service.ClaimCare.Contracts.Enums;

using System.Collections;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class EuropAssistNotification
    {
        public int EuropAssistNotificationId { get; set; }
        public int ClaimId { get; set; }
        public ClaimStatusEnum? ClaimStatus { get; set; }
        public BitArray RequestData { get; set; }
        public System.DateTime ResponseDate { get; set; }
        public string ResponseMessage { get; set; }
        public bool IsSent { get; set; }
        public bool CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public bool ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
