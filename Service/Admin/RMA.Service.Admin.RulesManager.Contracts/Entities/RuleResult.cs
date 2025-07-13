using System.Collections.Generic;

namespace RMA.Service.Admin.RulesManager.Contracts.Entities
{
    public class RuleResult
    {
        public RuleResult()
        {
            MessageList = new List<string>();
        }

        public string RuleName { get; set; }
        public bool Passed { get; set; }
        public List<string> MessageList { get; set; }
    }
}