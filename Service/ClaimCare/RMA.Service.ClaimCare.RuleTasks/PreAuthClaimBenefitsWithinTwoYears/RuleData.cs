using System;

namespace RMA.Service.ClaimCare.RuleTasks.PreAuthClaimBenefitsWithinTwoYears
{
    public class RuleData
    {
        public DateTime EventDate { get; set; }

        public DateTime RequestDate { get; set; }

        public bool HasBenefitMoreThan2Years { get; set; }
    }
}
