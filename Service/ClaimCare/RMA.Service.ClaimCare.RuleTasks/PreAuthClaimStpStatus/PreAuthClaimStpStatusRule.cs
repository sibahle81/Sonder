using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.PreAuthClaimStpStatus
{
    public class PreAuthClaimStpStatusRule : IRule
    {
        public const string RuleName = Constants.ClaimStpStatusRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "PAC10";
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
                    ValidateRuleData(ruleData.StpStatus);
                    return CreateResult(ruleData.StpStatus);
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

        private void ValidateRuleData(bool ruleData)
        {
            if (ruleData)
            {
                throw new BusinessException(Constants.ClaimStpStatus);
            }
        }

        private RuleResult CreateResult(bool ruleData)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = !ruleData,
                MessageList = new List<string>()
            };

            AddMessages(result);
            return result;
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add(Constants.ClaimStpStatus);
        }
    }
}
