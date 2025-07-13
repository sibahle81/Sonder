using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class SmsTemplate : CampaignTemplate
    {
        public SmsTemplate()
        {
            this.CampaignTemplateType = CampaignTypeEnum.SMS;
        }
    }
}