
using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitCompensationAmount
    {
        public int BenefitCompensationAmountId { get; set; } // BenefitCompensationAmountId (Primary key)
        public DateTime StartDate { get; set; } // StartDate
        public DateTime? EndDate { get; set; } // EndDate
        public decimal? MinCompensationAmount { get; set; } // MinCompensationAmount
        public decimal? MaxCompensationAmount { get; set; } // MaxCompensationAmount
        public decimal? ExcessAmount { get; set; } // ExcessAmount
        public int BenefitId { get; set; } // BenefitId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate     
    }
}