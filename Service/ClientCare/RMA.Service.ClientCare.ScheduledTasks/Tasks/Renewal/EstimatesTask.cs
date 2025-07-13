using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;

using System;
using System.Threading.Tasks;


namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Renewal
{
    public class EstimatesTask : IScheduledTaskHandler
    {
        private readonly IDeclarationService _declarationService;

        public EstimatesTask(IDeclarationService declarationService)
        {
            _declarationService = declarationService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            return await _declarationService.AddEstimatesForUndeclared();
        }

        public bool CanCompleteTask => false;

        public Task CompleteTask(int detailsScheduledTaskId, bool success,
            TaskScheduleFrequencyEnum detailsTaskScheduleFrequency, TimeSpan executionDuration)
        {
            return Task.CompletedTask;
        }

        public Task DeleteTask(int detailsScheduledTaskId)
        {
            return Task.CompletedTask;
        }
    }
}

