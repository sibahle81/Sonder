

using System;

namespace RMA.Service.ClaimCare.RuleTasks.PreAuthClaimNotOlderThanTwoYears
{
    public class RuleData
    {
        public DateTime EventDate { get; set; }

        public DateTime RequestDate { get; set; }
    }
}
