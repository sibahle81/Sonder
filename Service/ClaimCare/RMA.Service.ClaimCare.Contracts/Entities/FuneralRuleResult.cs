using System.Collections.Generic;

namespace RMA.Service.Admin.RulesManager.Contracts.Entities
{
    public class FuneralRuleResult
    {
        public FuneralRuleResult()
        {
            MessageList = new Dictionary<int, string>();
        }

        public string RuleName { get; set; }
        public bool Passed { get; set; }
        public Dictionary<int, string> MessageList { get; set; }
    }
}