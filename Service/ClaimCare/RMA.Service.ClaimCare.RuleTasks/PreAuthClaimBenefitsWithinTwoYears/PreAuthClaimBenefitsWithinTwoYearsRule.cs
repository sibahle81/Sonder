using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.PreAuthClaimBenefitsWithinTwoYears
{
    public class PreAuthClaimBenefitsWithinTwoYearsRule : IRule
    {
        public const string RuleName = Constants.PreAuthClaimBenefitsWithinTwoYears;
        public string Name { get; } = RuleName;
        public string Code { get; } = "PAC03";
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
                    ValidateRuleData(ruleData.EventDate, ruleData.RequestDate);
                    return CreateResult(ruleData.EventDate, ruleData.RequestDate, ruleData.HasBenefitMoreThan2Years);
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

        private void ValidateRuleData(DateTime eventDate, DateTime requestDate)
        {
            if (eventDate == DateTime.MinValue)
            {
                throw new BusinessException("Event date is invalid");
            }
            else if (requestDate == DateTime.MinValue)
            {
                throw new BusinessException("Request date is invalid");
            }
        }

        private RuleResult CreateResult(DateTime eventDate, DateTime requestDate, bool HasBenefitMoreThan2Years)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = requestDate <= eventDate.AddYears(2) && !HasBenefitMoreThan2Years,
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
                result.MessageList.Add("Validation failed. Claim has benefits that are over 2 years");
        }
    }
}
