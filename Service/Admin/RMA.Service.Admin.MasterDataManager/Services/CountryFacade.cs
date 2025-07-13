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
    public class CountryFacade : RemotingStatelessService, ICountryService
    {
        private readonly IRepository<common_Country> _countryRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public CountryFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_Country> countryRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _countryRepository = countryRepository;
            _mapper = mapper;
        }

        public async Task<List<Country>> GetCountries()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var countries = await _countryRepository
                    .Where(country => country.IsActive)
                    .OrderBy(country => country.Name)
                    .ProjectTo<Country>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return countries;
            }
        }

        public async Task<Country> GetCountryById(int countryId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var dataCountry = await _countryRepository
                    .ProjectTo<Country>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == countryId, $"Could not find country with id {countryId}");

                return dataCountry;
            }
        }

        public async Task<Country> GetCountryByName(string name)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var country = await _countryRepository
                    .ProjectTo<Country>(_mapper.ConfigurationProvider)
                    .SingleAsync(c => c.IsActive && c.Name == name,
                        $"Could not find country with name {name}");
                return country;
            }
        }
    }
}