using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebitOrder
    {
        public string ControlNumber { get; set; }
        public string ControlName { get; set; }
        public int? Year { get; set; }
        public int? Period { get; set; }
        public int? DebitOrderDay { get; set; }
        public string AccountNumber { get; set; }
        public string DebtorName { get; set; }
        public string RMAReference { get; set; }
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public decimal DebitOrdeAmount { get; set; }
        public string ClientBankAccountNumber { get; set; }
        public string BankAccountType { get; set; }
        public string BranchCode { get; set; }
        public string BankAccountNumber { get; set; }
        public System.DateTime? ActionDate { get; set; }
        public string Message { get; set; }
        public string RMACode { get; set; }
        public string RMAMessage { get; set; }
        public System.DateTime? HyphenDate { get; set; }
        public string HyphenErrorCode { get; set; }
        public string HyphenErrorMessage { get; set; }
        public System.DateTime? BankDate { get; set; }
        public string BankErrorCode { get; set; }
        public string BankErrorMessage { get; set; }
        public string AccountHolder { get; set; }
        public string CollectionStatus { get; set; }
        public DateTime? DecemberDebitDay { get; set; }
        public decimal Balance { get; set; }
        public int MissedPayments { get; set; }
    }
}
