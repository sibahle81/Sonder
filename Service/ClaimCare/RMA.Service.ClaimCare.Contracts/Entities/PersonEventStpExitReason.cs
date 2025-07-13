using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventStpExitReason
    {
        public int ClaimStpExitReasonId { get; set; }
        public int PersonEventId { get; set; }
        public int StpExitReasonId { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }

        public StpExitReason StpExitReason { get; set; }

        public int CompCarePersonEventId { get; set; }
        public string MessageId { get; set; }
        public SuspiciousTransactionStatusEnum SuspiciousTransactionStatus { get; set; }
    }
}
