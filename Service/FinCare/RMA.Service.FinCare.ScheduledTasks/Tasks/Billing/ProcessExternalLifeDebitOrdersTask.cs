using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Billing
{
    public class ProcessExternalLifeDebitOrdersTask : IScheduledTaskHandler
    {
        private readonly ICollectionService _collectionService;

        public ProcessExternalLifeDebitOrdersTask(ICollectionService collectionService)
        {
            _collectionService = collectionService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _collectionService.DoExternalLifeCollectionReconcilations();

            return true;
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
