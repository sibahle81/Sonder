using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ICD10CodeMatch
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
                    return CreateResult(ruleData);
                }

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
        private RuleResult CreateResult(ICD10InjuryData icd10InjuryData)
        {
            bool ruleResult = false;
            List<string> resultMessage = new List<string>();
            string icd10Code, icd10Codes = "";

            if ((icd10InjuryData.ClaimInjuries == null || (icd10InjuryData.ClaimInjuries != null && icd10InjuryData.ClaimInjuries.Count == 0)) &&
                (icd10InjuryData.PreAuthICD10Codes == null || (icd10InjuryData.PreAuthICD10Codes != null && icd10InjuryData.PreAuthICD10Codes.Count == 0)))
            {
                resultMessage.Add("Neither claim injury nor preauth icd10 code found to match with the invoice injury.");
            }
            else
            {
                for (var i = 0; i < icd10InjuryData.ICD10CodesToValidate.Count; i++)
                {
                    icd10Code = icd10InjuryData.ICD10CodesToValidate[i].ICD10Code;
                    icd10Codes += icd10Code + " ";

                    if (!ruleResult && icd10InjuryData.ClaimInjuries != null)
                    {
                        foreach (var injury in icd10InjuryData.ClaimInjuries)
                        {
                            if (string.Equals(injury.ICD10Code, icd10Code, StringComparison.OrdinalIgnoreCase))
                            {
                                ruleResult = true;
                                break;
                            }
                        }

                        if (!ruleResult)
                        {
                            var primaryClaimInjuries = icd10InjuryData.ClaimInjuries.Where(p => p.IsPrimary);
                            foreach (var primaryInjury in primaryClaimInjuries)
                            {
                                if (primaryInjury.ICD10DiagnosticGroupCode == icd10InjuryData.ICD10CodesToValidate[i].ICD10DiagnosticGroupCode
                                    && primaryInjury.ICD10CategoryCode == icd10InjuryData.ICD10CodesToValidate[i].ICD10CategoryCode)
                                {
                                    ruleResult = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (!ruleResult && icd10InjuryData.PreAuthICD10Codes != null)
                    {
                        foreach (var preAuthICD10Code in icd10InjuryData.PreAuthICD10Codes)
                        {
                            if (string.Equals(preAuthICD10Code.ICD10Code, icd10Code, StringComparison.OrdinalIgnoreCase))
                            {
                                ruleResult = true;
                                break;
                            }
                        }
                    }

                    if (ruleResult)
                        break;
                }

                if (!ruleResult)
                {
                    resultMessage.Add("Supplied ICD10Codes (" + icd10Codes.Trim() + ") not matching with claim injury or preauth icd10 code.");
                }
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
