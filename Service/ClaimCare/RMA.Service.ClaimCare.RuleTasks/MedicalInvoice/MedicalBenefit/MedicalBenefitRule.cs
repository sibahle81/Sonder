using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.MedicalInvoice.MedicalBenefit
{
    public class MedicalBenefitRule : IRule
    {
        public const string RuleName = Constants.MedicalBenefitRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI10";
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

                var ruleData = ruleDataList.FirstOrDefault();

                if (ruleData != null)
                {
                    /* Remove after Medical Benefits are added on the Claim - start */
                    ruleData.MedicalBenefitExists = true;
                    /* Remove after Medical Benefits are added on the Claim - end */

                    ValidateRuleData(ruleData.MedicalBenefitExists);
                    return CreateResult(ruleData.MedicalBenefitExists);
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

        private void ValidateRuleData(bool ruleData)
        {
            if (!ruleData)
            {
                throw new BusinessException("Medical benefit validaion failed");
            }
        }

        private RuleResult CreateResult(bool ruleData)
        {
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = ruleData,
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
                MessageList = new List<string> { "No data was supplied" }
            };
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add("Medical benefit does not exist");
        }
    }
}
