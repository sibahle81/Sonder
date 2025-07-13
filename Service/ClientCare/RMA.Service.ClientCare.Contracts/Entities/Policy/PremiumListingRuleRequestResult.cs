using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumListingRuleRequestResult
    {
        public Guid RequestId { get; set; }

        public bool OverallSuccess { get; set; }

        public List<PremiumListingRuleResult> RuleResults { get; set; }
    }
}
