using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.SLAEscalation
{
    public class SLAEscalationTask : IScheduledTaskHandler
    {
        private readonly ISLAService _slaService;

        public SLAEscalationTask(ISLAService slaService)
        {
            _slaService = slaService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _slaService.EscalateOverdueSlas();
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

