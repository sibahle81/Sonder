using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation
{
    public class PolicyBilling
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public List<PolicyPaymentAllocation> PaymentAllocations { get; set; }
        public decimal? BillingAmount { get; set; }
        public DateTime BillingDate { get; set; }
        public decimal? AllocatedAmount { get; set; }


    }
}
