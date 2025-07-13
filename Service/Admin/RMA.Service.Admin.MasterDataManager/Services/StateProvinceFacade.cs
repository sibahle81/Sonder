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
    public class StateProvinceFacade : RemotingStatelessService, IStateProvinceService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_StateProvince> _stateProvinceRepository;
        private readonly IMapper _mapper;

        public StateProvinceFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_StateProvince> stateProvinceRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _stateProvinceRepository = stateProvinceRepository;
            _mapper = mapper;
        }

        public async Task<List<StateProvince>> GetStateProvinces()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var stateProvinces = await _stateProvinceRepository
                    .Where(stateProvince => stateProvince.IsActive && !stateProvince.IsDeleted)
                    .OrderBy(stateProvince => stateProvince.Name)
                    .ProjectTo<StateProvince>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return stateProvinces;
            }
        }

        public async Task<List<StateProvince>> GetStateProvincesByCountry(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var stateProvinces = await _stateProvinceRepository
                    .Where(stateProvince =>
                        stateProvince.CountryId == id && stateProvince.IsActive && !stateProvince.IsDeleted)
                    .OrderBy(stateProvince => stateProvince.Name)
                    .ProjectTo<StateProvince>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return stateProvinces;
            }
        }

        public async Task<StateProvince> GetStateProvinceByName(string name)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var stateProvince = await _stateProvinceRepository
                    .Where(ct => ct.IsActive && !ct.IsDeleted && ct.Name == name)
                    .ProjectTo<StateProvince>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Could not find state province with name {name}");

                return stateProvince;
            }
        }

        public async Task<StateProvince> GetStateProvinceById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var stateProvince = await _stateProvinceRepository
                    .Where(ct => ct.IsActive && !ct.IsDeleted && ct.Id == id)
                    .ProjectTo<StateProvince>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Could not find state province with id {id}");

                return stateProvince;
            }
        }
    }
}