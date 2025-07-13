using Newtonsoft.Json.Linq;

using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ExternalCauseCode
{
    public class ExternalCauseCodeRule : IRule
    {
        public const string RuleName = Constants.ExternalCauseCodeRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI29";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            List<RuleData> ruleDataList;

            if (context == null || string.IsNullOrWhiteSpace(context.Data))
                return CreateNoDataRuleResult();

            var data = JToken.Parse(context.Data);

            ruleDataList = data is JArray ? data.ToObject<List<RuleData>>() : new List<RuleData> { data.ToObject<RuleData>() };

            var ruleData = ruleDataList.FirstOrDefault();

            if (ruleData != null)
                return CreateResult(ruleData);
            else
                return CreateNoDataRuleResult();
        }

        private RuleResult CreateResult(RuleData ruleData)
        {
            var result = new RuleResult
            {
                RuleName = Constants.ExternalCauseCodeRuleName,
                Passed = !ruleData.IsOnlyExternalICD10CauseCodeSupplied,
                MessageList = new List<string>()
            };

            AddMessages(result);
            return result;
        }

        private RuleResult CreateNoDataRuleResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { Constants.NoData }
            };
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add(Constants.ExternalCauseCodeValidationMessage);
        }
    }
}
