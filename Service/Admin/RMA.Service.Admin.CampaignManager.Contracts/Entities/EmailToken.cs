using RMA.Common.Entities;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class EmailToken : AuditDetails
    {
        public int EmailId { get; set; }
        public string TokenKey { get; set; }
        public string TokenValue { get; set; }
    }
}