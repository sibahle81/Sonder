using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.PreAuthClaim
{
    public class ClaimLiabilityStatusRule : IRule
    {
        public const string RuleName = Constants.LiabilityStatusAcceptedOrMedicalLiability;
        public string Name { get; } = RuleName;
        public string Code { get; } = "PAC01";
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
                    ValidateRuleData(ruleData.LiabilityStatus);
                    return CreateResult(ruleData.LiabilityStatus);
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

        private void ValidateRuleData(string ruleData)
        {
            if (string.IsNullOrEmpty(ruleData))
            {
                throw new BusinessException("Liability status is required");
            }
        }

        private RuleResult CreateResult(string ruleData)
        {

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = ruleData == Constants.Accepted || ruleData == Constants.MedicalLiability || ruleData == "MedicalLiability",
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
                result.MessageList.Add("Claim liability status validation failed");
        }

    }
}
