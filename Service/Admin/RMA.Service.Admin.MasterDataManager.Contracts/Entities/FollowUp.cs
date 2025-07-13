using RMA.Common.Entities;

using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class FollowUp : AuditDetails
    {
        public string Name { get; set; }
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public TimeSpan AlertTime => AlertDate.TimeOfDay;
        public string Description { get; set; }
        public DateTime AlertDate { get; set; }
        public string Email { get; set; }
        public bool AlertSent { get; set; }
        public string Reference { get; set; }
    }
}