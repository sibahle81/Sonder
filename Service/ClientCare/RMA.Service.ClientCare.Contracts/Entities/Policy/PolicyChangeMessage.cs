using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyChangeMessage : ServiceBusMessageBase
    {
        public PolicyChangeDetail OldPolicyDetails { get; set; }
        public PolicyChangeDetail NewPolicyDetails { get; set; }
        public bool IsGroupPolicy { get; set; }
    }
}
