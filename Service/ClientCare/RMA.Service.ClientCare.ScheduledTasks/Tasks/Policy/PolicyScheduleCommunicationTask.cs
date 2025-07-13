using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;


namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class PolicyScheduleCommunicationTask : IScheduledTaskHandler
    {       
        private readonly IPolicyIntegrationService _policyIntegrationService;
        public PolicyScheduleCommunicationTask(IPolicyIntegrationService policyIntegrationService)
        {
            _policyIntegrationService= policyIntegrationService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _policyIntegrationService.ProcessPolicyScheduleEmailQueue();
            return true;
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
