using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ContactCareServiceBusMessages : ServiceBusMessageBase
    {
        public string Text { get; set; }
        public string AssignedByUser { get; set; }
        public string AssignedToUser { get; set; }
        public string RefNumber { get; set; }
        public int PriorityId { get; set; }
    }


}
