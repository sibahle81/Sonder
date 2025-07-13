using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TransactionsBackDatingRequest
    {
        public List<int> TransactionIds { get; set; }
        public DateTime BackDatedDate { get; set; }
    }
}
