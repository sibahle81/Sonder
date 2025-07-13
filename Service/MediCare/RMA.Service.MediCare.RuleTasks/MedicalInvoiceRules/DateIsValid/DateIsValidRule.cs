using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.DateIsValid
{
    public class DateIsValidRule : IRule
    {
        public const string RuleName = Constants.DateIsValidRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI31";
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
                    return CreateResult(ruleData);
                }

                return CreateNoDataRuleResult();
            }
            catch (ArgumentNullException ex)
            {
                ex.LogException();
                return CreateNoDataRuleResult();
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
            var formats = new[] { "dd/MM/yyyy HH:mm:ss", "dd-MM-yyyy HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "yyyy/MM/dd HH:mm:ss" };
            var result = new RuleResult
            {
                RuleName = Constants.DateIsValidRuleName,
                MessageList = new List<string>()
            };

            var overallResult = true;

            if (ruleData.InvoiceDate != null)
            {
                result.Passed = DateTime.TryParseExact(ruleData.InvoiceDate.ToString(), formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var invoiceDateIsValid);
                if (!result.Passed)
                {
                    AddMessages(result, $" Invoice {Constants.DateRuleIsValidValidation}");
                    overallResult = false;
                }
            }
            if (ruleData.TreatmentFromDate != null)
            {
                result.Passed = (DateTime.TryParseExact(ruleData.TreatmentFromDate.ToString(), formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var treatmentFromDateIsValid));
                if (!result.Passed)
                {
                    result.MessageList.Add($" TreatmentFrom {Constants.DateRuleIsValidValidation}");
                    overallResult = false;
                }
            }
            if (ruleData.TreatmentToDate != null)
            {
                result.Passed = (DateTime.TryParseExact(ruleData.TreatmentToDate.ToString(), formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var treatmentToDateIsValid));
                if (!result.Passed)
                {
                    result.MessageList.Add($" TreatmentTo {Constants.DateRuleIsValidValidation}");
                    overallResult = false;
                }
            }
            if (ruleData.SubmittedDate != null)
            {
                result.Passed = (DateTime.TryParseExact(ruleData.SubmittedDate.ToString(), formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var submittedDateIsValid));
                if (!result.Passed)
                {
                    result.MessageList.Add($" Submitted {Constants.DateRuleIsValidValidation}");
                    overallResult = false;
                }
            }
            if (ruleData.ReceivedDate != null)
            {
                result.Passed = (DateTime.TryParseExact(ruleData.ReceivedDate.ToString(), formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var receivedDateIsValid));
                if (!result.Passed)
                {
                    result.MessageList.Add($" Received {Constants.DateRuleIsValidValidation}");
                    overallResult = false;
                }
            }
            result.Passed = overallResult;

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

        private static void AddMessages(RuleResult result, string message)
        {
            if (!result.Passed)
                result.MessageList.Add(message);
        }
    }
}
