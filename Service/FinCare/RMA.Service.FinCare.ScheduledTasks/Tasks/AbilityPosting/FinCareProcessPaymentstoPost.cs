using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.AbilityPosting
{
    public class FinCareProcessPaymentstoPostTask : IScheduledTaskHandler
    {
        private readonly IAbilityPostingService _abilityPostingService;

        public FinCareProcessPaymentstoPostTask(IAbilityPostingService abilityPostingService)
        {
            _abilityPostingService = abilityPostingService;
        }

        public Task<bool> ExecuteTask(int scheduledTaskId)
        {
            Task.Run(() => _abilityPostingService.ProcessAbilityPostingItems()).ConfigureAwait(true);
            return Task.FromResult(true);
        }

        public bool CanCompleteTask => false;

        public Task CompleteTask(int detailsScheduledTaskId, bool success, TaskScheduleFrequencyEnum detailsTaskScheduleFrequency, TimeSpan executionDuration)
        {
            return Task.CompletedTask;
        }
        public Task DeleteTask(int detailsScheduledTaskId)
        {
            return Task.CompletedTask;
        }
    }
}
