using RMA.Service.Admin.RulesManager.Contracts.Entities;

namespace RMA.Service.Admin.RulesManager.Contracts.SDK
{
    public interface IRule
    {
        RuleResult Execute(IRuleContext context);
        string Name { get; }
        string Code { get; }
        string Version { get; }
    }
}
