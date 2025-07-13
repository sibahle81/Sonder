using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class EuropAssistPremiumMatrixFacade : RemotingStatelessService, IEuropAssistPremiumMatrixService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_EuropAssistPremiumMatrix> _europAssistPremiumMatrixRepository;
        private readonly IMapper _mapper;

        public EuropAssistPremiumMatrixFacade(StatelessServiceContext context,
          IDbContextScopeFactory dbContextScopeFactory,
          IRepository<common_EuropAssistPremiumMatrix> europAssistPremiumMatrixRepository,
          IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _europAssistPremiumMatrixRepository = europAssistPremiumMatrixRepository;
            _mapper = mapper;
        }

        public async Task<List<EuropAssistPremiumMatrix>> GetEuropAssistPremiumMatrices()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var europAssistPremiumMatrices = await _europAssistPremiumMatrixRepository
                    .ProjectTo<EuropAssistPremiumMatrix>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return europAssistPremiumMatrices;
            }
        }
    }
}
