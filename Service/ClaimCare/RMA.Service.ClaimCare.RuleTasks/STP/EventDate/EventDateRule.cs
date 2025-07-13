using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.EventDate
{
    public class EventDateRule : IRule
    {
        public const string RuleName = Constants.EventDateRuleName;
        private const int maxDays = 90;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP05";
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
                    var eventDate = GetEventDate(ruleData);
                    return CreateResult(eventDate);
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

        private static DateTime GetEventDate(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.EventDate))
                throw new BusinessException("Event date is required");

            try
            {
                return Convert.ToDateTime(ruleData.EventDate);
            }
            catch (Exception ex)
            {
                throw new BusinessException($"The event date is incorrect", ex);
            }
        }

        private static RuleResult CreateResult(DateTime eventDate)
        {
            var days = (DateTimeHelper.SaNow - eventDate).TotalDays;
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = days < maxDays,
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
                result.MessageList.Add(string.Format("Event date must be less than {0} days old", maxDays.ToString()));
        }
    }
}
