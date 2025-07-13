using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class AllocatedPayment
    {
        public int DebtorPaymentId { get; set; }
        public int BankStatementEntryId { get; set; }
        public string UserReference { get; set; }
        public string DebtorName { get; set; }
        public string InvoiceNumber { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime? TransactionDate { get; set; }
        public DateTime? StatementDate { get; set; }
        public DateTime? HyphenDateProcessed { get; set; }
        public DateTime? HyphenDateReceived { get; set; }
        public decimal Amount { get; set; }
        public Int64 BankAccountNumber { get; set; }
        public string UserReference1 { get; set; }
        public string UserReference2 { get; set; }
        public string TransactionType { get; set; }
        public string SchemeName { get; set; }
        public string BrokerName { get; set; }
        public string PolicyStatus { get; set; }
        public string ClientType { get; set; }
        public DateTime? AllocationDate { get; set; }
        public string DebtorNumber { get; set; }
        public string ProductCategory { get; set; }
    }
}
