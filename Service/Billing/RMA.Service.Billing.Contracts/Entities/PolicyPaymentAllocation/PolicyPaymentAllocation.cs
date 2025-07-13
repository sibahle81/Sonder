using System;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation
{
    public class PolicyPaymentAllocation
    {
        public int Id { get; set; }
        public int TransactionId { get; set; }
        public int PolicyId { get; set; }
        public DateTime BillingMonth { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public int TransactionTypeLinkId { get; set; }
        public BillingAllocationTypeEnum BillingAllocationType { get; set; }
        public int? LinkedPolicyPaymentAllocationId { get; set; }
        public bool IsDeleted { get; set; }
    }
}
