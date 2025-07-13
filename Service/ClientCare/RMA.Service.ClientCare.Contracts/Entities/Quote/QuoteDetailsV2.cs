using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Quote
{
    public class QuoteDetailsV2
    {
        public int QuoteDetailId { get; set; } // QuoteDetailId (Primary key)
        public int QuoteId { get; set; } // QuoteId
        public int ProductOptionId { get; set; } // ProductOptionId
        public CategoryInsuredEnum CategoryInsured { get; set; } // CategoryInsuredId
        public decimal? IndustryRate { get; set; } // IndustryRate
        public int AverageNumberOfEmployees { get; set; } // AverageNumberOfEmployees
        public decimal? AverageEmployeeEarnings { get; set; } // AverageEmployeeEarnings
        public decimal? Premium { get; set; } // Premium
        public decimal? ParentChildSplitPercentage { get; set; } // ParentChildSplitPercentage
        public decimal? LiveInAllowance { get; set; } // LiveInAllowance
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
