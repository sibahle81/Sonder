using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfCorrectCodeSubmitted
{
    public class CheckIfCorrectCodeSubmittedRule : IRule
    {
        public const string RuleName = Constants.CheckIfCorrectCodeSubmittedValidRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "MI29";
        public string Version { get; } = "1.0";
        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                var ruleData = context?.Deserialize<RuleData>(context.Data);

                if (context == null || string.IsNullOrWhiteSpace(context.Data))
                    return CreateNoDataRuleResult();

                if (ruleData != null)
                {
                    return CreateResult(ruleData.InvoiceLineCorrectCodeSubmitted);
                }
                else
                {
                    return CreateNoDataRuleResult();
                }
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
                MessageList = new List<string> { Constants.NoData }
            };
        }
        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add(Constants.CheckIfCorrectCodeSubmittedValidation);
        }
    }
}