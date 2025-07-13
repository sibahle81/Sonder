using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class PremiumPaymentRequest
    {
        public List<ManualPaymentAllocation> ManualPaymentAllocations { get; set; }
        public int Source { get; set; }
    }
}
