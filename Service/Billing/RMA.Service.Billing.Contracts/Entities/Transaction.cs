using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class Transaction
    {
        public int TransactionId { get; set; }
        public int? InvoiceId { get; set; }
        public int RolePlayerId { get; set; }
        public int TransactionTypeLinkId { get; set; }
        public decimal Amount { get; set; }
        public decimal UnallocatedAmount { get; set; }
        public decimal OriginalUnallocatedAmount { get; set; }
        public decimal ReallocatedAmount { get; set; }
        public System.DateTime TransactionDate { get; set; }
        public string BankReference { get; set; }
        public virtual Invoice Invoice { get; set; }
        public virtual TransactionTypeLink TransactionTypeLink { get; set; }
        public TransactionTypeEnum TransactionType { get; set; }
        public string RmaReference { get; set; }
        public string Reason { get; set; }
        public List<FinPayee> FinPayees { get; set; }
        public int? BankStatementEntryId { get; set; }
        public int? LinkedTransactionId { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public decimal TransferAmount { get; set; }
        public List<InvoiceAllocation> InvoiceAllocations { get; set; }
        public int? ClaimRecoveryInvoiceId { get; set; }
        public bool? IsLogged { get; set; }
        public int? AdhocPaymentInstructionId { get; set; }
        public AdhocPaymentInstruction AdhocPaymentInstruction { get; set; }
        public bool? IsReAllocation { get; set; }
        public decimal? Balance { get; set; }
        public List<DebitTransactionAllocation> DebitTransactionAllocations { get; set; }
        public List<DebitTransactionAllocation> CreditTransctionAllocationsToDebitTransactions { get; set; }
        public List<Transaction> LinkedTransactions { get; set; }
        public decimal RefundAmount { get; set; }
        public int PolicyId { get; set; }
        public string DocumentNumber { get; set; }
        public string Reference { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal RunningBalance { get; set; }
        public string Description { get; set; }
        public DeletedReasonEnum? DeletedReason { get; set; }
        public int? PeriodId { get; set; }
        public TransactionReasonEnum? TransactionReason { get; set; } // TransactionReasonId
        public bool? IsBackDated { get; set; } // IsBackDated
        public System.DateTime? TransactionEffectiveDate { get; set; } // TransactionEffectiveDate
        public string RmaBankAccount { get; set; }
        public int? RmaBankAccountId { get; set; }
    }
}
