using RMA.Common.Entities;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class TargetAudienceMember : AuditDetails
    {
        public int TargetAudienceId { get; set; }
        public string Name { get; set; }
        public string ContactName { get; set; }
        public string Email { get; set; }
        public string MobileNo { get; set; }
        public string PhoneNo { get; set; }
        public string Status { get; set; }
        public int? AllowEmail { get; set; }
        public int? AllowPhone { get; set; }
        public int? AllowSms { get; set; }
        public int? PolicyId { get; set; }
    }
}
