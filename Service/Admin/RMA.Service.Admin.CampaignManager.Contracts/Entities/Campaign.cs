using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class Campaign : AuditDetails
    {
        public Campaign()
        {
            TargetAudiences = new List<TargetAudience>();
            CampaignEmails = new List<Email>();
            CampaignSmses = new List<Sms>();
        }

        public int TenantId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public CampaignCategoryEnum CampaignCategory { get; set; }
        public CampaignTypeEnum CampaignType { get; set; }
        public CampaignStatusEnum CampaignStatus { get; set; }
        public int? ProductId { get; set; }
        public string Owner { get; set; }
        public string Role { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool Paused { get; set; }
        public DateTime? DateViewed { get; set; }
        public List<TargetAudience> TargetAudiences { get; set; }
        public List<Email> CampaignEmails { get; set; }
        public List<Sms> CampaignSmses { get; set; }
        public string Note { get; set; }
        public DateTime WeekEnding { get; set; }
        public DateTime CollectionDate { get; set; }
        public decimal CollectionAmount { get; set; }
        public string PhoneNumber { get; set; }
        public string EmailAddress { get; set; }

        public override string ToString()
        {
            return $"Campaign: {Id} {Name}";
        }
    }
}