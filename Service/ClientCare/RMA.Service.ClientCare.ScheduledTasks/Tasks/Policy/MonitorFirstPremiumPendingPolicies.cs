using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class MonitorFirstPremiumPendingPolicies : IScheduledTaskHandler
    {
        private readonly IPolicyService _policyService;

        public bool CanCompleteTask => false;

        public MonitorFirstPremiumPendingPolicies(IPolicyService policyService)
        {
            _policyService = policyService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var success = await _policyService.MonitorFirstPremiumPendingPolicies();
            return success;
        }

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
