using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.LiabilityDecisionOutstandingRequirements
{
    public class LiabilityDecisionOutstandingRequirementsRule : IRule
    {
        public const string RuleName = Constants.LiabilityDecisionOutstandingRequirementsRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP20";
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
                    var LiabilityDecisionName = GetLiabilityDecisionName(ruleData);
                    return CreateResult(LiabilityDecisionName);
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

        private RuleResult CreateNoDataRuleResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { "No data was supplied" }
            };
        }
        private static string GetLiabilityDecisionName(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.LiabilityDecisionName))
            {
                throw new BusinessException("Liability Decision name is required");
            }
            else
            {
                return ruleData.LiabilityDecisionName;
            }
        }

        private static RuleResult CreateResult(string LiabilityDecisionName)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = ListMethodsHelper.GetValues<LiabilityDecisionEnum>()
                             .Select(e => ListMethodsHelper.WithEnumDescription<LiabilityDecisionEnum>(e))
                             .Contains(LiabilityDecisionName),
                MessageList = new List<string>()
            };

            AddMessages(result);
            return result;
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add($"Liability Status must be Outstanding Requirements");
        }
    }
}
