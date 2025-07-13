using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TwoYear
{
    public class TwoYearRule : IRule
    {
        public const string RuleName = Constants.TwoYearRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI17";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                List<RuleData> ruleDataList;

                if (context == null || string.IsNullOrWhiteSpace(context.Data))
                    return CreateNoDataRuleResult();

                var data = JToken.Parse(context.Data);

                ruleDataList = data is JArray ? data.ToObject<List<RuleData>>() : new List<RuleData> { data.ToObject<RuleData>() };

                var ruleData = ruleDataList.FirstOrDefault();

                if (ruleData != null)
                {
                    return CreateResult(ruleData.EventDate, ruleData.DateAdmitted);
                }

                return CreateNoDataRuleResult();
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

        private RuleResult CreateResult(DateTime eventDate, DateTime dateAdmitted)
        {
            var passed = false;
            if (eventDate != DateTime.MinValue && dateAdmitted != DateTime.MinValue)
            {
                var daysDiff = (dateAdmitted.Subtract(eventDate)).Days;
                passed = (daysDiff >= (365 * 2));
            }

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = passed,
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
                result.MessageList.Add(Constants.TwoYearRuleValidation);
        }
    }
}
