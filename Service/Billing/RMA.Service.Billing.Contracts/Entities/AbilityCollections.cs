namespace RMA.Service.Billing.Contracts.Entities
{
    public class AbilityCollections
    {
        public int Id { get; set; } // Id (Primary key)
        public int CompanyNo { get; set; } // CompanyNo
        public int BranchNo { get; set; } // BranchNo
        public string TransactionType { get; set; } // TransactionType (length: 50)
        public System.DateTime TransactionDate { get; set; } // TransactionDate
        public string Level1 { get; set; } // Level1 (length: 50)
        public string Level2 { get; set; } // Level2 (length: 50)
        public int? Level3 { get; set; } // Level3
        public int? ChartIsNo { get; set; } // ChartISNo
        public int? ChartBsNo { get; set; } // ChartBSNo
        public string Benefitcode { get; set; } // Benefitcode (length: 50)
        public decimal DailyTotal { get; set; } // DailyTotal
        public bool IsProcessed { get; set; } // IsProcessed
        public int? SysNo { get; set; } // SysNo
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string Reference { get; set; } // Reference (length: 50)
        public string BatchReference { get; set; } // BatchReference (length: 100)
        public bool? IsBilling { get; set; }
        public string ChartIsName { get; set; } // ChartISName (length: 250)
        public string ChartBsName { get; set; } // ChartBSName (length: 250)
        public int? LineCount { get; set; } // LineCount
        public int? BankAccountId { get; set; }
        public string BankAccountNumber { get; set; }
    }
}
