
namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class EuropAssistPremiumMatrix
    {
        public int Id { get; set; } // Id (Primary key)
        public decimal BasePremium { get; set; } // BasePremium
        public decimal ProfitExpenseLoadingPremium { get; set; } // ProfitExpenseLoadingPremium
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public string Note { get; set; } // Note (length: 250)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
