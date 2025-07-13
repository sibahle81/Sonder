using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumPayback
    {
        public int PremiumPaybackId { get; set; }
        public int PolicyId { get; set; }
        public PremiumPaybackStatusEnum PremiumPaybackStatus { get; set; }
        public System.DateTime PaybackDate { get; set; }
        public System.DateTime? NotificationSendDate { get; set; }
        public string PaybackFailedReason { get; set; }
        public System.DateTime? PremiumPaidDate { get; set; }
        public decimal? PaybackAmount { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
