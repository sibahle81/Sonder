using RMA.Common.Entities;

using System;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class Reminder : AuditDetails
    {
        public int CampaignId { get; set; }
        public DateTime ReminderDate { get; set; }
        public bool ReminderActive { get; set; }
    }
}