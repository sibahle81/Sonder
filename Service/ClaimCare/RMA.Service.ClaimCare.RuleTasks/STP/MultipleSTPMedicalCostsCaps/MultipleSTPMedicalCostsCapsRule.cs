using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.RuleTasks.STP;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web.Script.Serialization;

namespace Rules.ClaimsCare.MultipleSTPMedicalCostsCaps
{
    public class MultipleSTPMedicalCostsCapsRule : IRule
    {
        private readonly IRuleService _rulesService;
        public const string RuleName = Constants.MultipleSTPMedicalCostsCapsRuleName;
        public const string IncludeNewPossibleBenefitsDueConfigEntry = "IncludeNewPossibleBenefitsDue";

        public string Name { get; } = RuleName;
        public string Code { get; } = "MEDCAPSV2";
        public string Version { get; } = "1.0";

        public MultipleSTPMedicalCostsCapsRule(IRuleService rulesService)
        {
            _rulesService = rulesService;
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

                foreach (RuleDataList ruleDataListItem in ruleDataList.Where(t => t.InjuryDetails != null))
                {
                    foreach (RuleData ruleData in ruleDataListItem.InjuryDetails)
                    {
                        ValidateRuleData(ruleData);
                    }
                }


                var configs = GetSTPConfigurationMetaData();
                JavaScriptSerializer js = new JavaScriptSerializer();
                ConfigurationMetaData[] configurationMetaDatas = js.Deserialize<ConfigurationMetaData[]>(configs);

                var includeNew = IncludeNewPossibleBenefitsDue(configurationMetaDatas);
                return CreateResult(ruleDataList, configurationMetaDatas, includeNew);
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

        private static bool IncludeNewPossibleBenefitsDue(ConfigurationMetaData[] configurationMetaDatas)
        {
            var includeNewPossibleBenefitsDue = Array.Find(configurationMetaDatas, t => t.fieldName == "IncludeNewPossibleBenefitsDue");
            if (includeNewPossibleBenefitsDue == null)
                throw new ArgumentNullException(nameof(configurationMetaDatas), $"{IncludeNewPossibleBenefitsDueConfigEntry} config entry was not supplied in Rule's ConfigMetaData");

            if (bool.TryParse(includeNewPossibleBenefitsDue.defaultValue, out bool includeNewPossibleBenefitsDueVal))
                return includeNewPossibleBenefitsDueVal;
            else
                throw new ArgumentNullException(nameof(configurationMetaDatas), $"Invalid value supplied for {IncludeNewPossibleBenefitsDueConfigEntry} config entry, not a valid boolean value");
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

        

        private static void ValidateRuleData(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.PossibleBenefitsDueName) || string.IsNullOrWhiteSpace(ruleData.TotalAmount))
                throw new ArgumentNullException(nameof(ruleData), "Both possible benefits due name and total amount are required");

            if (!string.IsNullOrWhiteSpace(ruleData.TotalAmount))
            {
                try
                {
                    Convert.ToDecimal(ruleData.TotalAmount);
                }
                catch
                {
                    throw new ArgumentNullException(nameof(ruleData), "The total amount is incorrect");
                }
            }
        }

        private string GetSTPConfigurationMetaData()
        {
            var ruleModel = _rulesService.GetRuleByName(Code).Result;
            if (ruleModel != null)
                return ruleModel.ConfigurationMetaData;
            return "";
        }

        private static RuleResult CreateResult(RuleData ruleData, ConfigurationMetaData[] configurationMetaDatas, bool includeNew)
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
                if (string.Equals(possibleBenefitsDueName, "minor injury", StringComparison.OrdinalIgnoreCase) || string.Equals(possibleBenefitsDueName, "days <= 14", StringComparison.OrdinalIgnoreCase) || string.Equals(possibleBenefitsDueName, "medical", StringComparison.OrdinalIgnoreCase))
                {
                    var MILimit = Convert.ToDecimal(configurationMetaDatas[0].defaultValue);
                    if (DateTime.Now >= Convert.ToDateTime(configurationMetaDatas[2].defaultValue))
                    {
                        MILimit = Convert.ToDecimal(configurationMetaDatas[1].defaultValue);
                    }
                    if (Convert.ToDecimal(ruleData.TotalAmount) <= MILimit)
                        passed = true;
                    else
                        message = "Not within the STP limit";
                }
                else if (string.Equals(possibleBenefitsDueName, "treat & return", StringComparison.OrdinalIgnoreCase) || string.Equals(possibleBenefitsDueName, "notification only", StringComparison.OrdinalIgnoreCase))
                {
                    var TRLimit = Convert.ToDecimal(configurationMetaDatas[3].defaultValue);
                    if (DateTime.Now >= Convert.ToDateTime(configurationMetaDatas[5].defaultValue))
                    {
                        TRLimit = Convert.ToDecimal(configurationMetaDatas[4].defaultValue);
                    }
                    if (Convert.ToDecimal(ruleData.TotalAmount) <= TRLimit)
                        passed = true;
                    else
                        message = "Not within the STP limit";
                }
            }
            else
                message = "Possible Benefits Due must be either Minor Injury, Treat & Return or Notification Only";

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = passed,
                MessageList = new List<string>()
            };

            AddMessages(result, message);
            return result;
        }

        private RuleResult CreateResult(List<RuleDataList> ruleDataList, ConfigurationMetaData[] configurationMetaDatas, bool includeNew)
        {
            //var passed = false;
            var currentBenefitsAmount = 0M;

            var result = CreateEmptyResult();

            foreach (RuleDataList ruleDataListItem in ruleDataList)
            {
                foreach (RuleData ruleData in ruleDataListItem.InjuryDetails)
                {
                    if (currentBenefitsAmount > 0)
                        ruleData.TotalAmount += currentBenefitsAmount;

                    result = CreateResult(ruleData, configurationMetaDatas, includeNew);

                    if (result.Passed)
                    {
                        currentBenefitsAmount = Convert.ToDecimal(ruleData.TotalAmount);
                    }
                    else
                        return result;
                }
            }

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