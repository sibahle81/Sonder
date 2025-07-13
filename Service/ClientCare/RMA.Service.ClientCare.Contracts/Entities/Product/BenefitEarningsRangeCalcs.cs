
using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitEarningsRangeCalcs
    {
        public int BenefitEarningsRangeCalcsId { get; set; } // BenefitEarningsRangeCalcsId (Primary key)
        public int BenefitId { get; set; } // BenefitId
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
        public decimal? EarningsEligibilityLow { get; set; } // EarningsEligibilityLow
        public decimal? EarningsEligibilityHigh { get; set; } // EarningsEligibilityHigh
        public decimal? MinEarnings { get; set; } // MinEarnings
        public decimal? MaxEarnings { get; set; } // MaxEarnings
        public decimal? EarningsMultiplier { get; set; } // EarningsMultiplier
        public decimal? EarningsAllocation { get; set; } // EarningsAllocation
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate   
    }
}