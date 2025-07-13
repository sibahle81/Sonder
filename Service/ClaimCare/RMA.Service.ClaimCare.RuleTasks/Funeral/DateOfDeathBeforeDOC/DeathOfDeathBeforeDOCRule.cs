using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.DateOfDeathBeforeDOC
{
    public class DeathOfDeathBeforeDOCRule : IRule
    {
        public const string RuleName = "Date of Death Before DOC";
        public string Name { get; } = RuleName;
        public string Code { get; } = "DODBEFOREDOC";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                if (context == null)
                    throw new ArgumentNullException(nameof(context), "IRuleContext is null");

                var ruleData = context.Deserialize<RuleData>(context.Data);
                return ValidateInput(ruleData);
            }
            catch (ArgumentNullException)
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { "No data was supplied" }
                };
            }

        }

        private static RuleResult ValidateInput(RuleData ruleData)
        {
            var dateCompare = DateTime.Compare(ruleData.DateOfDeath, ruleData.DOCOfPolicy);

            bool blnResult = true;
            List<string> messageList = new List<string>();

            if (dateCompare < 0)
            {
                blnResult = false;
                messageList.Add($"Date of Death {ruleData.DateOfDeath} is before DOC of the policy {ruleData.DOCOfPolicy} ");
            }

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = blnResult,
                MessageList = messageList
            };

            return result;
        }

    }
}
