using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.RuleTasks.ProductOption.RSACitizensOnly
{
    public class RSACitizensOnly : RuleBase, IRule
    {
        public const string RuleName = "RSA Citizens Only";

        public override string Name { get; } = RuleName;
        public string Code { get; } = "POPT02";
        public string Version { get; } = "1.0";

        RuleResult IRule.Execute(IRuleContext context)
        {
            var data = context.Deserialize<Case>(context.Data);
            if (data.MainMember.Person.IdType != IdTypeEnum.SAIDDocument)
            {
                AddErrorMessage("Main member is not an SA citizen");
            }
            CheckCitizens("Spouse", data.Spouse);
            CheckCitizens("Child", data.Children);
            CheckCitizens("Family member", data.ExtendedFamily);
            return GetRuleResult();
        }

        private void CheckCitizens(string desc, List<RolePlayer> members)
        {
            if (members == null) return;
            foreach (var member in members)
            {
                if (member.Person != null && member.Person.IdType != IdTypeEnum.SAIDDocument)
                {
                    AddErrorMessage($"{desc} {member.DisplayName} is not an SA citizen");
                }
            }
        }
    }
}
