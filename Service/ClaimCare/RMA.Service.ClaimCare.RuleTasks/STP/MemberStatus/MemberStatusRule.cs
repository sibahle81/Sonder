using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.MemberStatus
{
    public class MemberStatusRule : IRule
    {
        public const string RuleName = Constants.MemberStatusRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP06";
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
                    var memberStatus = GetMemberStatus(ruleData);
                    return CreateResult(memberStatus);
                }
                else
                    return CreateNoDataRuleResult();
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

        private static bool GetMemberStatus(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.MemberStatus))
                throw new BusinessException("Member status is required");

            try
            {
                return Convert.ToBoolean(ruleData.MemberStatus);
            }
            catch
            {
                throw new BusinessException($"The member status is incorrect");
            }
        }

        private static RuleResult CreateResult(bool memberStatus)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = memberStatus,
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
                result.MessageList.Add($"Member Status must be active");
        }
    }
}
