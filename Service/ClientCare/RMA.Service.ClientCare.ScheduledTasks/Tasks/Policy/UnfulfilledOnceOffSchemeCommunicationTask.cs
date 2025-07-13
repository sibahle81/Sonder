using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class UnfulfilledOnceOffSchemeCommunicationTask
    {
        private readonly IPolicyDocumentService _policyDocumentService;
        public UnfulfilledOnceOffSchemeCommunicationTask(IPolicyDocumentService policyDocumentService)
        {
            _policyDocumentService = policyDocumentService;
        }
        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _policyDocumentService.SendUnfullfilledOnceOffSchemeCommunications();
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
