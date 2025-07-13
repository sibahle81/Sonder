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
    public class NatureOfBusinessFacade : RemotingStatelessService, INatureOfBusinessService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_NatureOfBusiness> _natureOfBusinessRepository;
        private readonly IMapper _mapper;

        public NatureOfBusinessFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_NatureOfBusiness> natureOfBusinessRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _natureOfBusinessRepository = natureOfBusinessRepository;
            _mapper = mapper;
        }

        public async Task<List<NatureOfBusiness>> GetNatureOfBusinesses()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var natureOfBusiness = await _natureOfBusinessRepository
                    .Where(natureOfBus => natureOfBus.IsActive && !natureOfBus.IsDeleted)
                    .OrderBy(natureOfBus => natureOfBus.SicCode)
                    .ProjectTo<NatureOfBusiness>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return natureOfBusiness;
            }
        }

        public async Task<List<NatureOfBusiness>> GetNatureOfBusinessesAuditLogLookUp()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var natureOfBusiness = await _natureOfBusinessRepository
                    .Where(natureOfBus => natureOfBus.IsActive && !natureOfBus.IsDeleted)
                    .OrderBy(natureOfBus => natureOfBus.SicCode)
                    .ProjectTo<NatureOfBusiness>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return natureOfBusiness;
            }
        }

        public async Task<NatureOfBusiness> GetNatureOfBusinessById(int natureOfBusinessId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var natureOfBusiness = await _natureOfBusinessRepository
                    .Where(natureOfBus =>
                        natureOfBus.IsActive && !natureOfBus.IsDeleted && natureOfBus.Id == natureOfBusinessId)
                    .ProjectTo<NatureOfBusiness>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Could not find nature of business with id '{natureOfBusinessId}'");

                return natureOfBusiness;
            }
        }

        public async Task<NatureOfBusiness> GetNatureOfBusinessByCode(string code)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var natureOfBusiness = await _natureOfBusinessRepository
                    .Where(natureOfBus => natureOfBus.IsActive && !natureOfBus.IsDeleted
                                          && natureOfBus.SicCode == code)
                    .ProjectTo<NatureOfBusiness>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Could not find nature of business with code '{code}'");

                return _mapper.Map<NatureOfBusiness>(natureOfBusiness);
            }
        }

        public async Task<string> GetNatureOfBusinessDescription(string code)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var natureOfBusinessDescription = await _natureOfBusinessRepository
                    .Where(natureOfBus => natureOfBus.IsActive && !natureOfBus.IsDeleted && natureOfBus.SicCode == code)
                    .Select(natureOfBus => natureOfBus.Description
                    ).SingleAsync();

                return natureOfBusinessDescription;
            }
        }
    }
}