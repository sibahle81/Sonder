using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Entities;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.ScheduledTaskManager.Services
{
    public class ScheduledTaskFacade : RemotingStatelessService, IScheduledTaskService
    {
        #region Private Member Variables

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<scheduledTask_ScheduledTask> _scheduleTaskRepository;
        private readonly IRepository<scheduledTask_ScheduledTaskType> _scheduleTaskTypeRepository;
        private readonly IMapper _mapper;

        #endregion

        #region Constructor

        public ScheduledTaskFacade(StatelessServiceContext context, IDbContextScopeFactory dbContextScopeFactory,
            IRepository<scheduledTask_ScheduledTaskType> scheduleTaskTypeRepository,
            IRepository<scheduledTask_ScheduledTask> scheduleTaskRepository, 
            IMapper mapper)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _scheduleTaskRepository = scheduleTaskRepository;
            _scheduleTaskTypeRepository = scheduleTaskTypeRepository;
            _mapper = mapper;
        }

        #endregion

        public async Task<List<ScheduledTask>> ScheduledTasks()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var scheduledTasks = await _scheduleTaskRepository.Include(m => m.ScheduledTaskType)
                    .Where(x => x.ScheduledTaskId > 0)
                    .ProjectTo<ScheduledTask>(_mapper.ConfigurationProvider).ToListAsync();

                return _mapper.Map<List<ScheduledTask>>(scheduledTasks);
            }
        }

        public async Task<ScheduledTask> GetScheduledTask(int scheduleTaskId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var retrieved = await _scheduleTaskRepository.Include(m => m.ScheduledTaskType).SingleOrDefaultAsync(e => e.ScheduledTaskId == scheduleTaskId);

                if (retrieved != null)
                {
                    var scheduledTask = await _scheduleTaskRepository.Include(m => m.ScheduledTaskType).SingleOrDefaultAsync(e => e.ScheduledTaskId == scheduleTaskId);

                    if (scheduledTask != null)
                    {
                        var outScheduledTaskName = _mapper.Map<scheduledTask_ScheduledTask, ScheduledTask>(scheduledTask);

                        return outScheduledTaskName;
                    }
                }

                return _mapper.Map<scheduledTask_ScheduledTask, ScheduledTask>(retrieved);
            }
        }

        public async Task<bool> RetryScheduledTask(ScheduledTask scheduledTask)
        {
            Contract.Requires(scheduledTask != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (scheduledTask.ScheduledDate <= DateTime.Now && scheduledTask.NumberOfRetriesRemaining == 0)
                {
                    scheduledTask.NumberOfRetriesRemaining = 1;
                    var scheduled = _mapper.Map<ScheduledTask, scheduledTask_ScheduledTask>(scheduledTask);
                    _scheduleTaskRepository.Update(scheduled);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    //TO DO: Mike N Send notification to System Administrators as this task will not be executed further

                    return true;
                }
                return false;
            }
        }

        public async Task EditScheduledTask(ScheduledTask scheduledTask)
        {
            Contract.Requires(scheduledTask != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<scheduledTask_ScheduledTask>(scheduledTask);
                entity.TaskScheduleFrequency = scheduledTask.TaskScheduleFrequency;
                entity.ScheduledTaskType.IsEnabled = scheduledTask.ScheduledTaskType.IsEnabled;
                entity.ScheduledTaskType.NumberOfRetriesRemaining = scheduledTask.ScheduledTaskType.NumberOfRetriesRemaining;
                _scheduleTaskRepository.Update(entity);
                _scheduleTaskTypeRepository.Update(entity.ScheduledTaskType);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task<bool> DisableScheduledTask(int scheduleTaskId, bool scheduledTaskDisabled)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var retrieved = await _scheduleTaskRepository.FindByIdAsync(scheduleTaskId);
                if (scheduledTaskDisabled)
                {
                    retrieved.HostName = "Disabled";
                    _scheduleTaskRepository.Update(retrieved);
                }
                else
                {
                    retrieved.HostName = string.Empty;
                    _scheduleTaskRepository.Update(retrieved);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }


        public async Task<bool> ResetToCurrentDateAndTime(int scheduleTaskId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var scheduledTask = await _scheduleTaskRepository.SingleOrDefaultAsync(e => e.ScheduledTaskId == scheduleTaskId);

                if (scheduledTask != null)
                {
                    scheduledTask.ScheduledDate = DateTimeHelper.SaNow;
                    scheduledTask.NumberOfRetriesRemaining = 10;
                    scheduledTask.HostName = null;
                    scheduledTask.LastStatus = ScheduledTaskStatusEnum.Success.GetDescription();
                    _scheduleTaskRepository.Update(scheduledTask);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            return true;
        }



        public async Task<bool> RescheduleScheduledTask(ScheduledTask scheduledTask)
        {
            Contract.Requires(scheduledTask != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _scheduleTaskRepository.FirstOrDefault(a => a.ScheduledTaskId == scheduledTask.ScheduledTaskId);
                if (entity != null)
                {
                    entity.ScheduledDate = scheduledTask.ScheduledDate;
                    _scheduleTaskRepository.Update(entity);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                    return true;
                }
                else
                {
                    return false;
                }

            }
        }
    }
}
