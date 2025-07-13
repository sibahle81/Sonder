using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.ClaimStatusPended
{
    public class ClaimStatusPendedRule : IRule
    {
        public const string RuleName = Constants.ClaimStatusPendedRuleName;
        public string Name { get; } = Constants.ClaimStatusPendedRuleName;
        public string Code { get; } = "STP21";
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

                if (ruleData != null)
                {
                    var pdPercentage = GetClaimStatusName(ruleData);
                    return CreateResult(pdPercentage);
                }
                else
                {
                    return CreateNoDataRuleResult();
                }
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
            catch (Exception ex)
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { ex.Message }
                };
            }
        }

        private static string GetClaimStatusName(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.ClaimStatusName))
            {
                throw new BusinessException("Claim status name is required");
            }
            else
            {
                ruleData.ClaimStatusName = ruleData.ClaimStatusName.Replace(" ", "");
                return ruleData.ClaimStatusName;
            }
        }

        private static RuleResult CreateResult(string claimStatusName)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = Enum.IsDefined(typeof(ClaimStatusEnum), claimStatusName),
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
                result.MessageList.Add($"Claim Status must be Pended");
        }
    }
}
