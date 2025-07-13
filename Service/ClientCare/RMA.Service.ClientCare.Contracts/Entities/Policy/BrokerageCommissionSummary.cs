using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Client;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BrokerageCommissionSummary
    {
        public Brokerage Brokerage { get; set; }
        public ClientBankAccount BankAccount { get; set; }
        public object Bank { get; set; }
        public int NmmberOfPolicies { get; set; }
        public decimal Commission { get; set; }
        public string Period { get; set; }
        public List<BrokerCommissionDetail> BrokerCommissionDetails { get; set; }

        public BrokerageCommissionSummary()
        {
            BrokerCommissionDetails = new List<BrokerCommissionDetail>();
        }
    }
}
