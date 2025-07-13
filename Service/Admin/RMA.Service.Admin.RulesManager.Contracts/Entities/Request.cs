using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.Admin.RulesManager.Contracts.Entities
{
    public class RuleRequest
    {
        public List<int> RuleIds { get; set; }
        public List<string> RuleNames { get; set; }
        public List<RuleItem> RuleItems { get; set; }
        public string Data { get; set; }
        public string ExecutionFilter { get; set; }
    }
}