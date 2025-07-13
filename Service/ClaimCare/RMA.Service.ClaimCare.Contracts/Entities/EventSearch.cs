using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;


namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class EventSearch
    {
        public int EventId { get; set; }
        public string EventNumber { get; set; }
        public string MemberNumber { get; set; }
        public string MemberName { get; set; }
        public EventTypeEnum EventType { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime DateOfIncident { get; set; }
        public int RolePlayerId { get; set; }
    }
}
