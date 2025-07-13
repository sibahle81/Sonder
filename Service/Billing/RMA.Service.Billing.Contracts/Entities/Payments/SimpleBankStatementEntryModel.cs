using System;

namespace RMA.Service.Billing.Contracts.Entities.Payments
{
    public class SimpleBankStatementEntryModel
    {
        public int BankStatementEntryId { get; set; }
        public string UserReference { get; set; }
        public string StatementNumber { get; set; }
        public string StatementAndLineNumber { get; set; }
        public DateTime StatementDate { get; set; }
        public Guid? ClaimCheckReference { get; set; }
    }
}
