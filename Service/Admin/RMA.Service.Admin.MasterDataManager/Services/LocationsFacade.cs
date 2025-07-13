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
    public class LocationsFacade : RemotingStatelessService, ILocationsService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_StateProvince> _stateProvinceRepository;
        private readonly IMapper _mapper;

        public LocationsFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_StateProvince> stateProvinceRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _stateProvinceRepository = stateProvinceRepository;
            _mapper = mapper;
        }

        public async Task<List<StateProvince>> GetLocations()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var locations = await _stateProvinceRepository
                    .Where(location => location.IsActive && !location.IsDeleted)
                    .OrderBy(location => location.Name)
                    .ProjectTo<StateProvince>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return locations;
            }
        }
    }
}