using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyScheduleMessage : ServiceBusMessageBase
    {
        public int PolicyId { get; set; }
        public bool ShouldRegenerateSchedule { get; set; }
        public  string RequestedBy { get; set; }
    }
}
