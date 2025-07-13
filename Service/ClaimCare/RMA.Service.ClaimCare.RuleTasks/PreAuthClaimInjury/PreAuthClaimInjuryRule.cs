using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.RuleTasks.PreAuthClaimInjury
{
    public class PreAuthClaimInjuryRule : IRule
    {
        public const string RuleName = Constants.PreAuthClaimInjuryName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "PAC11";
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

                var ruleData = JsonConvert.DeserializeObject<ICD10InjuryData>(context.Data);

                if (ruleData != null)
                {
                    ValidateRuleData(ruleData);
                    return CreateResult(ruleData);
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

        private RuleResult CreateNoDataRuleResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { "No data was supplied" }
            };
        }

        private void ValidateRuleData(ICD10InjuryData icd10InjuryData)
        {
            if (icd10InjuryData == null)
            {
                throw new BusinessException("ICD10Code not captured on the PreAuth to match with claim injury.");
            }
        }

        private RuleResult CreateResult(ICD10InjuryData icd10InjuryData)
        {
            bool ruleResult = false;
            List<string> resultMessage = new List<string>();

            foreach (var inputInjury in icd10InjuryData.ICD10CodesToValidate)
            {
                foreach (var claimInjury in icd10InjuryData.ClaimInjuries)
                {
                    if (claimInjury.ICD10CodeId == inputInjury.ICD10CodeId && claimInjury.BodySideId == inputInjury.BodySideId)
                    {
                        ruleResult = true;
                    }
                    else if (claimInjury.ICD10CodeId != inputInjury.ICD10CodeId && claimInjury.BodySideId != inputInjury.BodySideId)
                    {
                        resultMessage.Add(Constants.PreAuthClaimInjuryMessage);
                    }
                    else if (claimInjury.ICD10CodeId != inputInjury.ICD10CodeId)
                    {
                        resultMessage.Add("ICD10Code (" + inputInjury.ICD10Code + ") is not matching with claim injury.");
                    }
                    else if (claimInjury.BodySideId != inputInjury.BodySideId)
                    {
                        resultMessage.Add("Captured Bodyside is not matching with claim injury.");
                    }
                }
            }
            if (!ruleResult && resultMessage.Count <= 0 && icd10InjuryData.ClaimInjuries.Count <= 0)
                resultMessage.Add("No claim injury found to match.");

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = ruleResult,
                MessageList = resultMessage
            };

            AddMessages(result);
            return result;
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed && result.MessageList?.Count <= 0)
                result.MessageList.Add(Constants.PreAuthClaimInjuryMessage);
        }
    }
}
