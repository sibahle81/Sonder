using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClientCare.RuleTasks.ProductOption.TotalCoverAmount
{
    public class TotalCoverAmount : RuleBase, IRule
    {
        public const string RuleName = "Total Cover Amount";

        public override string Name { get; } = RuleName;
        public string Code { get; } = "POPT06";
        public string Version { get; } = "1.0";

        RuleResult IRule.Execute(IRuleContext context)
        {
            var data = context.Deserialize<Case>(context.Data);
            var metaData = context.Deserialize<List<DecimalMetaData>>(context.ConfigurableData);
            if (metaData != null && metaData.Count > 0)
            {
                return GetRuleResult(metaData[0], data);
            }
            return GetRuleResult(true);
        }

        private RuleResult GetRuleResult(DecimalMetaData rule, Case data)
        {
            var coverAmount = GetCoverAmount(data.MainMember);
            coverAmount += GetCoverAmount(data.Spouse);
            coverAmount += GetCoverAmount(data.Children);
            coverAmount += GetCoverAmount(data.ExtendedFamily);
            if (coverAmount > rule.fieldValue)
            {
                return GetRuleResult(false, $"{coverAmount:#,##0.00} exceeds total cover cap of {rule.fieldValue:#,##0.00}");
            }
            return GetRuleResult(true);
        }

        private static decimal GetCoverAmount(RolePlayer member)
        {
            var amount = 0.00M;
            if (member?.Benefits != null && member.Benefits.Count > 0)
            {
                amount += member.Benefits.Sum(b => b.BenefitRateLatest);
            }
            return amount;
        }

        private static decimal GetCoverAmount(List<RolePlayer> members)
        {
            var amount = 0.00M;
            if (members != null && members.Count > 0)
            {
                foreach (var member in members)
                {
                    if (member?.Benefits != null && member.Benefits.Count > 0)
                    {
                        amount += member.Benefits.Sum(b => b.BenefitRateLatest);
                    }
                }
            }
            return amount;
        }

    }
}
