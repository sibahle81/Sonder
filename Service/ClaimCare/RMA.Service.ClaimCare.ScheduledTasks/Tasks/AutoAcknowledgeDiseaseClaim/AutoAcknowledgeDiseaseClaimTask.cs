using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Threading.Tasks;


namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.AutoAcknowledgeDiseaseClaim
{
    public class AutoAcknowledgeDiseaseClaimTask : IScheduledTaskHandler
    {
        private readonly IDiseaseService _diseaseService;

        public AutoAcknowledgeDiseaseClaimTask(IDiseaseService diseaseService)
        {
            _diseaseService = diseaseService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _diseaseService.AutoAcknowledgeDiseaseClaim();

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
