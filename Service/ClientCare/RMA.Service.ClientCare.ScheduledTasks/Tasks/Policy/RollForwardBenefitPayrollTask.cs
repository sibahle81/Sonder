using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class RollForwardBenefitPayrollTask : IScheduledTaskHandler
    {
        private readonly IGroupRiskPolicyCaseService _policyService;

        public RollForwardBenefitPayrollTask(IGroupRiskPolicyCaseService service)
        {
            _policyService = service;
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
             var taskCompleted = await _policyService.RollForwardBenefitPayrolls(null);
             return taskCompleted;
        }
    }
}
