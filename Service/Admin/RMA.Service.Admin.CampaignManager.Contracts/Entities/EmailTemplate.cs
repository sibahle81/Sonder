using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class EmailTemplate : CampaignTemplate
    {
        public EmailTemplate()
        {
            this.CampaignTemplateType = CampaignTypeEnum.Email;
        }

        public string Subject { get; set; }
    }
}