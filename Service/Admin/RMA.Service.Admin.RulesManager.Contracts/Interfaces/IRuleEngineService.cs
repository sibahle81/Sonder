using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.Contracts.Interfaces
{
    public interface IRuleEngineService : IService
    {
        Task<RuleMetadata> GetRule(int ruleId);
        Task<RuleRequestResult> ExecuteRules(RuleRequest request);
        Task<List<string>> CalculateAllRuleNames(RuleRequest request);
    }
}