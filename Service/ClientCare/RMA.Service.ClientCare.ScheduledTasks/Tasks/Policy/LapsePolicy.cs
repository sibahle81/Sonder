using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class LapsePolicy : IScheduledTaskHandler
    {
        private readonly IRolePlayerPolicyService rolePlayerService;

        public LapsePolicy(IRolePlayerPolicyService service)
        {
            rolePlayerService = service;
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
            var results = await rolePlayerService.MonitorPendingFirstPremiumPolicies("lapse scheduler");
            await rolePlayerService.MonitorPoliciesWithOnePremiumMissed();
            await rolePlayerService.MonitorPoliciesWithSecondPremiumMissed("lapse scheduler");
            await rolePlayerService.LapseTwoUnpaidPremiumsOverTwoYearPeriod("lapse scheduler");
            return results;
        }
    }
}