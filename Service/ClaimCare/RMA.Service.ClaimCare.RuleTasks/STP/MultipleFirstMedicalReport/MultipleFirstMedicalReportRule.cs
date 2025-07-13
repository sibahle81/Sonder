using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.MultipleFirstMedicalReport
{
    public class MultipleFirstMedicalReportRule : IRule
    {
        public const string RuleName = Constants.MultipleFirstMedicalReportRuleName;

        public string Name { get; } = RuleName;
        public string Code { get; } = "STP08_V2";
        public string Version { get; } = "1.0";
        private readonly IConfigurationService _configuration;

        public MultipleFirstMedicalReportRule(IConfigurationService configuration)
        {
            _configuration = configuration;
        }

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                if (context == null) 
                    throw new ArgumentNullException(nameof(context), "IRuleContext is null");

                List<RuleDataList> ruleDataList;
                var data = JToken.Parse(context.Data);

                ruleDataList = data is JArray ? data.ToObject<List<RuleDataList>>() : new List<RuleDataList> { data.ToObject<RuleDataList>() };


                var count = ruleDataList.Count(t => t.FirstMedicalReports != null);
                if (count == 0)
                    return CreateNotDataResult();

                var result = CreateEmptyResult();
                var includeNew = Convert.ToBoolean(_configuration.GetModuleSetting(SystemSettings.IncludeNewPossibleBenefitsDue).Result);
                foreach (RuleDataList ruleDataListItem in ruleDataList.Where(t => t.FirstMedicalReports != null))
                {
                    foreach (RuleData ruleData in ruleDataListItem.FirstMedicalReports)
                    {
                        ValidateRuleData(ruleData);
                        result = CreateResult(ruleData, includeNew);
                        if (!result.Passed ) break;
                    }
                }

                return result;
            }
            catch (ArgumentNullException ex)
            {
                ex.LogException();
                return CreateNotDataResult();
            }
            catch (Exception ex)
            {
                ex.LogException();
                return CreateExceptionResult(ex.Message);
            }
        }

        private RuleResult CreateNotDataResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { "No data was supplied" }
            };
        }

        private RuleResult CreateEmptyResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string>()
            };
        }

        private RuleResult CreateExceptionResult(string message)
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { message }
            };
        }

        private static void ValidateRuleData(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.PossibleBenefitsDueName) || string.IsNullOrWhiteSpace(ruleData.MedicalReportId.ToString()))
                throw new ArgumentNullException(nameof(ruleData), "Both possible benefits due name and medical report id are required");

            try
            {
                Convert.ToInt32(ruleData.MedicalReportId);
            }
            catch
            {
                throw new ArgumentNullException(nameof(ruleData),"Medical Report Id is incorrect");
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
