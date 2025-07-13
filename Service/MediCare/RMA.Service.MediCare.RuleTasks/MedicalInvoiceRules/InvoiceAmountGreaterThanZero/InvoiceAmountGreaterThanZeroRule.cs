using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.InvoiceAmountGreaterThanZero
{
    public class InvoiceAmountGreaterThanZeroRule : IRule
    {
        public const string RuleName = Constants.InvoiceAmountGreaterThanZeroRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI34";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                if (context == null || string.IsNullOrWhiteSpace(context.Data))
                    return CreateNoDataRuleResult();

                var data = JToken.Parse(context.Data);

                var ruleDataList = data is JArray ? data.ToObject<List<RuleData>>() : new List<RuleData> { data.ToObject<RuleData>() };

                var ruleData = ruleDataList.FirstOrDefault();

                return ruleData != null ? CreateResult(ruleData) : CreateNoDataRuleResult();
            }
            catch (ArgumentNullException ex)
            {
                ex.LogException();
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { Constants.NoData }
                };
            }
            catch (Exception ex)
            {
                ex.LogException();
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { ex.Message }
                };
            }
        }
        private RuleResult CreateResult(RuleData ruleData)
        {
            var result = new RuleResult
            {
                RuleName = Constants.InvoiceAmountGreaterThanZeroRuleName,
                Passed = ruleData.InvoiceAmount > 0,
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
                result.MessageList.Add(Constants.InvoiceAmountGreaterThanZeroValidation);
        }
    }
}
