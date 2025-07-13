using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IProductRuleService : IService
    {
        Task<List<RuleItem>> GetProductRules(int productId);
    }
}