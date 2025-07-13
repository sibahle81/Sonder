using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.VoluntaryFuneralAgeOptionFour
{
    public class RuleData
    {
        public ClientTypeEnum ClientType { get; set; }
        public string DateOfBirth { get; set; }
        public string IdNumber { get; set; }
    }
}