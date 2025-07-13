using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.ChildCapCover
{
    public class ChildCapCoverLimit : IRule
    {
        public const string RuleName = "Child Cap Cover";
        public string Name { get; } = RuleName;
        public string Code { get; } = "CHILDCOVER";
        public string Version { get; } = "1.0";

        private const decimal TwentyThousand = 20000m;
        private const decimal FiftyThousand = 50000m;
        private const decimal HundredTwentyThousand = 1040000m;


        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                var ruleData = context.Deserialize<RuleData>(context.Data);

                if (ruleData.BeneficiaryType != BeneficiaryTypeEnum.Child)
                {
                    return new RuleResult
                    {
                        RuleName = RuleName,
                        Passed = true,
                        MessageList = new List<string>
                        {
                            $"Rule skipped, beneficiary is not a child. {ruleData.BeneficiaryType.DisplayAttributeValue()}"
                        }
                    };
                }

                var result = ValidateInput(ruleData);

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

        private static RuleResult ValidateInput(RuleData ruleData)
        {
            var dateOfBirth = GetDateOfBirth(ruleData);
            var age = GetAge(dateOfBirth);
            var section55TotalCover = HundredTwentyThousand;
            switch (age)
            {
                case int ageRange when (ageRange >= 0 && ageRange <= 5):
                    section55TotalCover = TwentyThousand;
                    break;
                case int ageRange when (ageRange >= 6 && ageRange <= 13):
                    section55TotalCover = FiftyThousand;
                    break;
                case int ageRange when (ageRange >= 14):
                    section55TotalCover = HundredTwentyThousand;
                    break;
            }

            if (ruleData.TotalCoverAmount > section55TotalCover)
            {
                throw new BusinessException(
                   $"Child of age {age} has been covered more than the maximum amount of {section55TotalCover} with the total cover amount of {ruleData.TotalCoverAmount}");
            }

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = true,
                MessageList = new List<string>()
            };

            return result;
        }

        private static int GetAge(DateTime dateOfBirth)
        {
            var age = (Int32.Parse(DateTime.Today.ToString("yyyyMMdd")) - Int32.Parse(dateOfBirth.ToString("yyyyMMdd"))) / 10000;
            if (dateOfBirth > DateTime.Today.AddYears(-age))
                age--;

            return age;
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
                return new DateTime(year, month, day);
            }
            catch
            {
                throw new BusinessException($"The id number '{ruleData.IdNumber}' is incorrect");
            }
        }
    }
}
