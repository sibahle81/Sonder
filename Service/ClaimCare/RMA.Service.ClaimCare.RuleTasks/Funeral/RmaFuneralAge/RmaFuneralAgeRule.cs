using RMA.Common.Exceptions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Windows.Forms;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.RmaFuneralAge
{
    public class RmaFuneralAgeRule : IRule
    {
        public const string RuleName = "RMA Fatal Cover Age";
        public string Name { get; } = RuleName;
        public string Code { get; } = "FUNERAL02";
        public string Version { get; } = "1.0";

        private const int MinimumAge = 18;
        private const int MaximumAge = 85;

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                if (context == null)
                    throw new ArgumentNullException(nameof(context), "IRuleContext is null");

                var ruleData = context.Deserialize<RuleData>(context.Data);
                var dateOfBirth = GetDateOfBirth(ruleData);
                var age = GetAge(dateOfBirth);

                var result = CreateResult(age);
                return result;
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

        private static DateTime GetDateOfBirth(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.DateOfBirth) && string.IsNullOrWhiteSpace(ruleData.IdNumber))
            {
                throw new BusinessException("Either date of birth or id number is required");
            }

            if (!string.IsNullOrWhiteSpace(ruleData.DateOfBirth))
            {
                try
                {
                    return Convert.ToDateTime(ruleData.DateOfBirth);
                }
                catch
                {
                    throw new BusinessException($"The date of birth '{ruleData.DateOfBirth}' is incorrect");
                }
            }

            try
            {
                var year = Convert.ToInt32(ruleData.IdNumber.Substring(0, 2));
                if (year < 20) year += 2000;
                else year += 1900;

                var month = Convert.ToInt32(ruleData.IdNumber.Substring(2, 2));
                var day = Convert.ToInt32(ruleData.IdNumber.Substring(4, 2));
                return new DateTime(year, month, day,0, 0, 0, DateTimeKind.Unspecified);
            }
            catch
            {
                throw new BusinessException($"The id number '{ruleData.IdNumber}' is incorrect");
            }
        }

        private static RuleResult CreateResult(int age)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = age >= MinimumAge && age <= MaximumAge,
                MessageList = new List<string>()
            };

            AddMessages(age, result);
            return result;
        }

        private static void AddMessages(int age, RuleResult result)
        {
            if (age < MinimumAge)
                result.MessageList.Add($"The minimum age is {MinimumAge}");

            if (age > MaximumAge)
                result.MessageList.Add($"The maximum age is {MaximumAge}");
        }

        private static int GetAge(DateTime dateOfBirth)
        {
            var age = (Int32.Parse(DateTime.Today.ToString("yyyyMMdd")) - Int32.Parse(dateOfBirth.ToString("yyyyMMdd"))) / 10000;
            if (dateOfBirth > DateTime.Today.AddYears(-age))
                age--;

            return age;
        }
    }
}