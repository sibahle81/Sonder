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
    public class PublicHolidayFacade : RemotingStatelessService, IPublicHolidayService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_PublicHoliday> _publicHolidayRepository;
        private readonly IMapper _mapper;

        public PublicHolidayFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_PublicHoliday> publicHolidayRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _publicHolidayRepository = publicHolidayRepository;
            _mapper = mapper;
        }

        public async Task<List<PublicHoliday>> GetPublicHolidays()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var publicHolidays = await _publicHolidayRepository
                    .ProjectTo<PublicHoliday>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return publicHolidays;
            }
        }

        public async Task<PublicHoliday> GetPublicHoliday(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var publicHoliday = await _publicHolidayRepository
                    .ProjectTo<PublicHoliday>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id,
                        $"Could not find public holiday with id {id}");

                return publicHoliday;
            }
        }

        public async Task<int> AddPublicHoliday(PublicHoliday publicHoliday)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_PublicHoliday>(publicHoliday);
                _publicHolidayRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task EditPublicHoliday(PublicHoliday publicHoliday)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_PublicHoliday>(publicHoliday);
                _publicHolidayRepository.Update(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task RemovePublicHoliday(int id)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _publicHolidayRepository.Delete(d => d.Id == id);
                await scope.SaveChangesAsync();
            }
        }
    }
}