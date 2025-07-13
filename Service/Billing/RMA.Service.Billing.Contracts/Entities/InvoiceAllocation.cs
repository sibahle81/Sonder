using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceAllocation
    {
        public int InvoiceAllocationId { get; set; } // InvoiceAllocationId (Primary key)
        public int TransactionId { get; set; } // TransactionId
        public int? InvoiceId { get; set; } // InvoiceId
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public decimal Amount { get; set; } // Amount
        public int? ClaimRecoveryId { get; set; } // ClaimRecoveryId
        public bool IsDeleted { get; set; } // IsDeleted
        public string DocumentNumber { get; set; }
        public int? LinkedTransactionId { get; set; } // LinkedTransactionId
        public BillingAllocationTypeEnum? BillingAllocationType { get; set; }
        public ProductCategoryTypeEnum? ProductCategoryType { get; set; }
    }
}
