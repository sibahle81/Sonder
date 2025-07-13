using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class Interest
    {
        public int InterestId { get; set; } // InterestId (Primary key)
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassId
        public int PeriodId { get; set; } // PeriodId
        public int RolePlayerId { get; set; } // RolePlayerId
        public int InvoiceId { get; set; } // PolicyId
        public int? ProductCategoryId { get; set; } // ProductCategoryId
        public decimal Balance { get; set; } // Balance
        public decimal CalculatedInterestAmount { get; set; } // CalculatedInterestAmount
        public decimal? AdjustedInterestAmount { get; set; } // AdjustedInterestAmount
        public string Comment { get; set; } // Comment (length: 250)
        public InterestStatusEnum InterestStatus { get; set; } // InterestStatusId
        public bool IsDeleted { get; set; } // IsDeleted
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string FormulaApplied { get; set; } // FormulaApplied (length: 500)
        public bool? IsBackDated { get; set; } // IsBackDated
        public System.DateTime? TransactionEffectiveDate { get; set; } // TransactionEffectiveDate
        public int? LinkedTransactionId { get; set; } // LinkedTransactionId
    }
}
