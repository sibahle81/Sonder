using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BenefitCategoryFuneral
    {
        public int BenefitCategoryId { get; set; } // BenefitCategoryId (Primary key)
        public DateTime EffectiveDate { get; set; } // EffectiveDate (Primary key)
        public int FuneralInsuredTypeId { get; set; } // FuneralInsuredTypeId
        public decimal CoverAmount { get; set; } // CoverAmount
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
