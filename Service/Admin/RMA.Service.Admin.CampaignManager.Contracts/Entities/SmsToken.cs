using RMA.Common.Entities;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class SmsToken : AuditDetails
    {
        public int SmsId { get; set; }
        public string TokenKey { get; set; }
        public string TokenValue { get; set; }
    }
}