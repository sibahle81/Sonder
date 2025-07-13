using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class PaymentAllocationScheme
    {
        public int TransactionId { get; set; }
        public string ParentPolicyNumber { get; set; }
        public string PaymentSource { get; set; }
        public decimal TotalPaymentAmount { get; set; }
        public string PaymentReference { get; set; }
        public DateTime PaymentDate { get; set; }
        public List<PaymentAllocationRecord> PaymentAllocationRecords { get; set; }
    }
}
