using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation
{
    public class PolicyPaymentTransaction
    {
        public string PolicyNumber { get; set; }
        public decimal Balance { get; set; }
        public DateTime BillingMonth { get; set; }
        public List<PolicyPaymentAllocation> Allocations { get; set; }
    }
}
