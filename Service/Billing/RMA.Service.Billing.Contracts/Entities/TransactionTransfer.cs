using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TransactionTransfer
    {
        public FinPayee FromDebtorAccount { get; set; }
        public List<Transaction> Transactions { get; set; }
        public FinPayee ToDebtorAccount { get; set; } = new FinPayee();
        public string Reason { get; set; }
        public string RequestCode { get; set; }
        public List<Note> Notes { get; set; }
        public List<InvoiceAllocation> InvoiceAllocations { get; set; }
        public List<int> FromPolicyIds { get; set; }
        public List<int> ToPolicyIds { get; set; }
    }
}
