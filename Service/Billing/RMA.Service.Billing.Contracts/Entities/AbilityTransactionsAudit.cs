using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class AbilityTransactionsAudit
    {
        public int Id { get; set; } // Id (Primary key)
        public string Reference { get; set; } // Reference (length: 50)
        public int? TransactionId { get; set; } // TransactionId
        public string Item { get; set; } // Item (length: 50)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string ItemReference { get; set; } // ItemReference (length: 100)
        public decimal? Amount { get; set; } // Amount
        public string OnwerDetails { get; set; } // OnwerDetails (length: 100)
        public string Bank { get; set; } // Bank (length: 100)
        public string BankBranch { get; set; } // BankBranch (length: 100)
        public string AccountDetails { get; set; } // AccountDetails (length: 100)
        public bool? IsProcessed { get; set; } // IsProcessed
        public int? BankAccountId { get; set; }
        public AbilityCollectionChartPrefixEnum? AbilityCollectionChartPrefix { get; set; }
        public string BSChart { get; set; } // BSChart (length: 50)
        public string ISChart { get; set; } // ISChart (length: 50)
        public int? UnallocatedPaymentId { get; set; } // UnallocatedPaymentId
        public string Level1 { get; set; } // Level1 (length: 50)
        public string Level2 { get; set; } // Level2 (length: 50)
        public string Level3 { get; set; } // Level3 (length: 50)
    }
}
