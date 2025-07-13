using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
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
    public class CityFacade : RemotingStatelessService, ICityService
    {
        private readonly IRepository<common_City> _cityRepository;


        private readonly IRepository<common_CityRetrieval> _commonCityRetrievalRepository;
        private readonly IRepository<common_PostalCode> _commonPostalCodeRepository;
        private readonly IRepository<common_RegionCode> _commonRegionCodeRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public CityFacade(IDbContextScopeFactory dbContextScopeFactory, StatelessServiceContext context,
            IRepository<common_City> cityRepository,
            IRepository<common_CityRetrieval> commonCityRetrievalRepository,
            IRepository<common_PostalCode> commonPostalCodeRepository,
            IRepository<common_RegionCode> commonRegionCodeRepository,
            IMapper mapper
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _cityRepository = cityRepository;
            _commonCityRetrievalRepository = commonCityRetrievalRepository;
            _commonPostalCodeRepository = commonPostalCodeRepository;
            _commonRegionCodeRepository = commonRegionCodeRepository;
            _mapper = mapper;
        }

        public async Task<List<City>> GetCities()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var cities = await _cityRepository
                    .Where(city => city.IsActive && !city.IsDeleted)
                    .OrderBy(city => city.Name)
                    .ProjectTo<City>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return cities;
            }
        }

        public async Task<List<City>> GetCityByProvince(int provinceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var cities = await _cityRepository
                    .Where(city => city.StateProvinceId == provinceId && city.IsActive && !city.IsDeleted)
                    .OrderBy(city => city.Name)
                    .ProjectTo<City>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return cities;
            }
        }

        public async Task<City> GetCityByName(string name)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var cities = await _cityRepository
                    .Where(c => c.IsActive && !c.IsDeleted && c.Name == name)
                    .SingleAsync();

                return _mapper.Map<City>(cities);
            }
        }

        public async Task<City> GetCityById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var cities = await _cityRepository
                    .Where(c => c.IsActive && !c.IsDeleted && c.Id == id)
                    .SingleAsync();

                return _mapper.Map<City>(cities);
            }
        }

        public async Task<PagedRequestResult<CityRetrieval>> SearchClientAddress(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (from cityRetrieval in _commonCityRetrievalRepository
                                    join postalCode in _commonPostalCodeRepository
                                        on new { CityId = (int?)cityRetrieval.CityId }
                                        equals new { CityId = postalCode.CityId }
                                    join region in _commonRegionCodeRepository
                                         on new { ForeignRegionCodeID = cityRetrieval.ForeignRegionCodeId }
                                          equals new { ForeignRegionCodeID = (int?)region.RegionCodeId }
                                    select new CityRetrieval
                                    {
                                        CityId = cityRetrieval.CityId, //city id
                                        City = cityRetrieval.Name,  //PTA North or SOWETO ON SEA
                                        Code = postalCode.StreetPostalCode, //Postal code
                                        Suburb = postalCode.Suburb, //ANNLIN EXT 6 or  ZWIDE
                                        Province = region.Name //Guateng

                                    }
                    ).Where(city => city.Suburb.Contains(request.SearchCriteria) || city.Code.Contains(request.SearchCriteria))
                    .OrderBy(city => city.Suburb)
                    .ToPagedResult(request);

                if (result.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<CityRetrieval>
                    {
                        Page = result.Page,
                        PageCount = result.PageCount,
                        RowCount = result.RowCount,
                        PageSize = result.PageSize,
                        Data = new List<CityRetrieval>()
                    };

                    foreach (var res in result.Data)
                    {
                        returnResult.Data.Add(res);
                    }

                    return returnResult;
                }

                return new PagedRequestResult<CityRetrieval>();
            }



        }
    }
}