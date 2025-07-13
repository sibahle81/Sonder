using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorOpenTransactionsRequest
    {
        public int RoleplayerId { get; set; }
        public int TransactionTypeId { get; set; }
        public List<int> PolicyIds { get; set; }
        public DateTime? TransactionStartDate { get; set; }
        public DateTime? TransactionEndDate { get; set; }
    }
}
