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
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class CauseOfDeathFacade : RemotingStatelessService, ICauseOfDeathService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_CauseOfDeathType> _causeOfDeathRepository;
        private readonly IMapper _mapper;

        public CauseOfDeathFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<common_CauseOfDeathType> causeOfDeathRepository
            , IMapper mapper

        )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _causeOfDeathRepository = causeOfDeathRepository;
            _mapper = mapper;
        }

        public async Task<List<CauseOfDeathType>> GetCauseOfDeathList(int typeOfDeathId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _causeOfDeathRepository
                    .Where(causeOfDeath => (int)causeOfDeath.DeathType == typeOfDeathId)
                    .ProjectTo<CauseOfDeathType>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return data;
            }
        }

        public async Task<CauseOfDeathType> GetCauseOfDeathById(int typeOfDeathId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _causeOfDeathRepository
                    .Where(causeOfDeath => (int)causeOfDeath.DeathType == typeOfDeathId)
                    .SingleAsync();

                return _mapper.Map<CauseOfDeathType>(data);
            }
        }
    }
}