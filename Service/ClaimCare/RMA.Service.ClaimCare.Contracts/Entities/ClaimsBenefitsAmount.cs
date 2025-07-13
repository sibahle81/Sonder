using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimsBenefitsAmount
    {
        public int ClaimBenefitAmountId { get; set; }
        public string BenefitName { get; set; }
        public int BenefitType { get; set; }
        public string Description { get; set; }
        public string Formula { get; set; }
        public string MinimumCompensationAmount { get; set; }
        public string MaximumCompensationAmount { get; set; }
        public string LinkedBenefits { get; set; }
        public System.DateTime StartDate { get; set; }
        public System.DateTime EndDate { get; set; }
        public Boolean IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }

    }
}
