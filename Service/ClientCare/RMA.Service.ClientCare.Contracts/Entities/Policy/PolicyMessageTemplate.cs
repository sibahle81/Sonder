using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyMessageTemplate
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string MemberName { get; set; }
        public string IdNumber { get; set; }
        public SettingTypeEnum SettingType { get; set; }
        public string SettingTemplate { get; set; }
        public string CampaignTemplate { get; set; }
    }
}
