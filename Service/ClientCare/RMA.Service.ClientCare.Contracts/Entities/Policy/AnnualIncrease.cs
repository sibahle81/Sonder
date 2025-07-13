using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class AnnualIncrease
    {
        public int AnnualIncreaseId { get; set; }
        public int PolicyId { get; set; }
        public PolicyIncreaseStatusEnum PolicyIncreaseStatus { get; set; }
        public System.DateTime EffectiveDate { get; set; }
        public System.DateTime? NotificationSendDate { get; set; }
        public System.DateTime? IncreaseAppliedDate { get; set; }
        public string IncreaseFailedReason { get; set; }
        public decimal? PremiumBefore { get; set; }
        public decimal? PremiumAfter { get; set; }
        public decimal? CoverAmountBefore { get; set; }
        public decimal? CoverAmountAfter { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
