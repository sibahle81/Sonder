using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.RuleTasks.CapCover
{
    public class CapCoverRule : IRule
    {
        public const string RuleName = "Cover value capped at R7.5 million per employee";
        public string Name { get; } = RuleName;
        public string Code { get; } = "CAPCOVER75";
        public string Version { get; } = "1.0";

        private const int CapAmount = 7500000;  // 7,500,000
        private const string InvalidMessage = "The amount of {0} exceeds the maximum amount of 7.5 Million!";
        private const string PassedMessage = "Successfully passed";

        public RuleResult Execute(IRuleContext context)
        {
            var result = new RuleResult { RuleName = RuleName, MessageList = new List<String>() };
            try
            {
                var ruleData = context?.Deserialize<RuleData>(context.Data);

                if (ruleData.MonetaryValue > CapAmount)
                {
                    result.Passed = false;
                    result.MessageList.Add(String.Format(InvalidMessage, ruleData.MonetaryValue));
                }
                else
                {
                    result.Passed = true;
                    result.MessageList.Add(PassedMessage);
                }

                return result;
            }
            catch (Exception ex)
            {
                result.Passed = false;
                result.MessageList.Add(ex.Message);
                return result;
            }
        }
    }
}
