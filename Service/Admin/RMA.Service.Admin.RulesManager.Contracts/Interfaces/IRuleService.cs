using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.Contracts.Interfaces
{
    public interface IRuleService : IService
    {
        Task<List<Rule>> Get();
        Task<Rule> GetById(int id);

        Task<Rule> GetRuleByName(string query);

        Task<Rule> GetRule(int id);
        Task<List<Rule>> GetRules(bool isActive, bool isDeleted);
        Task<List<Rule>> GetRulesByIds(List<int> ids);
        Task<PagedRequestResult<Rule>> SearchRulesPaged(PagedRequest request);
        Task<int> AddRule(Rule rule);
        Task EditRule(Rule rule);
        Task<List<Rule>> GetRulesWithExeuctionFilter(string executionFilter);
        Task<List<Rule>> GetRulesWithNoFilter();
        Task<List<Rule>> GetRulesByTypes(List<int> ruleTypeIds);
        Task<Rule> GetRuleByCode(string code);
    }
}