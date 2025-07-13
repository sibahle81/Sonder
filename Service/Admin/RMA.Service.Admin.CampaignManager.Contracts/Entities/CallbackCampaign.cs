namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class CallbackCampaign
    {
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public string Username { get; set; }
        public string ContactNumber { get; set; }
        public int LanguageId { get; set; }
        public string LanguageName { get; set; }
        public string Comment { get; set; }
    }
}