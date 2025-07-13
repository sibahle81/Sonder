using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Product
{
    public class ProductRuleFacade : RemotingStatelessService, IProductRuleService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<product_ProductRule> _productRuleRepository;

        public ProductRuleFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_ProductRule> productRuleRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _productRuleRepository = productRuleRepository;
        }

        public async Task<List<RuleItem>> GetProductRules(int productId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productRules = await _productRuleRepository
                    .Where(productRule => productRule.ProductId == productId && !productRule.IsDeleted)
                    .Select(product => new RuleItem
                    {
                        Id = product.Id,
                        ItemId = product.ProductId,
                        RuleId = product.RuleId,
                        RuleConfiguration = product.RuleConfiguration,
                        IsDeleted = product.IsDeleted,
                        CreatedBy = product.CreatedBy,
                        CreatedDate = product.CreatedDate,
                        ModifiedBy = product.ModifiedBy,
                        ModifiedDate = product.ModifiedDate
                    }).ToListAsync();

                return productRules;
            }
        }
    }
}