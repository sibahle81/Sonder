using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.RuleTasks.Benefit.MaxDisabledAge
{
    public class MaxDisabledAge : RuleBase, IRule
    {
        public const string RuleName = "Max Disabled Age (Years)";

        public override string Name { get; } = RuleName;
        public string Code { get; } = "PBEN05";
        public string Version { get; } = "1.0";

        RuleResult IRule.Execute(IRuleContext context)
        {
            var rolePlayer = context.Deserialize<RolePlayer>(context.Data);
            var metaData = context.Deserialize<List<IntegerMetaData>>(context.ConfigurableData);
            if (metaData != null && metaData.Count > 0)
            {
                var date = rolePlayer.JoinDate.HasValue && rolePlayer.JoinDate.Value > DateTime.MinValue ? rolePlayer.JoinDate.Value : DateTime.Today;
                var age = GetAgeAt(rolePlayer.Person.DateOfBirth, date);
                if (rolePlayer.Person.IsDisabled && age > metaData[0].fieldValue)
                {
                    return GetRuleResult(false, $"At {age}, {rolePlayer.DisplayName} is older than the maximum disabled age of {metaData[0].fieldValue}");
                }
            }
            return GetRuleResult(true);
        }
    }
}
