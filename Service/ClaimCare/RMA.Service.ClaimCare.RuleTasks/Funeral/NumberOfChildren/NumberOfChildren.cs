using RMA.Common.Exceptions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.NumberOfChildren
{
    public class NumberOfChildren : IRule
    {
        public const string RuleName = "Number of Children";
        public string Name { get; } = RuleName;
        public string Code { get; } = "NUMCHILD";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                if (context == null)
                    throw new ArgumentNullException(nameof(context), "IRuleContext is null");

                var ruleData = context.Deserialize<RuleData>(context.Data);
                var metaData = context.Deserialize<List<MetaData>>(context.ConfigurableData);
                var result = ValidateInput(ruleData, metaData.FirstOrDefault());

                return result;
            }
            catch (ArgumentNullException)
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { "No data was supplied" }
                };
            }
            catch (Exception ex)
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { ex.Message }
                };
            }
        }

        private static RuleResult ValidateInput(RuleData ruleData, MetaData metaData)
        {
            var isValid = int.TryParse(metaData.fieldValue, out var maximumValue);

            if (!isValid)
            {
                throw new BusinessException(
                   $"Value {metaData.fieldValue} for field {metaData.fieldName} is invalid number value");
            }

            if (ruleData.NumberOfChildren > maximumValue)
            {
                throw new BusinessException(
                   $"The maximum number of children is {maximumValue}. Supplied value is {ruleData.NumberOfChildren}");
            }

            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = true,
                MessageList = new List<string>()
            };

            return result;
        }
    }
}
