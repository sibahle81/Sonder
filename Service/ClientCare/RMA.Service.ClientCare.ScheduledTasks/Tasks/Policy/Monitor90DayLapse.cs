﻿using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Threading.Tasks;


namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class Monitor90DayLapse : IScheduledTaskHandler
    {
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;

        public Monitor90DayLapse(IRolePlayerPolicyService rolePlayerPolicyService)
        {
            _rolePlayerPolicyService = rolePlayerPolicyService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _rolePlayerPolicyService.Monitor90DayLapse();
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

