using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class UnallocatedPayments
    {
        public int UnallocatedPaymentId { get; set; }
        public int BankStatementEntryId { get; set; }
        public string UserReference { get; set; }
        public string StatementReference { get; set; }
        public DateTime TransactionDate { get; set; }
        public DateTime StatementDate { get; set; }
        public DateTime HyphenDateProcessed { get; set; }
        public DateTime HyphenDateReceived { get; set; }
        public decimal Amount { get; set; }
        public decimal OriginalAmount { get; set; }
        public string Status { get; set; }
        public string BankAccountNumber { get; set; }
        public string UserReference1 { get; set; }
        public string UserReference2 { get; set; }
        public string TransactionType { get; set; }
        public string ControlNumber { get; set; }
        public string ControlName { get; set; }
        public int? BranchNumber { get; set; }
        public string BranchName { get; set; }
        public int RowCount { get; set; }
    }
}
