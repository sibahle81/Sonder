using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.ChildCapCover
{
    public class RuleData
    {
        public decimal TotalCoverAmount { get; set; }
        public BeneficiaryTypeEnum BeneficiaryType { get; set; }
        public string DateOfBirth { get; set; }
        public string IdNumber { get; internal set; }
    }
}
