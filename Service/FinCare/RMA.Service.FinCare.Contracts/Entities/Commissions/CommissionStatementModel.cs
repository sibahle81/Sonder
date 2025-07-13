using System;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionStatementModel
    {
        public DateTime TransactionDate { get; set; }
        public string TransactionReference { get; set; }

        public string TransactionType { get; set; }
        public decimal Amount { get; set; }
    }
}
