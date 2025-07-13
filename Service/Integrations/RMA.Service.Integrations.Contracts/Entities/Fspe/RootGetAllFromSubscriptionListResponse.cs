using RMA.Common.Entities;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    public class RootGetAllFromSubscriptionListResponse : ServiceBusMessageBase
    {
        public string Message { get; set; }
        public string StatusCode { get; set; }
        public string UserReference { get; set; }
    }
}
