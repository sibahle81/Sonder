using RMA.Common.Exceptions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.FuneralWaitingPeriod
{
    public class FuneralWaitingPeriod : IRule
    {
        public const string RuleName = "Fatal Waiting Period";
        public string Name { get; } = RuleName;
        public string Code { get; } = "FUNERALWAITINGPERIOD";
        public string Version { get; } = "1.0";

        private const int NaturalCauseBelow65WaitingPeriod = 180;
        private const int NaturalCauseAbove65WaitingPeriod = 180;
        private const int SuicideWaitingPeriod = 360;
        private const string MessageWaitingPeriod = "Policy within the waiting period";
        private const string MessageFirstPremium = "1st premium has not been paid";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                if (context == null)
                    throw new ArgumentNullException(nameof(context), "IRuleContext is null");

                var ruleData = context.Deserialize<RuleData>(context.Data);
                return CreateResult(ruleData);
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


        private static RuleResult CreateResult(RuleData ruleData)
        {
            var passed = true;
            var messageList = new List<string>();
            var dateOfBirth = GetDateOfBirth(ruleData);
            var age = GetAge(dateOfBirth);
            var daysFromPolicyInception = GetDaysFromInceptionDate(ruleData);
            int appliedWaitingPeriod = GetAppliedWaitingPeriod(age, ruleData);

            // NATURAL, STILLBORN, SUICIDE
            if ((ruleData.TypeOfDeathId == 1 || ruleData.TypeOfDeathId == 3 || ruleData.TypeOfDeathId == 4)
                && daysFromPolicyInception < appliedWaitingPeriod)
            {
                passed = false;
                messageList.Add(MessageWaitingPeriod);
            }

            // UNNATURAL
            if (ruleData.TypeOfDeathId == 2 && !ruleData.FirstPremiumPaid)
            {
                passed = false;
                messageList.Add(MessageFirstPremium);
            }

            return new RuleResult
            {
                RuleName = RuleName,
                Passed = passed,
                MessageList = messageList
            };
        }

        private static int GetAppliedWaitingPeriod(int age, RuleData ruleData)
        {
            if (ruleData.TypeOfDeathId == 3)
            {
                return SuicideWaitingPeriod;
            }
            else if (age < 65)
            {
                return NaturalCauseBelow65WaitingPeriod;
            }
            else
            {
                return NaturalCauseAbove65WaitingPeriod;
            }
        }

        private static DateTime GetDateOfBirth(RuleData ruleData)
        {
            try
            {
                if (!string.IsNullOrEmpty(ruleData.IdNumber))
                {
                    var year = Convert.ToInt32(ruleData.IdNumber.Substring(0, 2));
                    if (year < 20) year += 2000;
                    else year += 1900;

                    var month = Convert.ToInt32(ruleData.IdNumber.Substring(2, 2));
                    var day = Convert.ToInt32(ruleData.IdNumber.Substring(4, 2));
                    return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Unspecified);
                }
                else
                {
                    return ruleData.DateOfBirth;
                }
            }
            catch
            {
                throw new BusinessException($"The id number '{ruleData.IdNumber}' is incorrect");
            }
        }

        private static int GetAge(DateTime dateOfBirth)
        {
            var age = (Int32.Parse(DateTime.Today.ToString("yyyyMMdd")) - Int32.Parse(dateOfBirth.ToString("yyyyMMdd"))) / 10000;
            if (dateOfBirth > DateTime.Today.AddYears(-age))
                age--;

            return age;
        }

        private static int GetDaysFromInceptionDate(RuleData ruleData)
        {
            var useReInstateDate = ((ruleData.ReinstateDate - ruleData.InceptionDate).TotalDays < 180);

            return Convert.ToInt32(useReInstateDate ?
                (DateTime.Today - ruleData.ReinstateDate).TotalDays : (DateTime.Today - ruleData.InceptionDate).TotalDays);
        }
    }
}