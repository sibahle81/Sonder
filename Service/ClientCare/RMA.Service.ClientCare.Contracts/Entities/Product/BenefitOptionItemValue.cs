using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitOptionItemValue
    {
        public int BenefitOptionItemValueId { get; set; } // BenefitOptionItemValueId (Primary key)
        public int? BenefitId { get; set; } // BenefitId
        public int OptionItemId { get; set; } // OptionItemId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public decimal? Value { get; set; } // Value
        public bool IsExtended { get; set; } // IsExtended
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
