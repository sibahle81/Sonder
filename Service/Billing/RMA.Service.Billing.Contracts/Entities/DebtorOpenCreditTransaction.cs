using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorOpenCreditTransaction
    {
        public int TransactionId { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal Balance { get; set; }
        public decimal TransactionOriginalAmount { get; set; }
    }
}
