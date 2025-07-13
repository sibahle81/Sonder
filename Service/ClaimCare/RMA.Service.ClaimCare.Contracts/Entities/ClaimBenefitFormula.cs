using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimBenefitFormula
    {
        public int ClaimBenefitFormulaId { get; set; } // ClaimBenefitFormulaId (Primary key)
        public int BenefitId { get; set; } // BenefitId
        public EventTypeEnum EventType { get; set; }
        public string Formula { get; set; } // Formula
        public int? ClaimEstimateTypeId { get; set; } // ClaimEstimateTypeId
        public string MinEarningsFormula { get; set; } // MinEarningsFormula
        public string MaxEarningsFormula { get; set; } // MaxEarningsFormula
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public decimal? EstimatedDaysOff { get; set; } // EstimatedDaysOff

    }
}
