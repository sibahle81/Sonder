using RMA.Common.Exceptions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.RuleTasks.MaximumFuneralChildAge
{
    public class ChildAgeLimit : IRule
    {
        public const string RuleName = "Maximum Funeral Child Age";
        public string Name { get; } = RuleName;
        public string Code { get; } = "FUNCHLDAGE";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                var ruleData = context?.Deserialize<RuleData>(context.Data);
                var metaData = context.Deserialize<List<StringMetaData>>(context.ConfigurableData);
                var result = ValidateAgeInput(ruleData, metaData);

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

        private static RuleResult ValidateAgeInput(RuleData ruleData, List<StringMetaData> metaData)
        {
            var isAge21Valid = int.TryParse(metaData[0].fieldValue, out var age21Value);
            var isAge24Valid = int.TryParse(metaData[1].fieldValue, out var age24Value);

            if (!isAge21Valid)
            {
                throw new InvalidCastException(
                   $"Value {metaData[0].fieldValue} for field {metaData[0].fieldName} is invalid number value");
            }

            if (!isAge24Valid)
            {
                throw new InvalidCastException(
                   $"Value {metaData[1].fieldValue} for field {metaData[1].fieldName} is invalid number value");
            }

            if (ruleData.childAge > age21Value)
            {
                if (ruleData.childAge < age24Value)
                {
                    if (!ruleData.isChildDependant)
                        throw new BusinessException($"Please provide evidence of dependence");
                }
                else
                {
                    throw new BusinessException($"The maximum age for funeral policy is {age21Value}. Supplied value is {ruleData.childAge}");
                }
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
