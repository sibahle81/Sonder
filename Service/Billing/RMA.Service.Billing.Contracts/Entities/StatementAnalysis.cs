using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class StatementAnalysis
    {
        public string ControlNumber { get; set; }
        public string ControlName { get; set; }
        public int Year { get; set; }
        public int Period { get; set; }
        public int DebtorPaymentId { get; set; }
        public int BankStatementEntryId { get; set; }
        public int StatementNumber { get; set; }
        public int StatementLineNumber { get; set; }
        public string DebtorName { get; set; }
        public string UserReference { get; set; }
        public DateTime TransactionDate { get; set; }
        public decimal Amount { get; set; }
        public Int64 BankAccountNumber { get; set; }
        public string RMAReference { get; set; }
        public string Allocated { get; set; }
        public string BankCode { get; set; }
    }
}
