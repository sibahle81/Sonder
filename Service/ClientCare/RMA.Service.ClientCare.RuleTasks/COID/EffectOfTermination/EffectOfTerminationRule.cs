using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

namespace RMA.Service.ClientCare.RuleTasks.COID.EffectOfTermination
{
    public class EffectOfTerminationRule : IRule
    {
        public const string RuleName = "Effect Of Termination";
        public string Name { get; } = RuleName;
        public string Code { get; } = "BUR04";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            bool result=false;
            if (context != null)
            {
                 result = context.Deserialize<bool>(context.Data);
            }
            return new RuleResult { Passed = result };
        }
    }
}