using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ReferralStatusChangeAudit
    {
        public int ReferralStatusChangeAuditId { get; set; }
        public int ReferralId { get; set; }
        public ReferralStatusEnum ReferralStatus { get; set; }
        public int ModifiedByUserId { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}