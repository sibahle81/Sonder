using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class MonitorChildAge : IScheduledTaskHandler
    {
        private readonly IPolicyMonitoringService _policyMonitoringService;

        public MonitorChildAge(IPolicyMonitoringService service)
        {
            _policyMonitoringService = service;
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

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var results = await _policyMonitoringService.MonitorPremiumWaivedChildren();
            await _policyMonitoringService.MonitorChildAge();
            return results;
        }
    }
}