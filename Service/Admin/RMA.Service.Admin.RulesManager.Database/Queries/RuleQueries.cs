using RMA.Service.Admin.RulesManager.Database.Entities;

using System.Linq;

namespace RMA.Service.Admin.RulesManager.Database.Queries
{
    public static class RuleQueries
    {
        public static IQueryable<rules_Rule> Search(this IQueryable<rules_Rule> rules, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return rules;
            }

            return rules.Where(rule => rule.Name.Contains(query)
                                       || rule.Description.Contains(query)
                                       || rule.Code.Contains(query));
        }

        public static IQueryable<rules_Rule> ActiveConfigurable(this IQueryable<rules_Rule> rules)
        {
            return rules.Where(rule => rule.IsConfigurable && rule.IsActive);
        }
    }
}
