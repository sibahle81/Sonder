using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class SendScheduleRequest : AuditDetails
    {
        public byte[] Data { get; set; }
        public string CustomEmailAddress { get; set; }
        public string DocumentName { get; set; }
        public int PolicyId { get; set; }
        public bool IsSendClient { get; set; }
    }
}
