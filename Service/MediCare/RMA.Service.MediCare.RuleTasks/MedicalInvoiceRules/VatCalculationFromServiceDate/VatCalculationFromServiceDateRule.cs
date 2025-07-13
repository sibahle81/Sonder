using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate
{
    public class VatCalculationFromServiceDateRule : IRule
    {
        public const string RuleName = Constants.VatCalculationFromServiceDateRule;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI13";
        public string Version { get; } = "1.0";
        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                List<RuleData> ruleDataList;

                if (context == null || string.IsNullOrWhiteSpace(context.Data))
                    return CreateNoDataRuleResult();

                var data = JToken.Parse(context.Data);

                ruleDataList = data is JArray ? data.ToObject<List<RuleData>>() : new List<RuleData> { data.ToObject<RuleData>() };

                var ruleData = ruleDataList;

                if (ruleData.Count != 0)
                {
                    var results = new RuleResult();

                    foreach (var lineRuleData in ruleData)
                    {

                        if (lineRuleData.VatCode == VatCodeEnum.StandardVATRate && lineRuleData.VatAmount1 != lineRuleData.VatAmount2)
                        {
                            results = CreateResult(lineRuleData);
                            break;
                        }
                        else
                        {
                            results = new RuleResult()
                            {
                                RuleName = RuleName,
                                Passed = true,
                                MessageList = new List<string>()
                            };
                        }
                    }

                    return results;
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
                    MessageList = new List<string> { Constants.NoData }
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
        private RuleResult CreateResult(RuleData ruleData)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = ruleData.VatCode == VatCodeEnum.StandardVATRate && ruleData.VatAmount1 == ruleData.VatAmount2,
                MessageList = new List<string>()
            };

            AddMessages(result);
            return result;
        }

        private RuleResult CreateNoDataRuleResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { Constants.NoData }
            };
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add(Constants.VatCalculationFromServiceDateRuleValidation);
        }

    }
}
