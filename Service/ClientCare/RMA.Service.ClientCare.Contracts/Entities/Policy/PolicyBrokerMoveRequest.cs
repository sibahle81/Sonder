using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyBrokerMoveRequest
    {
        public int SourceRepresentativeId { get; set; }
        public List<int> ProductIds { get; set; }
    }
}