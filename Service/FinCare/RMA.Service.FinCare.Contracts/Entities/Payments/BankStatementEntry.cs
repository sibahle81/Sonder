using System;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class BankStatementEntry
    {
        public int BankStatementEntryId { get; set; }
        public string TransactionType { get; set; }
        public string DocumentType { get; set; }
        public string UserReference1 { get; set; }
        public string UserReference2 { get; set; }
        public string RequisitionNumber { get; set; }
        public string ChequeDepositNumber { get; set; }
        public string BankAccountNumber { get; set; }
        public string UniqueUserCode { get; set; }
        public string BankBranch { get; set; }
        public string SubType { get; set; }
        public System.DateTime? TransactionDate { get; set; }
        public System.DateTime? StatementDate { get; set; }
        public string EStatementNumber { get; set; }
        public string StatementNumber { get; set; }
        public string BankName { get; set; }
        public string RecordId { get; set; }
        public System.DateTime? HyphenDateProcessed { get; set; }
        public System.DateTime? BankAndStatementDate { get; set; }
        public string ReReceiveCode { get; set; }
        public int? StatementTransactionCount { get; set; }
        public long? NettAmount { get; set; }
        public System.DateTime? HyphenDateReceived { get; set; }
        public int? Status { get; set; }
        public string StatementAndLineNumber { get; set; }
        public string BatchNumber { get; set; }
        public string DebitCredit { get; set; }
        public int? StatementLineNumber { get; set; }
        public string ErrorCode { get; set; }
        public bool Proccessed { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string User { get; set; }
        public string Code1 { get; set; }
        public string Code2 { get; set; }
        public string UserReference { get; set; }
        public decimal Amount { get { return GetAmount(); } }
        public System.Guid? ClaimCheckReference { get; set; }


        private decimal GetAmount()
        {
            if (NettAmount == null) return 0.00M;
            var amount = (decimal)((long)NettAmount / 100.0);
            amount = DebitCredit == "+" ? Math.Abs(amount) : -Math.Abs(amount);
            return amount;
        }
    }
}
