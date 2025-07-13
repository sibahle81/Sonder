using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyAgentList : ServiceBusMessageBase
    {
        public List<PolicyAgent> PolicyAgents { get; set; }
    }
}
