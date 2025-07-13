using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.SDK
{
    public class RuleHost : IRuleHost
    {
        public RuleHost()
        {
        }

        public async Task<List<RuleResult>> ExecuteRules(RuleRequest request)
        {
            return await Task.Run(() =>
            {
                var results = new List<RuleResult>();
                for (var i = 0; i < request.RuleItems.Count; i++)
                {
                    if (i < request.RuleNames.Count)
                    {
                        var ruleName = request.RuleNames[i];
                        try
                        {
                            var rule = CommonServiceLocator.ServiceLocator.Current.GetInstance<IRule>(ruleName);
                            if (rule != null)
                            {
                                var context = CommonServiceLocator.ServiceLocator.Current.GetInstance<IRuleContext>();
                                context.Data = request.Data;
                                context.ConfigurableData = request.RuleItems[i].RuleConfiguration;
                                var result = rule.Execute(context);
                                result.RuleName = ruleName;
                                results.Add(result);
                            }
                        }
                        catch (Exception ex)
                        {
                            results.Add(new RuleResult
                            {
                                RuleName = ruleName,
                                MessageList = new List<string> { $"An exception occured: {ex.Message}" }
                            });
                        }
                    }
                }
                return results;
            });
        }

        public async Task<List<RuleResult>> Execute(RuleRequest request)
        {
            return await Task.Run(() =>
            {
                var results = new List<RuleResult>();

                foreach (var ruleName in request.RuleNames)
                {
                    try
                    {
                        var rule = CommonServiceLocator.ServiceLocator.Current.GetInstance<IRule>(ruleName);
                        if (rule == null) throw new NotImplementedException();
                        var context = CommonServiceLocator.ServiceLocator.Current.GetInstance<IRuleContext>();
                        context.Data = request.Data;
                        var result = rule.Execute(context);
                        result.RuleName = ruleName;
                        results.Add(result);

                    }
                    catch (Exception ex)
                    {
                        results.Add(new RuleResult
                        {
                            RuleName = ruleName,
                            MessageList = new List<string> { $"An exception occured: {ex.Message}" }
                        });
                    }
                }

                return results;
            });
        }

        public async Task<List<RuleMetadata>> GetAvailableRules()
        {
            return await Task.Run(() =>
            {
                var rules = CommonServiceLocator.ServiceLocator.Current.GetAllInstances<IRule>();
                List<RuleMetadata> result = new List<RuleMetadata>();
                foreach (var rule in rules)
                {
                    result.Add(new RuleMetadata()
                    {
                        Name = rule.Name,
                        Code = rule.Code,
                        Version = rule.Version
                    });
                }

                return result;
            });
        }
    }
}