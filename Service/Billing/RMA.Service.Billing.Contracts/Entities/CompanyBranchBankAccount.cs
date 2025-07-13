using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CompanyBranchBankAccount
    {
        public int CompanyBranchBankAccountId { get; set; } // CompanyBranchBankAccountId (Primary key)
        public int CompanyNumber { get; set; } // CompanyNumber
        public int BranchNumber { get; set; } // BranchNumber
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassId
        public int BankAccountId { get; set; } // BankAccountId
        public string Description { get; set; } // Description (length: 100)
        public ProductClassEnum ProductClass { get; set; } // ProductClassId
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool IsDeleted { get; set; } // IsDeleted
        public bool IsActive { get; set; } // IsActive
        public BankingPurposeEnum? BankingPurpose { get; set; } // BankingPurposeId

    }
}
