using RMA.Common.Entities;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class TargetCompany : AuditDetails
    {
        public string CompanyName { get; set; }
        public string MemberNumber { get; set; }
        public string ContactName { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public string PostalAddress { get; set; }
        public bool Unsubscribed { get; set; }
    }
}