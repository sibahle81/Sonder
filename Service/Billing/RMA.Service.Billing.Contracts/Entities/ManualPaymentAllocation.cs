using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class ManualPaymentAllocation
    {
        public int UnallocatedPaymentId { get; set; }
        public int InvoiceId { get; set; }
        public int RolePlayerId { get; set; }
        public decimal AllocatedAmount { get; set; }
        public string AllocationType { get; set; }
        public int UnallocatedTransactionId { get; set; }
        public string Reference { get; set; }
        public int ClaimRecoveryInvoiceId { get; set; }
        public bool IsClaimRecoveryPayment { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
        public bool LeaveBalanceInSuspenceAccount { get; set; } = true;
        public TransactionTypeEnum TransactionType { get; set; } = TransactionTypeEnum.Payment;
        public InterDebtorTransfer LinkedInterDebtorTransfer { get; set; }
        public RefundHeader LinkedRefund { get; set; }
        public Transaction LinkedPayment { get; set; }
        public Transaction DebitTransaction { get; set; }
        public int? BankStatementEntryId { get; set; }
        public DateTime? StatementDate { get; set; }
    }
}
