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
using System.Web.ApplicationServices;
using System.Web.Script.Serialization;

namespace RMA.Service.ClaimCare.RuleTasks.STP.PossibleBenefitsDue
{
    public class PossibleBenefitsDueRule : IRule
    {
        public const string RuleName = Constants.PossibleBenefitsDueRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP02";
        public string Version { get; } = "1.0";
        private readonly IRuleService _rulesService;
        private readonly IConfigurationService _configuration;
        public const string IncludeNewPossibleBenefitsDueConfigEntry = "IncludeNewPossibleBenefitsDue";

        public PossibleBenefitsDueRule(IRuleService rulesService, IConfigurationService configuration)
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
                    var configs = GetSTPConfigurationMetaData();
                    JavaScriptSerializer js = new JavaScriptSerializer();
                    ConfigurationMetaData[] configurationMetaDatas = js.Deserialize<ConfigurationMetaData[]>(configs);

                    var includeNew = IncludeNewPossibleBenefitsDue(configurationMetaDatas);
                    var possibleBenefitsDueName = GetPossibleBenefitsDueName(ruleData);
                    return CreateResult(possibleBenefitsDueName, includeNew);
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

        private string GetSTPConfigurationMetaData()
        {
            var ruleModel = _rulesService.GetRuleByName("STP02").Result;
            if (ruleModel != null)
                return ruleModel.ConfigurationMetaData;
            return "";
        }

        private static string GetPossibleBenefitsDueName(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.PossibleBenefitsDueName))
                throw new BusinessException("Possible benefits due name is required");
            else
                return ruleData.PossibleBenefitsDueName;
        }

        private static RuleResult CreateResult(string possibleBenefitsDueName, bool includeNew)
        {
            var passed = false;
            if (!includeNew)
                passed = GetDescriptions(typeof(PossibleBenefitsDueEnum)).Contains(possibleBenefitsDueName);
            else
                passed = GetDescriptions(typeof(PossibleBenefitsDueEnumNew)).Contains(possibleBenefitsDueName);

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = passed,
                MessageList = new List<string>()
            };

            AddMessages(result, includeNew);
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

        private static void AddMessages(RuleResult result, bool includeNew)
        {
            if (!result.Passed)
            {
                if (!includeNew)
                    result.MessageList.Add($"Possible Benefits Due must be Minor Injury, Treat & Return or Notification Only");
                else
                    result.MessageList.Add($"Possible Benefits Due must be Minor Injury, Treat & Return, Notification Only, Days <= 14 or Medical");
            }
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
