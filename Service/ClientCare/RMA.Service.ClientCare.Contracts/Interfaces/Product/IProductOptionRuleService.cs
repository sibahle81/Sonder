using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IProductOptionRuleService : IService
    {
        Task<List<RuleItem>> GetProductOptionRules(int productOptionId);
        Task<RuleItem> GetProductOptionRuleByCode(int productOptionId, string ruleCode);
    }
}