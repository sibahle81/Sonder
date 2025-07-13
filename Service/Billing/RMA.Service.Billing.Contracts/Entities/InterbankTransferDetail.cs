namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterBankTransferDetail
    {
        public int InterBankTransferDetailId { get; set; } // InterBankTransferDetailId (Primary key)
        public int InterBankTransferId { get; set; } // InterBankTransferId
        public int? BankStatementEntryId { get; set; } // BankStatementEntryId
        public string StatementReference { get; set; } // StatementReference (length: 100)
        public decimal Amount { get; set; } // Amount
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool IsDeleted { get; set; } // IsDeleted
        public int? TransactionId { get; set; } // TransactionId
    }
}
