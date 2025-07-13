using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Product
{
    public class ProductOptionRuleFacade : RemotingStatelessService, IProductOptionRuleService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<product_ProductOptionRule> _productOptionRuleRepository;
        private readonly IRuleService _ruleService;

        public ProductOptionRuleFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_ProductOptionRule> productOptionRuleRepository, IRuleService ruleService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _productOptionRuleRepository = productOptionRuleRepository;
            _ruleService = ruleService;
        }

        public async Task<List<RuleItem>> GetProductOptionRules(int productOptionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _productOptionRuleRepository
                    .Where(productOptionRule => productOptionRule.ProductOptionId == productOptionId
                                               && !productOptionRule.IsDeleted)
                    .Select(product => new RuleItem
                    {
                        Id = product.Id,
                        ItemId = product.ProductOptionId,
                        RuleId = product.RuleId,
                        IsDeleted = product.IsDeleted,
                        CreatedBy = product.CreatedBy,
                        CreatedDate = product.CreatedDate,
                        ModifiedBy = product.ModifiedBy,
                        ModifiedDate = product.ModifiedDate,
                        RuleConfiguration = product.RuleConfiguration
                    }).ToListAsync();
            }
        }

        public async Task<RuleItem> GetProductOptionRuleByCode(int productOptionId, string ruleCode)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var ruleData = await _ruleService.GetRuleByCode(ruleCode);

                return await _productOptionRuleRepository
                    .Where(productOptionRule => productOptionRule.ProductOptionId == productOptionId
                                               && !productOptionRule.IsDeleted && productOptionRule.RuleId == ruleData.Id)
                    .Select(product => new RuleItem
                    {
                        Id = product.Id,
                        ItemId = product.ProductOptionId,
                        RuleId = product.RuleId,
                        IsDeleted = product.IsDeleted,
                        CreatedBy = product.CreatedBy,
                        CreatedDate = product.CreatedDate,
                        ModifiedBy = product.ModifiedBy,
                        ModifiedDate = product.ModifiedDate,
                        RuleConfiguration = product.RuleConfiguration
                    }).FirstOrDefaultAsync();
            }
        }

    }
}