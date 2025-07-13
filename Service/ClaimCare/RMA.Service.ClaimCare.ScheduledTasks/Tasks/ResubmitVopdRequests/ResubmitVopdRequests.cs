using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.ResubmitVopdRequests
{
    public class ResubmitVopdRequests : IScheduledTaskHandler
    {
        private readonly IAccidentService _accidentService;

        public ResubmitVopdRequests(IAccidentService accidentService)
        {
            _accidentService = accidentService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _accidentService.ResubmitVopdRequests();

            return await Task.FromResult(true);
        }

        public bool CanCompleteTask => true;

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

