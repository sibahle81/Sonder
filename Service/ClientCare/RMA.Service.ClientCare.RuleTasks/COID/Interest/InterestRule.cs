using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

namespace RMA.Service.ClientCare.RuleTasks.COID.Interest
{
    //[Export(typeof(IRule))]
    //[ExportMetadata("Name", "Interest")]
    //[ExportMetadata("ConfigurationFileName", "Rules.ClientCare.Interest.dll.config")]
    //[ExportMetadata("Version", "1.0")]
    //[ExportMetadata("Code", "BUR14")]
    public class InterestRule : IRule
    {
        public const string RuleName = "Interest";
        public string Name { get; } = RuleName;
        public string Code { get; } = "BUR14";
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