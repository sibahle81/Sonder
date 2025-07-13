using RMA.Common.Entities;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BulkAllocationMessage : ServiceBusMessageBase
    {
        public int FileId { get; set; }
    }
}
