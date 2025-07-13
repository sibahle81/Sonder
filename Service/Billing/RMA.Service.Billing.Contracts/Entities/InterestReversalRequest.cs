using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterestReversalRequest
    {
        public List<int> TransactionIds { get; set; }
        public string Note { get; set; }
    }
}
