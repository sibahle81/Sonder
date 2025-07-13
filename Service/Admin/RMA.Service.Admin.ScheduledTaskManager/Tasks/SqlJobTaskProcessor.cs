using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Admin.ScheduledTaskManager.Database.Entities;

using System;
using System.Threading.Tasks;

namespace RMA.Service.Admin.ScheduledTaskManager.Tasks
{
    public class SqlJobTaskProcessor : IScheduledTaskHandler
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        //Need to Replace bank Config. with SQL JOBS
        private readonly IRepository<scheduledTask_SqlJob> _sqlJobRepository;

        public SqlJobTaskProcessor(IDbContextScopeFactory dbContextScopeFactory, IRepository<scheduledTask_SqlJob> sqlJobRepository)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _sqlJobRepository = sqlJobRepository;
        }

        public bool CanCompleteTask => false;

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var sqlJob = await _sqlJobRepository.SingleOrDefaultAsync(s => s.ScheduledTaskId == scheduledTaskId);
                if (sqlJob == null)
                {
                    return false;
                }

                var procToExecute = sqlJob.SqlJobQueryText;
                await _sqlJobRepository.ExecuteSqlCommandAsync(procToExecute);
                return true;
            }
        }

        public Task CompleteTask(int scheduledTaskId, bool success, TaskScheduleFrequencyEnum frequency, TimeSpan executionDuration)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteTask(int scheduledTaskId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var sqlJob = await _sqlJobRepository.SingleOrDefaultAsync(s => s.ScheduledTaskId == scheduledTaskId);
                if (sqlJob != null)
                {
                    _sqlJobRepository.Delete(sqlJob);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }
    }
}
