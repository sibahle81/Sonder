using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using QueryableExtensions = System.Data.Entity.QueryableExtensions;

namespace RMA.Service.Admin.RulesManager.Services
{
    public class RuleFacade : RemotingStatelessService, IRuleService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<rules_Rule> _ruleRepository;
        private readonly IMapper _mapper;

        public RuleFacade(StatelessServiceContext context, IDbContextScopeFactory dbContextScopeFactory,
            IRepository<rules_Rule> ruleRepository, IMapper mapper)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _ruleRepository = ruleRepository;
            _mapper = mapper;
        }

        public async Task<List<Rule>> Get()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rules = await _ruleRepository.Where(n => n.IsActive && !n.IsDeleted).ToListAsync();
                return _mapper.Map<List<Rule>>(rules);
            }
        }

        public async Task<Rule> GetById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await QueryableExtensions.SingleAsync(_ruleRepository
                    .Where(s => s.Id == id).ProjectTo<Rule>(_mapper.ConfigurationProvider));
                return result;
            }
        }

        public async Task<Rule> GetRuleByName(string query)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rules = await QueryableExtensions.SingleAsync(_ruleRepository.Where(rule =>
                            rule.IsConfigurable && rule.IsActive && !rule.IsDeleted
                            && (rule.Name == query
                             || rule.Description == query
                             || rule.Code == query))
                        .ProjectTo<Rule>(_mapper.ConfigurationProvider));
                return rules;
            }
        }

        public async Task<PagedRequestResult<Rule>> SearchRulesPaged(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rules = await _ruleRepository.Where(rule =>
                        rule.IsConfigurable && rule.IsActive && !rule.IsDeleted
                        && (rule.Name.Contains(request.SearchCriteria)
                         || rule.Description.Contains(request.SearchCriteria)
                         || rule.Code.Contains(request.SearchCriteria)))
                  .ToPagedResult<rules_Rule, Rule>(request, _mapper);
                return rules;
            }
        }

        public async Task<Rule> GetRule(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await QueryableExtensions.SingleAsync(_ruleRepository
                    .Where(s => s.Id == id)
                    .ProjectTo<Rule>(_mapper.ConfigurationProvider));
                return result;
            }
        }

        public async Task<List<Rule>> GetRules(bool isActive, bool isDeleted)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rules = await _ruleRepository.Where(n => n.IsActive && !n.IsDeleted).ToListAsync();
                return _mapper.Map<List<Rule>>(rules);
            }
        }

        public async Task<List<Rule>> GetRulesByIds(List<int> ids)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rules = await _ruleRepository.Where(n => ids.Contains(n.Id) && n.IsActive && !n.IsDeleted)
                    .ToListAsync();
                return _mapper.Map<List<Rule>>(rules);
            }
        }

        public async Task<int> AddRule(Rule rule)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<rules_Rule>(rule);
                _ruleRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task EditRule(Rule rule)
        {
            Contract.Requires(rule != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _ruleRepository.Where(n => n.Id == rule.Id).SingleAsync();

                result.IsActive = rule.IsActive;
                result.IsDeleted = rule.IsDeleted;
                result.ModifiedBy = rule.ModifiedBy;
                result.ModifiedDate = rule.ModifiedDate;
                result.RuleType = rule.RuleType;
                result.ConfigurationMetaData = rule.ConfigurationMetaData;
                result.IsConfigurable = rule.IsConfigurable;

                _ruleRepository.Update(result);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task<List<Rule>> GetRulesWithExeuctionFilter(string executionFilter)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (from rule in _ruleRepository
                                    where rule.ExecutionFilter == executionFilter && rule.IsActive && !rule.IsDeleted
                                    select rule)
                    .ToListAsync();

                return _mapper.Map<List<Rule>>(result);
            }
        }

        public async Task<List<Rule>> GetRulesWithNoFilter()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _ruleRepository.ProjectTo<Rule>(_mapper.ConfigurationProvider).ToListAsync();
                return result;
            }
        }

        public async Task<List<Rule>> GetRulesByTypes(List<int> ruleTypeIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rules = await _ruleRepository
                    .Where(n => ruleTypeIds.Contains((int)n.RuleType) && n.IsActive && !n.IsDeleted)
                    .ToListAsync();
                return _mapper.Map<List<Rule>>(rules);
            }
        }

        private static Rule ConvertCompactRule(Rule rule)
        {
            return new Rule
            {
                Id = rule.Id,
                Name = rule.Name
            };
        }

        public async Task<Rule> GetRuleByCode(string code)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _ruleRepository.Where(x => x.Code == code).FirstOrDefaultAsync();
                return new Rule
                {
                    Id = result.Id,
                    Name = result.Name,
                    Code = result.Code,
                    Description = result.Description,
                    ExecutionFilter = result.ExecutionFilter,
                    IsConfigurable = result.IsConfigurable,
                    ConfigurationMetaData = result.ConfigurationMetaData,
                    IsActive = result.IsActive,
                    RuleType = result.RuleType,
                    CreatedBy = result.CreatedBy,
                    CreatedDate = result.CreatedDate,
                    ModifiedBy = result.ModifiedBy,
                    ModifiedDate = result.ModifiedDate
                };
            }
        }
    }
}