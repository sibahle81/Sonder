using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.RuleTasks.Benefit.MinimumEntryAge
{
    public class MinimumEntryAge : RuleBase, IRule
    {
        public const string RuleName = "Minimum Entry Age (Years)";

        public override string Name { get; } = RuleName;
        public string Code { get; } = "PBEN03";
        public string Version { get; } = "1.0";

        RuleResult IRule.Execute(IRuleContext context)
        {
            var rolePlayer = context.Deserialize<RolePlayer>(context.Data);
            var metaData = context.Deserialize<List<IntegerMetaData>>(context.ConfigurableData);
            if (metaData != null && metaData.Count > 0)
            {
                // Adjust minimum age to accommodate "age next birthday" requirement
                var minAge = metaData[0].fieldValue - 1;
                if (minAge > 0)
                {
                    var today = DateTime.Today;
                    var joinDate = rolePlayer.JoinDate.HasValue ? rolePlayer.JoinDate.Value.ToSaDateTime().Date : rolePlayer.Person.DateOfBirth.ToSaDateTime().Date;
                    var dateOfBirth = rolePlayer.Person.DateOfBirth.ToSaDateTime().Date;

                    var realAge = GetAgeAt(dateOfBirth, today);
                    var joinAge = GetAgeAt(dateOfBirth, joinDate);

                    if (realAge < minAge && joinAge < minAge)
                    {
                        return GetRuleResult(
                            false,
                            $"The real age {realAge} and join age {joinAge} of {rolePlayer.DisplayName}"
                            + $" are both younger than the minimum age of {metaData[0].fieldValue}");
                    }
                }
            }
            return GetRuleResult(true);
        }
    }
}
