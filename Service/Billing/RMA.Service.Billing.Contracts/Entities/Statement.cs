using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class Statement
    {
        public int? InvoiceId { get; set; }
        public int PolicyId { get; set; }
        public System.DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; }
        public string DocumentNumber { get; set; }
        public DateTime DocumentDate { get; set; }
        public string Reference { get; set; }
        public string Description { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal Balance { get; set; }
        public decimal RunningBalance { get; set; }
        public decimal Amount { get; set; }
        public int? TransactionId { get; set; }
        public List<Transaction> LinkedTransactions { get; set; }
        public List<InvoiceAllocation> InvoiceAllocations { get; set; }
        public string Period { get; set; }
        public string PolicyNumber { get; set; }
        public System.DateTime? TransactionEffectiveDate { get; set; }
        public int? BankstatementEntryId { get; set; }
        public int TransactionTypeId { get; set; }
        public int? TransactionTypeLinkId { get; set; }
        public decimal? DebtorNetBalance { get; set; }
        public int? PeriodId { get; set; }
        public int? ProductId { get; set; }
        public int? TransactionReasonId { get; set; }
    }
}
