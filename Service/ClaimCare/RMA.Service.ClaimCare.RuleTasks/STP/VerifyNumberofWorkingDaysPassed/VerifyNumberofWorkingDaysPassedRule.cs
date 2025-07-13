using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClaimCare.RuleTasks.STP.VerifyNumberofWorkingDaysPassed.Extensions;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.VerifyNumberofWorkingDaysPassed
{
    public class VerifyNumberofWorkingDaysPassedRule : IRule
    {
        private readonly IPublicHolidayService _publicHolidayService;
        public const string RuleName = Constants.VerifyNumberofWorkingDaysPassedRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP22";
        public string Version { get; } = "1.0";

        public VerifyNumberofWorkingDaysPassedRule(IPublicHolidayService publicHolidayService)
        {
            _publicHolidayService = publicHolidayService;
        }

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
                    return CreateResult(ruleData);
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

        private bool VerifyWorkingDaysPassed(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.WorkingDaysPassed.ToString()) || ruleData.WorkingDaysPassed == 0)
                throw new BusinessException("You have to specify the number of working days to verify against");

            if (string.IsNullOrWhiteSpace(ruleData.ClaimDate.ToString()) || ruleData.ClaimDate == DateTime.MinValue)
                throw new BusinessException("You have to specify a valid claim date to verify against");

            if (ruleData.HolidayDates == null || ruleData.HolidayDates.Count == 0)
            {
                var publicHolidays = _publicHolidayService.GetPublicHolidays().Result;

                ruleData.HolidayDates = publicHolidays
                    .Select(row => Tuple.Create(row.HolidayDate.Month, row.HolidayDate.Day))
                    .ToList();
            }

            return ruleData.ClaimDate.AddBusinessDays(ruleData.WorkingDaysPassed, ruleData.HolidayDates) <= DateTimeHelper.SaNow.Date;
        }

        private RuleResult CreateResult(RuleData ruleData)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = VerifyWorkingDaysPassed(ruleData),
                MessageList = new List<string>()
            };

            AddMessages(result, ruleData);
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

        private static void AddMessages(RuleResult result, RuleData ruleData)
        {
            if (!result.Passed)
            {
                var formattedDate = ruleData.ClaimDate.ToString("yyyy-MM-dd");
                result.MessageList.Add($"Number of working days of {ruleData.WorkingDaysPassed} have not passed yet from claim's date of {formattedDate}");
            }
        }
    }
}
