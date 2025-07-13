using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.FirstMedicalReport
{
    public class FirstMedicalReportRule : IRule
    {
        public const string RuleName = "First Medical Report";
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP08";
        public string Version { get; } = "1.0";
        private readonly IConfigurationService _configuration;

        public FirstMedicalReportRule(IConfigurationService configuration)
        {
            _configuration = configuration;
        }

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                if (context == null)
                    throw new ArgumentNullException(nameof(context), "context is null");

                var ruleData = context.Deserialize<RuleData>(context.Data);
                ValidateRuleData(ruleData);
                var includeNew = Convert.ToBoolean(_configuration.GetModuleSetting(SystemSettings.IncludeNewPossibleBenefitsDue).Result);
                return CreateResult(ruleData, includeNew);
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

        private static void ValidateRuleData(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.PossibleBenefitsDueName) || string.IsNullOrWhiteSpace(ruleData.MedicalReportId))
                throw new BusinessException("Both possible benefits due name and medical report id are required");

            try
            {
                Convert.ToInt32(ruleData.MedicalReportId);
            }
            catch
            {
                throw new BusinessException($"Medical Report Id is incorrect");
            }
        }

        private static RuleResult CreateResult(RuleData ruleData, bool includeNew)
        {
            var passed = false;
            var message = "";
            var possibleBenefitsDueName = ruleData.PossibleBenefitsDueName;

            var possibleBenefitsDueNamePassed = false;
            if (!includeNew)
                possibleBenefitsDueNamePassed = GetDescriptions(typeof(PossibleBenefitsDueEnum)).Contains(possibleBenefitsDueName);
            else
                possibleBenefitsDueNamePassed = GetDescriptions(typeof(PossibleBenefitsDueEnumNew)).Contains(possibleBenefitsDueName);

            if (possibleBenefitsDueNamePassed)
            {
                if (string.Equals(possibleBenefitsDueName, "minor injury", StringComparison.OrdinalIgnoreCase) || string.Equals(possibleBenefitsDueName, "treat & return", StringComparison.OrdinalIgnoreCase)
                     || string.Equals(possibleBenefitsDueName, "days <= 14", StringComparison.OrdinalIgnoreCase) || string.Equals(possibleBenefitsDueName, "medical", StringComparison.OrdinalIgnoreCase))
                {
                    if (Convert.ToInt32(ruleData.MedicalReportId) > 0)
                        passed = true;
                    else
                        message = "First medical report must be uploaded";
                }
                else if (string.Equals(possibleBenefitsDueName, "notification only", StringComparison.OrdinalIgnoreCase))
                {
                    passed = true;
                }
            }
            else
            {
                if (!includeNew)
                    message = "Possible Benefits Due must be Minor Injury, Treat & Return or Notification Only";
                else
                    message = "Possible Benefits Due must be Minor Injury, Treat & Return, Notification Only, Days <= 14 or Medical";
            }

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = passed,
                MessageList = new List<string>()
            };

            AddMessages(result, message);
            return result;
        }
       
        private static void AddMessages(RuleResult result, string message)
        {
            if (!result.Passed)
                result.MessageList.Add(message);
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
