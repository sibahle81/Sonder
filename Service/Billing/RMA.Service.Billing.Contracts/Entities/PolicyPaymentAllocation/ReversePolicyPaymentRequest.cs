using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation
{
    public class ReversePolicyPaymentRequest
    {
        public List<int> PaymentIds { get; set; }
        public string Note { get; set; }
    }
}
