using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateAfterDateOfDeath
{
    public class TreatmentToDateAfterDateOfDeathRule : IRule
    {
        public const string RuleName = Constants.MedicalInvoiceDateOfDeathRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI03";
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
                    return CreateResult(ruleData);
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
        private RuleResult CreateResult(RuleData ruleData)
        {
            var result = new RuleResult
            {
                RuleName = Constants.MedicalInvoiceDateOfDeathRuleName,
                Passed = (Convert.ToDateTime(ruleData.TreatmentToDate).Date <= Convert.ToDateTime(ruleData.DateOfDeath).Date),
                MessageList = new List<string>()
            };
            if (!result.Passed && ruleData.DateOfDeath == null)
            {
                result.Passed = true;
            }

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
                result.MessageList.Add(Constants.TreatmentToDateDateOfDeathValidation);
        }
    }
}
