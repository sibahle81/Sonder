using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation
{
    [Serializable]
    public class AllocatePaymentToPolicyRequest
    {
        public int FromPaymentTransactionId { get; set; }
        public List<PolicyBilling> PolicyBillings { get; set; }
    }
}
