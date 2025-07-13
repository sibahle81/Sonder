using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.Services
{
    public class RuleEngineFacade : RemotingStatelessService, IRuleEngineService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRuleHost _ruleHost;
        private readonly IRuleService _ruleService;
        private readonly IRepository<rules_Rule> _ruleRepository;
        private readonly IRepository<rules_Audit> _ruleAuditRepository;

        public RuleEngineFacade(StatelessServiceContext serviceContext,
            IRuleHost ruleHost,
            IRuleService ruleService,
            IRepository<rules_Rule> ruleRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<rules_Audit> ruleAuditRepository) : base(serviceContext)
        {
            _ruleHost = ruleHost;
            _ruleService = ruleService;
            _ruleRepository = ruleRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _ruleAuditRepository = ruleAuditRepository;
        }

        public async Task<RuleMetadata> GetRule(int ruleId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var ruleSelector = await _ruleRepository.Where(r => r.Id == ruleId).Select(r => r.Code).SingleAsync();
                var rules = await _ruleHost.GetAvailableRules();
                return rules.FirstOrDefault(s => s.Name == ruleSelector || s.Code == ruleSelector);
            }
        }

        private static void ValidateRequest(RuleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Data))
            {
                throw new BusinessException("'Data' cannot be empty");
            }
        }

        public async Task<RuleRequestResult> ExecuteRules(RuleRequest request)
        {
            Contract.Requires(request != null);
            var result = new RuleRequestResult();
            try
            {
                ValidateRequest(request);
                request.RuleNames = await CalculateAllRuleNames(request);
                if (request.RuleItems != null && request.RuleItems.Count > 0)
                {
                    result = new RuleRequestResult { RuleResults = await _ruleHost.ExecuteRules(request) };
                }
                else
                {
                    result = new RuleRequestResult { RuleResults = await _ruleHost.Execute(request) };
                }

                if (result.RuleResults.Count > 0)
                {
                    result.RequestId = AddRuleExecutionAudit(request, result.RuleResults);
                    result.OverallSuccess = result.RuleResults.TrueForAll(s => s.Passed);
                }
                else
                {
                    result.OverallSuccess = true;
                    if (request.RuleIds.Count > 0)
                    {
                        result.RuleResults = new List<RuleResult>()
                        {
                            new RuleResult
                            {
                                Passed = true,
                                RuleName = "No rules for filter",
                                MessageList = new List<string> {$"{request.RuleIds.Count} rules, but no rule to execute for execution filter '{request.ExecutionFilter}'"}
                            }
                        };
                    }

                }
                return result;
            }
            catch (Exception ex)
            {
                result.OverallSuccess = false;
                result.RuleResults = new List<RuleResult>()
                {
                    new RuleResult
                    {
                        Passed = true,
                        RuleName = "Rule Execution Error",
                        MessageList = new List<string> { ex.Message }
                    }
                };
                return result;
            }
        }

        public async Task<List<string>> CalculateAllRuleNames(RuleRequest request)
        {
            Contract.Requires(request != null);
            EnsureListProperties(request);
            List<Rule> rules;

            if (string.IsNullOrWhiteSpace(request.ExecutionFilter)
                || string.Compare(request.ExecutionFilter, "none", StringComparison.InvariantCultureIgnoreCase) == 0)
            {
                rules = await _ruleService.GetRulesWithNoFilter();
            }
            else
            {
                rules = await _ruleService.GetRulesWithExeuctionFilter(request.ExecutionFilter);
            }

            var ruleNames = new List<string>();

            foreach (var ruleName in request.RuleNames)
            {
                var rule = rules.FirstOrDefault(s => s.Name == ruleName);
                if (rule == null || ruleNames.Contains(rule.Name)) continue;
                var ruleItem = request.RuleItems.FirstOrDefault(r => r.RuleId == rule.Id);
                if (ruleItem == null && rule.IsConfigurable)
                {
                    request.RuleItems.Add(new Common.Entities.RuleItem { RuleId = rule.Id, RuleConfiguration = rule.ConfigurationMetaData });
                }
                ruleNames.Add(ruleName);
            }

            foreach (var ruleId in request.RuleIds)
            {
                var rule = rules.FirstOrDefault(s => s.Id == ruleId);
                if (rule == null || ruleNames.Contains(rule.Name)) continue;
                var ruleItem = request.RuleItems.FirstOrDefault(r => r.RuleId == rule.Id);
                if (ruleItem == null && rule.IsConfigurable)
                {
                    request.RuleItems.Add(new Common.Entities.RuleItem { RuleId = rule.Id, RuleConfiguration = rule.ConfigurationMetaData });
                }
                ruleNames.Add(rule.Name);
            }

            return ruleNames;
        }

        private static void EnsureListProperties(RuleRequest request)
        {
            if (request.RuleNames == null)
                request.RuleNames = new List<string>();

            if (request.RuleIds == null)
                request.RuleIds = new List<int>();

            if (request.RuleItems == null)
                request.RuleItems = new List<Common.Entities.RuleItem>();
        }

        private Guid AddRuleExecutionAudit(RuleRequest request, List<RuleResult> results)
        {
            var overallSuccess = results.TrueForAll(result => result.Passed);
            var requestJson = ConvertToJson(request);
            var resultJson = ConvertToJson(results);
            var requestId = Guid.NewGuid();

            using (var scope = _dbContextScopeFactory.Create())
            {
                _ruleAuditRepository.Create(new rules_Audit()
                {
                    RequestId = requestId,
                    Request = requestJson,
                    Response = resultJson,
                    OverallSuccess = overallSuccess,
                    RequestedBy = RmaIdentity.Username,
                    Timestamp = DateTimeHelper.SaNow
                });

                scope.SaveChanges();
                return requestId;
            }
        }

        private static string ConvertToJson(object value)
        {
            var json = JsonConvert.SerializeObject(value);
            return json;
        }
    }
}