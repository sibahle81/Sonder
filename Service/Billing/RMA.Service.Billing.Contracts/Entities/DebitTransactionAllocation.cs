using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebitTransactionAllocation
    {
        public int DebitTransactionAllocationId { get; set; } // DebitTransactionAllocationId (Primary key)
        public int DebitTransactionId { get; set; } // DebitTransactionId
        public int CreditTransactionId { get; set; } // CreditTransactionId
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public decimal Amount { get; set; } // Amount
    }
}
