using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BankEntryTransaction
    {
        public List<Transaction> Transactions { get; set; }
    }
}
