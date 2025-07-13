using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.MultipleDaysBookedOffFromWork
{
    public class MultipleDaysBookedOffFromWorkRule : IRule
    {
        public const string RuleName = Constants.MultipleDaysBookedOffFromWorkRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP10V2";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                List<RuleDataList> ruleDataList;

                if (context == null || string.IsNullOrWhiteSpace(context.Data))
                    return CreateNoDataRuleResult();

                var data = JToken.Parse(context.Data);

                ruleDataList = data is JArray ? data.ToObject<List<RuleDataList>>() : new List<RuleDataList> { data.ToObject<RuleDataList>() };

                var count = ruleDataList.Where(t => t.FirstMedicalReports != null).Count();
                if (count == 0)
                    return CreateNoDataRuleResult();

                var RuleResult = CreateEmptyRuleResult();

                foreach (RuleDataList ruleDataListItem in ruleDataList.Where(t => t.FirstMedicalReports != null))
                {
                    foreach (RuleData ruleData in ruleDataListItem.FirstMedicalReports)
                    {
                        RuleResult = CreateRuleResult(ruleData);
                        if (RuleResult.Passed == false) break;
                    }
                }

                return RuleResult;
            }
            catch (ArgumentNullException ex)
            {
                ex.LogException();
                return CreateNoDataRuleResult();
            }
            catch (Exception ex)
            {
                ex.LogException();
                return CreateExceptionRuleResult(ex.Message + "The DaysBookedOffFromWorkId is not valid");
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

        private RuleResult CreateEmptyRuleResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string>()
            };
        }

        private RuleResult CreateExceptionRuleResult(string message)
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { message }
            };
        }

        private static RuleResult CreateRuleResult(RuleData ruleData)
        {
            var RuleResult = new RuleResult
            {
                RuleName = RuleName,
                Passed = ruleData.DaysBookedOffFromWorkId == DaysBookedOffFromWorkEnum.ZeroTo3Days,
                MessageList = new List<string>()
            };

            AddMessages(RuleResult);
            return RuleResult;
        }

        private static void AddMessages(RuleResult RuleResult)
        {
            if (!RuleResult.Passed)
                RuleResult.MessageList.Add($"Days Booked Off From Work must be 0-3 Days");
        }
    }
}
