using System;

namespace RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation
{
    public class TransferPaymentFromPolicyToPolicyRequest
    {
        public int FromPaymentAllocationId { get; set; }
        public int FromPolicyId { get; set; }
        public DateTime FromPolicyBillingMonth { get; set; }
        public int ToPolicyId { get; set; }
        public DateTime ToPolicyBillingMonth { get; set; }
        public decimal AmountToTransfer { get; set; }
        public int RolePlayerId { get; set; }
        public string Notes { get; set; }
    }
}
