using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

namespace RMA.Service.ClientCare.RuleTasks.COID.VariationCancellationWaiver
{
    public class VariationCancellationWaiverRule : IRule
    {
        public const string RuleName = "Variation Cancellation Waiver";
        public string Name { get; } = RuleName;
        public string Code { get; } = "BUR15";
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