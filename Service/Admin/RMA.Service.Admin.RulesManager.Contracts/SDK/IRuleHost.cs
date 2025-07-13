using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.Contracts.SDK
{
    public interface IRuleHost
    {
        Task<List<RuleResult>> Execute(RuleRequest request);
        Task<List<RuleResult>> ExecuteRules(RuleRequest request);
        Task<List<RuleMetadata>> GetAvailableRules();
    }
}
