using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermScheduleRefundBreakDown
    {
        public string BankAccountNumber { get; set; }
        public decimal Overpayment { get; set; }
        public int TransactionId { get; set; }
        public string Reference { get; set; }
        public decimal Amount { get; set; }
        public string TransactionType { get; set; }
        public DateTime TransactionDate { get; set; }
        public List<int> RefundableTermScheduleIds { get; set; }
    }
}
