//using RMA.Common.Exceptions;
//using RMA.Common.Extensions;
//using RMA.Common.Security;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using ServiceFabric.Remoting.CustomHeaders;
using System;
using System.Linq;
using System.Threading.Tasks;
//using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;


namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class GenerateMissingPolicySchedules : IScheduledTaskHandler
    {
        private readonly IGeneratePolicyDocumentService _generatePolicyDocumentService;
        private readonly IPolicyService _policyService;

        public GenerateMissingPolicySchedules(IGeneratePolicyDocumentService generatePolicyDocumentService, IPolicyService policyService)
        {
            _generatePolicyDocumentService = generatePolicyDocumentService;
            _policyService = policyService;
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

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var policyIds = await _policyService.GetMissingPolicySchedules();
            int results = 0;

            foreach (var policyId in policyIds)
            {
                var policyModel = await _policyService.GetPolicy(policyId);
                if (policyModel != null)
                {
                        await _generatePolicyDocumentService.CreatePolicyShedulesOnly(policyModel);
                        results++;
                }
            }
            return results > 0;
        }
    }
}
