using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class PrimeRateFacade : RemotingStatelessService, IPrimeRateService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_PrimeRate> _primeRateRepository;
        private readonly IMapper _mapper;

        public PrimeRateFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_PrimeRate> primeRateRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _primeRateRepository = primeRateRepository;
            _mapper = mapper;
        }

        public async Task<PrimeRate> GetLatestPrimeRate()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rates = await _primeRateRepository
                    .ProjectTo<PrimeRate>(_mapper.ConfigurationProvider)
                    .Where(x => x.IsActive && !x.IsDeleted)
                    .OrderByDescending(primeRate => primeRate.Id).FirstOrDefaultAsync();
                return rates;
            }
        }

        public async Task<List<PrimeRate>> GetAllPrimeRates()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rates = await _primeRateRepository
                    .ProjectTo<PrimeRate>(_mapper.ConfigurationProvider)
                    .Where(x => x.IsActive && !x.IsDeleted)
                    .OrderByDescending(primeRate => primeRate.Id).ToListAsync();
                return rates;
            }
        }

        public async Task<int> AddPrimeRate(PrimeRate primeRate)
        {
            Contract.Requires(primeRate != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                //edit previous prime rate

                var latestPrimeRate = await this.GetLatestPrimeRate();

                var previousEntity = await _primeRateRepository.FirstOrDefaultAsync(x => x.Id == latestPrimeRate.Id);
                previousEntity.EndDate = primeRate.StartDate.ToSaDateTime();
                previousEntity.ModifiedDate = DateTimeHelper.SaNow;
                previousEntity.ModifiedBy = RmaIdentity.UsernameOrBlank;
                _primeRateRepository.Update(previousEntity);

                //save new primerate 
                var entity = _mapper.Map<common_PrimeRate>(primeRate);
                entity.StartDate = entity.StartDate.ToSaDateTime();
                entity.EndDate = entity.EndDate.ToSaDateTime();
                entity.IsActive = true;

                entity.ModifiedDate = DateTimeHelper.SaNow;
                entity.ModifiedBy = RmaIdentity.UsernameOrBlank;

                _primeRateRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                return entity.Id;
            }
        }

    }
}