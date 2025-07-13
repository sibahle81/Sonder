using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.RuleTasks.MedicalInvoice.ICD10Code
{
    public class ICD10CodeRule : IRule
    {
        public const string RuleName = Constants.MedicalInvoiceClaimInjuryName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI07";
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
                throw new BusinessException("ICD10Code not captured on the invoice line to match with claim injury or preauth.");
            }
        }

        private RuleResult CreateResult(ICD10InjuryData icd10InjuryData)
        {
            bool ruleResult = false;
            List<string> resultMessage = new List<string>();

            for (var i = 0; i < icd10InjuryData.ICD10CodesToValidate.Count; i++)
            {
                foreach (var claimInjury in icd10InjuryData.ClaimInjuries)
                {
                    if (string.Equals(claimInjury.ICD10Code, icd10InjuryData.ICD10CodesToValidate[i].ICD10Code, StringComparison.OrdinalIgnoreCase))
                    {
                        ruleResult = true;
                    }
                    else
                    {
                        resultMessage.Add(i + "-ICD10Code (" + icd10InjuryData.ICD10CodesToValidate[i].ICD10Code + ") is not matching with claim injury.");
                    }
                }
            }

            if (!ruleResult && icd10InjuryData.PreAuthICD10Codes != null)
            {
                for (var i = 0; i < icd10InjuryData.ICD10CodesToValidate.Count; i++)
                {
                    foreach (var preAuthICD10Code in icd10InjuryData.PreAuthICD10Codes)
                    {
                        if (preAuthICD10Code.ICD10Code == icd10InjuryData.ICD10CodesToValidate[i].ICD10Code)
                        {
                            ruleResult = true;
                        }
                        else
                        {
                            resultMessage.Add(i + "-ICD10Code (" + icd10InjuryData.ICD10CodesToValidate[i].ICD10Code + ") is not matching with preauth icd10 code.");
                        }
                    }
                }
            }
            else if ((icd10InjuryData.ClaimInjuries == null || (icd10InjuryData.ClaimInjuries != null && icd10InjuryData.ClaimInjuries.Count == 0)) &&
                (icd10InjuryData.PreAuthICD10Codes == null || (icd10InjuryData.PreAuthICD10Codes != null && icd10InjuryData.PreAuthICD10Codes.Count == 0)))
            {
                resultMessage.Add("Neither claim injury nor preauth icd10 code found to match with the invoice injury.");
            }

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
            if (!result.Passed)
                result.MessageList.Add(Constants.MedicalInvoiceClaimInjuryPreAuthICD10CodeMessage);
        }
    }
}
