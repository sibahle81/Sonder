using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyDataRequest : ServiceBusMessageBase
    {
        public string ReferenceNumber { get; set; }
    }
}
