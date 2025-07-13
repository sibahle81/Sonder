using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

namespace RMA.Service.ClientCare.RuleTasks.COID.EffectOfTerminationPremium
{
    //[Export(typeof(IRule))]
    //[ExportMetadata("Name", "Effect Of Termination Premium")]
    //[ExportMetadata("ConfigurationFileName", "Rules.ClientCare.EffectOfTerminationPremium.dll.config")]
    //[ExportMetadata("Version", "1.0")]
    //[ExportMetadata("Code", "BUR05")]
    public class EffectOfTerminationPremiumRule : IRule
    {
        public const string RuleName = "Effect Of Termination Premium";
        public string Name { get; } = RuleName;
        public string Code { get; } = "BUR05";
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