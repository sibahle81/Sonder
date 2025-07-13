using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyPersalDetail
    {
        public Policy Policy { get; set; }
        public Person Person { get; set; }
        public PersalDetail PersalDetail { get; set; }
        public Brokerage Brokerage { get; set; }
        public RepresentativeModel BrokerageRepresentative { get; set; }
    }
}
