using Castle.Core.Internal;
using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web.Script.Serialization;

namespace RMA.Service.ClaimCare.RuleTasks.STP.STPMedicalCostsCaps
{
    public class STPMedicalCostsCapsRule : IRule
    {
        private readonly IRuleService _rulesService;
        public const string RuleName = "STP Medical Costs Caps";
        public const string IncludeNewPossibleBenefitsDueConfigEntry = "IncludeNewPossibleBenefitsDue";
        public string Name { get; } = RuleName;
        public string Code { get; } = "STPMEDCAPS";
        public string Version { get; } = "1.0";
        private readonly IConfigurationService _configuration;

        public STPMedicalCostsCapsRule(IRuleService rulesService, IConfigurationService configuration)
        {
            _rulesService = rulesService;
            _configuration = configuration;
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
                    ValidateRuleData(ruleData);
                    var configs = GetSTPConfigurationMetaData();
                    JavaScriptSerializer js = new JavaScriptSerializer();
                    ConfigurationMetaData[] configurationMetaDatas = js.Deserialize<ConfigurationMetaData[]>(configs);

                    var includeNew = IncludeNewPossibleBenefitsDue(configurationMetaDatas);
                    return CreateResult(ruleData, configurationMetaDatas, includeNew);
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

        private static bool IncludeNewPossibleBenefitsDue(ConfigurationMetaData[] configurationMetaDatas)
        {
            var includeNewPossibleBenefitsDue = configurationMetaDatas.Find(t => t.fieldName == "IncludeNewPossibleBenefitsDue");
            if (includeNewPossibleBenefitsDue == null)
                throw new ArgumentNullException(nameof(configurationMetaDatas), $"{IncludeNewPossibleBenefitsDueConfigEntry} config entry was not supplied in Rule's ConfigMetaData");

            if (bool.TryParse(includeNewPossibleBenefitsDue.defaultValue, out bool includeNewPossibleBenefitsDueVal))
                return includeNewPossibleBenefitsDueVal;
            else
                throw new ArgumentNullException(nameof(configurationMetaDatas), $"Invalid value supplied for {IncludeNewPossibleBenefitsDueConfigEntry} config entry, not a valid boolean value");
        }

        private static void ValidateRuleData(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.PossibleBenefitsDueName) || string.IsNullOrWhiteSpace(ruleData.TotalAmount))
                throw new BusinessException("Both possible benefits due name and total amount are required");

            if (!string.IsNullOrWhiteSpace(ruleData.TotalAmount))
            {
                try
                {
                    Convert.ToDecimal(ruleData.TotalAmount);
                }
                catch
                {
                    throw new BusinessException("The total amount is incorrect");
                }
            }
        }

        private string GetSTPConfigurationMetaData()
        {
            var ruleModel = _rulesService.GetRuleByName("STPMEDCAPS").Result;
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
                    if (DateTimeHelper.SaNow >= Convert.ToDateTime(configurationMetaDatas[2].defaultValue))
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
                    if (DateTimeHelper.SaNow >= Convert.ToDateTime(configurationMetaDatas[5].defaultValue))
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

        private RuleResult CreateNoDataRuleResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { "No data was supplied" }
            };
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
