using RMA.Common.Entities;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class TargetAudience : AuditDetails
    {
        public int CampaignId { get; set; }
        public string ItemType { get; set; }
        public int ItemId { get; set; }
        public string Name { get; set; }
        public int ClientTypeId { get; set; }
        public string IdNumber { get; set; }
        public string MemberNumber { get; set; }
        public string RegistrationNumber { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public bool Unsubscribed { get; set; }
        public bool UnsubscribedAll { get; set; }

        public override string ToString()
        {
            return $"TargetAudience: {CampaignId} {ItemType} {ItemId}";
        }
    }
}