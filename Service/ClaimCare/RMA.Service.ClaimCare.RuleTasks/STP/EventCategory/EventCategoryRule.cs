using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.EventCategory
{
    public class EventCategoryRule : IRule
    {
        public const string RuleName = Constants.EventCategoryRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP01";
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
                    var eventCategoryName = GetEventCategoryName(ruleData);
                    return CreateResult(eventCategoryName);
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

        private static string GetEventCategoryName(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.EventCategoryName))
                throw new BusinessException("Event category name is required");
            else
                return ruleData.EventCategoryName;
        }

        private static RuleResult CreateResult(string eventCategoryName)
        {
            var passed = GetDescriptions(typeof(EventCategoryEnum)).Contains(eventCategoryName);
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
                MessageList = new List<string> { "No data was supplied" }
            };
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add($"Event Category must be Accident");
        }

        private static IEnumerable<string> GetDescriptions(Type type)
        {
            var descriptions = new List<string>();
            var names = Enum.GetNames(type);
            foreach (var name in names)
            {
                var field = type.GetField(name);
                var attributes = field.GetCustomAttributes(typeof(DescriptionAttribute), true);
                foreach (DescriptionAttribute attribute in attributes)
                {
                    descriptions.Add(attribute.Description);
                }
            }
            return descriptions;
        }
    }
}
