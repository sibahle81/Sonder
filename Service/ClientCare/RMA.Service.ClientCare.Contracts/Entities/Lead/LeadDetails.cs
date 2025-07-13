using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadDetails
    {
        public int LeadId { get; set; }
        public DateTime DateCreated { get; set; }
        public LeadClientStatusEnum LeadStatus { get; set; }
        public string MemberName { get; set; }
        public ClientTypeEnum ClientType { get; set; }
        public DateTime SLA { get; set; }
        public int ProductsInterestedCount { get; set; }
    }
}
