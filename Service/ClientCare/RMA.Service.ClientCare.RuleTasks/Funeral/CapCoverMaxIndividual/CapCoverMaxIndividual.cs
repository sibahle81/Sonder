using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;
using RMA.Service.ClientCare.RuleTasks.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.RuleTasks.Funeral.CapCoverMaxIndividual
{
    public class CapCoverMaxIndividual : CapCoverBase, IRule
    {

        public const string RuleName = "Maximum Individual Cover";

        public override string Name { get; } = RuleName;
        public string Code { get; } = "FUNERAL01";
        public string Version { get; } = "1.0";

        RuleResult IRule.Execute(IRuleContext context)
        {
            var newCase = context.Deserialize<Case>(context.Data);
            var metaData = context.Deserialize<List<DecimalMetaData>>(context.ConfigurableData);
            if (metaData != null && metaData.Count > 0)
            {
                var value = Task.Run(
                     () =>
                    {
                        var result =  GetRuleResult(metaData[0], newCase);
                        return result;
                    }
                );
                return value?.Result;
            }
            return GetRuleResult(true);
        }

        private RuleResult GetRuleResult(DecimalMetaData rule, Case newCase)
        {
            var maxCoverAmount = rule.fieldValue > 0 ? rule.fieldValue : rule.defaultValue;
            List<RolePlayer> casePolicyMembers = new List<RolePlayer>();

            var policyId = 0;
            if (newCase.MainMember?.Policies?.Count > 0)
            {
                policyId = newCase.MainMember.Policies[0].PolicyId;
            }

            casePolicyMembers.Add(newCase.MainMember);
            foreach (var spouse in newCase.Spouse) casePolicyMembers.Add(spouse);
            foreach (var child in newCase.Children) casePolicyMembers.Add(child);
            foreach (var family in newCase.ExtendedFamily) casePolicyMembers.Add(family);

            foreach (var policyMember in casePolicyMembers)
            {
                const decimal existingCover = 0;
                var newCover = GetNewCoverAmount(policyMember);
                if (newCover + existingCover > maxCoverAmount)
                {
                    var msg = $"Policy member {policyMember.DisplayName}: Adding {newCover:N2} cover to existing cover of {existingCover:N2} will exceed cover cap of {maxCoverAmount:N2}";
                    return GetRuleResult(false, msg);
                }
            }
            return GetRuleResult(true);
        }
    }
}
