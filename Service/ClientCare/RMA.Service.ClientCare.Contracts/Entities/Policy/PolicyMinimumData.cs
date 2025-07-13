using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyMinimumData
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string DisplayName { get; set; }
        public string IdNumber { get; set; }
        public PolicyStatusEnum PolicyStatus { get; set; }
        public decimal InstallmentPremium { get; set; }
        public System.DateTime EffectiveFrom { get; set; }
        public PolicyCancelReasonEnum? policyCancelReasonEnum { get; set; }
        public ReinstateReasonEnum? ReinstateReasonEnum { get; set; }
    }
}
