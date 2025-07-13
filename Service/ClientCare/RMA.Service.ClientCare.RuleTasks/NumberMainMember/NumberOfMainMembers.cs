using RMA.Common.Exceptions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClientCare.RuleTasks.NumberMainMember
{
    public class NumberOfMainMembers : IRule
    {
        public const string RuleName = "Number of Main Members";
        public string Name { get; } = RuleName;
        public string Code { get; } = "NUMMAIN";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                var ruleData = context?.Deserialize<RuleData>(context.Data);
                var metaData = context.Deserialize<List<StringMetaData>>(context.ConfigurableData);
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

        private static RuleResult ValidateInput(RuleData ruleData, StringMetaData metaData)
        {
            var isValid = int.TryParse(metaData.fieldValue, out var maximumValue);

            if (!isValid)
            {
                throw new BusinessException(
                   $"Value {metaData.fieldValue} for field {metaData.fieldName} is invalid number value");
            }

            if (ruleData.NumberOfMembers > maximumValue)
            {
                throw new BusinessException(
                   $"The maximum number of members is {maximumValue}. Supplied value is {ruleData.NumberOfMembers}");
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
