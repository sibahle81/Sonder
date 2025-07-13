using System;
using System.Collections.Generic;

namespace RMA.Service.Admin.RulesManager.Contracts.Entities
{
    public class RuleRequestResult
    {
        public Guid RequestId { get; set; }

        public bool OverallSuccess { get; set; }

        public List<RuleResult> RuleResults { get; set; }
    }
}