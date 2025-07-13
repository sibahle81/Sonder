using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.RuleTasks.Benefit.MaximumEntryAge
{
    public class MaximumEntryAge : RuleBase, IRule
    {
        public const string RuleName = "Maximum Entry Age (Years)";

        public override string Name { get; } = RuleName;
        public string Code { get; } = "PBEN02";
        public string Version { get; } = "1.0";

        RuleResult IRule.Execute(IRuleContext context)
        {
            var rolePlayer = context.Deserialize<RolePlayer>(context.Data);
            var metaData = context.Deserialize<List<IntegerMetaData>>(context.ConfigurableData);
            if (metaData != null && metaData.Count > 0)
            {
                // For children the test date is the current date, for other members it is the 
                // policy join date. If the join date could not be found, it is the current date
                var testDate = GetTestDate(rolePlayer);
                // Subtract a year from the age, because age next birthday is used to 
                // determine if the member is eligible
                var age = GetAgeAt(rolePlayer.Person.DateOfBirth, testDate) - 1;
                if (age > metaData[0].fieldValue)
                {
                    return GetRuleResult(false, $"At {age}, {rolePlayer.DisplayName} is older than the maximum age of {metaData[0].fieldValue}");
                }
            }
            return GetRuleResult(true);
        }
    }
}
