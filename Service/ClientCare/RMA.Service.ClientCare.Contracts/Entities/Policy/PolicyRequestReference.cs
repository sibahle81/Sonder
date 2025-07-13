using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyRequestReferenceMessage : ServiceBusMessageBase
    {
        public PolicyRequestReference PolicyRequestReference { get; set; }
    }

    public class PolicyRequestReference
    {
        public string ClaimCheckReference { get; set; }
    }
}
