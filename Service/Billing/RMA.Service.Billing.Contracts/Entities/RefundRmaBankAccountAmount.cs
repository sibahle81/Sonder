using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class RefundRmaBankAccountAmount
    {
        public int RmaBankAccountId { get; set; }
        public decimal Amount { get; set; }
        public int ProductCategoryId { get; set; }
        public int PolicyId { get; set; }
        public int TransactionId { get; set; }
        public string AccountNumber { get; set; }
        public List<Int32> RefundableTermScheduleIds { get; set; }
    }
}
