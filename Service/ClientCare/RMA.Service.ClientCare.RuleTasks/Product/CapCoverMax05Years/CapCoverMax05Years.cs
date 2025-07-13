using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.RuleTasks.Product.CapCoverMax05Years
{
    public class CapCoverMax05Years : CapCoverBase, IRule
    {
        public const string RuleName = "Cap Cover per Age Group (0 = 5)";

        public override string Name { get; } = RuleName;
        public string Code { get; } = "PROD02";
        public string Version { get; } = "1.0";

        RuleResult IRule.Execute(IRuleContext context)
        {
            var newCase = context.Deserialize<Case>(context.Data);
            var metaData = context.Deserialize<List<DecimalMetaData>>(context.ConfigurableData);
            if (metaData != null && metaData.Count > 0)
            {
                var value = Task.Run(
                    async () =>
                    {
                        var result = await ProcessRule(metaData[0], newCase);
                        return result;
                    }
                );
                return value?.Result;
            }
            return GetRuleResult();
        }

        private async Task<RuleResult> ProcessRule(DecimalMetaData rule, Case data)
        {
            //var policyId = GetPolicyId(data);

            await ProcessRule(rule, data.MainMember);
            await ProcessRule(rule, data.Spouse);
            await ProcessRule(rule, data.Children);
            await ProcessRule(rule, data.ExtendedFamily);
            return GetRuleResult();
        }

        private async Task ProcessRule(DecimalMetaData rule, List<RolePlayer> members)
        {
            if (members == null) return;
            foreach (var member in members)
            {
                await ProcessRule(rule, member);
            }
        }

        private async Task ProcessRule(DecimalMetaData rule, RolePlayer member)
        {
            if (member.Person != null && member.Benefits != null && member.Benefits.Count > 0)
            {
                var date = member.JoinDate.HasValue && member.JoinDate.Value > DateTime.MinValue ? member.JoinDate.Value : DateTime.Today;
                var age = GetAgeAt(member.Person.DateOfBirth, date);
                if (age <= 5)
                {
                    const decimal existingCover = 0;
                    var maxCoverAmount = rule.fieldValue;
                    var newCover = GetNewCoverAmount(member);
                    if (existingCover + newCover > maxCoverAmount)
                    {
                        var msg = $"Adding {newCover:N2} to existing cover of {existingCover:N2} will exceed cover cap of {maxCoverAmount:N2} for {member.DisplayName}";
                        AddErrorMessage(msg);
                    }
                }
            }
        }
    }
}
