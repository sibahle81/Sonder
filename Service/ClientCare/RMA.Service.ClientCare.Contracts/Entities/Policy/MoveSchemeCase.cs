using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class MoveSchemeCase
    {
        public string Code { get; set; }
        public int SourcePolicyId { get; set; }
        public string SourcePolicyNumber { get; set; }
        public int DestinationPolicyId { get; set; }
        public string DestinationPolicyNumber { get; set; }
        public List<int> PolicyIds { get; set; }
    }
}
