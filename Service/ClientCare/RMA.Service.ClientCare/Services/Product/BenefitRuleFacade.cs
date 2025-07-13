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
    public class BenefitRuleFacade : RemotingStatelessService, IBenefitRuleService
    {
        private readonly IRepository<product_BenefitRule> _benefitRuleRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        public BenefitRuleFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_BenefitRule> benefitRuleRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _benefitRuleRepository = benefitRuleRepository;
        }

        public async Task<List<RuleItem>> GetBenefitRules(int benefitId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _benefitRuleRepository
                    .Where(br => br.BenefitId == benefitId
                                 && !br.IsDeleted)
                    .Select(br => new RuleItem
                    {
                        Id = br.Id,
                        ItemId = br.BenefitId,
                        RuleId = br.RuleId,
                        IsDeleted = br.IsDeleted,
                        CreatedBy = br.CreatedBy,
                        CreatedDate = br.CreatedDate,
                        ModifiedBy = br.ModifiedBy,
                        ModifiedDate = br.ModifiedDate,
                        RuleConfiguration = br.RuleConfiguration
                    }).ToListAsync();
            }
        }

    }
}