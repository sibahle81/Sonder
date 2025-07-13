using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.PDPercentage
{
    public class PDPercentageRule : IRule
    {
        public const string RuleName = Constants.PDPercentageRule;
        private const decimal percentage = 0;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP09";
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
                    var pdPercentage = GetPDPercentage(ruleData);
                    return CreateResult(pdPercentage);
                }
                else
                    return CreateNoDataRuleResult();

            }
            catch (ArgumentNullException ex)
            {
                ex.LogException();
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { "No data was supplied" }
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

        private static decimal GetPDPercentage(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.PDPercentage))
                throw new BusinessException("PD Percentage is required");

            try
            {
                return Convert.ToDecimal(ruleData.PDPercentage);
            }
            catch
            {
                throw new BusinessException($"The PD percentage is incorrect");
            }
        }

        private static RuleResult CreateResult(decimal pdPercentage)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = pdPercentage <= percentage,
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
                MessageList = new List<string> { "No data was supplied" }
            };
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add($"PD percentage must be 0");
        }
    }
}
