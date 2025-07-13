using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClientCare.RuleTasks.ProductOption.NumberOfExtendedMembers
{
    public class NumberOfExtendedMembers : RuleBase, IRule
    {
        public const string RuleName = "Number Of Extended Members";

        public override string Name { get; } = RuleName;
        public string Code { get; } = "POPT09";
        public string Version { get; } = "1.0";

        RuleResult IRule.Execute(IRuleContext context)
        {
            var data = context.Deserialize<Case>(context.Data);
            var rules = context.Deserialize<List<IntegerMetaData>>(context.ConfigurableData);
            if (rules?.Count > 0)
            {
                var rule = rules[0];
                if (data.ExtendedFamily?.Count > 0)
                {
                    var members = data.ExtendedFamily.Count(m => !m.IsDeleted);
                    if (members > rule.fieldValue)
                    {
                        return GetRuleResult(false, $"Maximum number of {rule.fieldValue} extended family members exceeded.");
                    }
                }
            }
            else
            {
                return GetRuleResult(false, "The rule has not been configured.");
            }
            return GetRuleResult(true);
        }
    }
}
