using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class PeriodFacade : RemotingStatelessService, IPeriodService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Period> _periodRepository;
        private readonly IMapper _mapper;

        public PeriodFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_Period> periodRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _periodRepository = periodRepository;
            _mapper = mapper;
        }

        public async Task<Period> GetCurrentPeriod()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var period = await _periodRepository.Where(c => c.Status == "Current").FirstOrDefaultAsync();
                return _mapper.Map<Period>(period);
            }
        }

        public async Task<Period> GetLatestPeriod()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var period = await _periodRepository.Where(c => c.Status == "Latest").FirstOrDefaultAsync();
                return _mapper.Map<Period>(period);
            }
        }

        public async Task<Period> GetPeriod(DateTime transactionDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var period = await _periodRepository.Where(c => c.StartDate >= transactionDate && transactionDate.Month == c.StartDate.Month && transactionDate.Year == c.StartDate.Year).FirstOrDefaultAsync();
                return _mapper.Map<Period>(period);
            }
        }

        public async Task<Period> GetPeriodByDate(DateTime transactionDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var period = await _periodRepository.Where(c => c.StartDate <= transactionDate /*&& transactionDate <= c.EndDate*/
                && transactionDate.Month == c.StartDate.Month && transactionDate.Year == c.StartDate.Year).FirstOrDefaultAsync();
                return _mapper.Map<Period>(period);
            }
        }

        public async Task<List<Period>> GetPeriods()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var periods = await _periodRepository
                    .ProjectTo<Period>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return periods;
            }
        }

        public async Task<Period> GetPeriodById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var period = await _periodRepository
                    .ProjectTo<Period>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id,
                        $"Could not find period with id {id}");

                return period;
            }
        }

        public async Task<int> AddPeriod(Period period)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_Period>(period);
                entity.StartDate = entity.StartDate.ToSaDateTime();
                entity.EndDate = entity.EndDate.ToSaDateTime();
                _periodRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task EditPeriod(Period period)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_Period>(period);
                entity.StartDate = entity.StartDate.ToSaDateTime();
                entity.EndDate = entity.EndDate.ToSaDateTime();
                _periodRepository.Update(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task RemovePeriod(int id)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _periodRepository.Delete(d => d.Id == id);
                await scope.SaveChangesAsync();
            }
        }

        public async Task<int> GenerateBillingPeriods()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var count = await _periodRepository.SqlQueryAsync<int>("[billing].[CreateBillingPeriods]");
                return count[0];
            }
        }

        public async Task<bool> CanAutoRollBillingPeriods()
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var currentPeriodStatusDescription = PeriodStatusEnum.Current.GetDescription();
                    var currentPeriod = await _periodRepository.FirstOrDefaultAsync(p => p.Status.Equals(currentPeriodStatusDescription));
                    if (currentPeriod == null)
                    {
                        throw new BusinessException("Current period not set.");
                    }

                    var nextPeriod = await _periodRepository.FirstOrDefaultAsync(p => p.Id > currentPeriod.Id);
                    if (nextPeriod == null)
                    {
                        throw new BusinessException("Next period after Current period not set.");
                    }

                    DateTime todaysDate = DateTime.Now.StartOfTheDay();
                    var lastDayOfMonth = DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month);
                    DateTime lastDateOfCurrentMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, lastDayOfMonth);

                    if (todaysDate >= nextPeriod.StartDate && nextPeriod.EndDate <= lastDateOfCurrentMonth && nextPeriod.Status == PeriodStatusEnum.Future.GetDescription())
                    {
                        return true;
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when checking if Period Can Auto Roll - Error Message {ex.Message}");
                throw;
            }

        }

        public async Task<int> RollBillingPeriods(bool runPeriodConcurrently)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var currentPeriod = await _periodRepository.FirstOrDefaultAsync(p => p.Status == "Current");
                    if (currentPeriod == null)
                    {
                        throw new BusinessException("Current period not set.");
                    }

                    var nextPeriod = await _periodRepository.FirstOrDefaultAsync(p => p.Id > currentPeriod.Id);
                    if (nextPeriod == null)
                    {
                        throw new BusinessException("Next period after Current period not set.");
                    }

                    if (runPeriodConcurrently)
                    {
                        nextPeriod.Status = "Latest";
                        nextPeriod.ModifiedDate = DateTimeHelper.SaNow;
                        nextPeriod.ModifiedBy = RmaIdentity.UsernameOrBlank;
                    }
                    else
                    {
                        currentPeriod.Status = "History";
                        currentPeriod.ModifiedDate = DateTimeHelper.SaNow;
                        currentPeriod.ModifiedBy = RmaIdentity.UsernameOrBlank;

                        nextPeriod.Status = "Current";
                        nextPeriod.ModifiedDate = DateTimeHelper.SaNow;
                        nextPeriod.ModifiedBy = RmaIdentity.UsernameOrBlank;
                    }

                    return await scope.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Opening Period - Error Message {ex.Message}");
                throw;
            }
        }

        public async Task<Period> GetPeriodByYearAndMonth(int year, int month)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var start = new DateTime(year, month, 1);
                var end = start.AddMonths(1);

                var period = await _periodRepository.FirstOrDefaultAsync(s => s.StartDate >= start && s.StartDate < end);
                return period != null ? _mapper.Map<Period>(period) : null;
            }
        }
    }
}