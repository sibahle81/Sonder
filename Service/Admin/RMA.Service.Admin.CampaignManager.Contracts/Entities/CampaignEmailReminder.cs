namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class CampaignEmailReminder
    {
        public int ReminderId { get; set; }
        public int CampaignId { get; set; }
        public string CampaignName { get; set; }
        public string CampaignOwner { get; set; }
    }
}
