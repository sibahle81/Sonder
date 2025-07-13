using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class IndustryFacade : RemotingStatelessService, IIndustryService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Industry> _industryRepository;
        private readonly IMapper _mapper;

        public IndustryFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_Industry> industryRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _industryRepository = industryRepository;
            _mapper = mapper;
        }

        public async Task<List<Industry>> GetIndustries()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var industries = await _industryRepository
                    .OrderBy(industry => industry.Name)
                    .ProjectTo<Industry>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return industries;
            }
        }

        public async Task<Industry> GetIndustry(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var industry = await _industryRepository
                    .ProjectTo<Industry>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id, $"Could not find industry with id {id}.");
                return industry;
            }
        }

        public async Task<List<Industry>> GetIndustriesByIndustryClassId(IndustryClassEnum industryClass)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var industries = await _industryRepository
                    .Where(industry => industry.IndustryClass == industryClass)
                    .OrderBy(industry => industry.Name)
                    .ProjectTo<Industry>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return industries;
            }
        }
    }
}