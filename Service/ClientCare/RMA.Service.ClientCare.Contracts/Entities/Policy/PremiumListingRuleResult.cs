using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumListingRuleResult
    {
        public PremiumListingRuleResult()
        {
            MessageList = new List<string>();
        }

        public string RuleName { get; set; }
        public bool Passed { get; set; }
        public List<string> MessageList { get; set; }
    }
}
