using RMA.Common.Entities;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class TargetPerson : AuditDetails
    {
        public string ContactName { get; set; }
        public string IdNumber { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public bool Unsubscribed { get; set; }
    }
}