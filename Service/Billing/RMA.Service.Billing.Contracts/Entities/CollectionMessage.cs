using RMA.Common.Entities;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CollectionMessage : ServiceBusMessageBase
    {
        public int CollectionId { get; set; }
        public string BatchReference { get; set; }
    }
}
