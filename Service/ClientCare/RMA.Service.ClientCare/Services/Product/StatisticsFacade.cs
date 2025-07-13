using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Product
{
    public class StatisticsFacade : RemotingStatelessService, IStatisticsService
    {
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<product_Product> _productRepository;

        public StatisticsFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_Benefit> benefitRepository,
            IRepository<product_Product> productRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _benefitRepository = benefitRepository;
            _productRepository = productRepository;
        }

        public async Task<List<Statistics>> GetPolicyManagerStatistics()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var statistics = new List<Statistics> { await GetBenefitStatistics(), await GetProductStatistics() };

                return statistics;
            }
        }

        private async Task<Statistics> GetBenefitStatistics()
        {
            var statistic = new Statistics
            {
                Name = "Benefits",
                Count = _benefitRepository.Count()
            };
            var yesterday = DateTimeHelper.SaNow.AddHours(-24);

            statistic.ItemsFromLastDay = await _benefitRepository
                .Where(policy => policy.ModifiedDate > yesterday)
                .Select(detail => new StatisticDetail
                {
                    Name = detail.Name,
                    ModifiedDate = detail.ModifiedDate,
                    ModifiedBy = detail.ModifiedBy
                }).ToListAsync();

            return statistic;
        }

        private async Task<Statistics> GetProductStatistics()
        {
            var statistic = new Statistics
            {
                Name = "Products",
                Count = _productRepository.Count()
            };
            var yesterday = DateTimeHelper.SaNow.AddHours(-24);

            statistic.ItemsFromLastDay = await _productRepository
                .Where(policy => policy.ModifiedDate > yesterday)
                .Select(detail => new StatisticDetail
                {
                    Name = detail.Name,
                    ModifiedDate = detail.ModifiedDate,
                    ModifiedBy = detail.ModifiedBy
                }).ToListAsync();

            return statistic;
        }
    }
}