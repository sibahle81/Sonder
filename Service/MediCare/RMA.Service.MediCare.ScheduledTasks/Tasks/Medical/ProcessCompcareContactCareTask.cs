using Newtonsoft.Json;

using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.ScheduledTasks.Tasks.Medical
{
    public class ProcessCompcareContactCareTask : IScheduledTaskHandler
    {
        public bool CanCompleteTask => false;

        private readonly IUserReminderService _userReminderService;
        private readonly IConfigurationService _configurationService;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly ISerializerService _serializer;
        private readonly IUserService _userService;

        public ProcessCompcareContactCareTask(
            IUserReminderService userReminderService,
            IConfigurationService configurationService,
            ISerializerService serializer,
            IUserService userService,
            IServiceBusMessage serviceBusMessage)
        {
            _userReminderService = userReminderService;
            _configurationService = configurationService;
            _serviceBusMessage = serviceBusMessage;
            _serializer = serializer;
            _userService = userService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            try
            {
                var serviceBusMessages = await _serviceBusMessage.GetCompcareContactCareServiceBusMessages();

                if (serviceBusMessages?.Count > 0)
                {
                    var userReminders = new List<UserReminder>();

                    foreach (var serviceBusMessage in serviceBusMessages)
                    {
                        var messageBody = JsonConvert.DeserializeObject<ContactCareServiceBusMessages>(serviceBusMessage.MessageBody);

                        var assignByUser = await _userService.GetUserByEmail(messageBody.AssignedByUser);
                        var assignToUser = await _userService.GetUserByEmail(messageBody.AssignedToUser);

                        var userReminder = new UserReminder
                        {
                            AlertDateTime = DateTimeHelper.SaNow,
                            AssignedToUserId = assignToUser.Id,
                            AssignedByUserId = assignByUser.Id,
                            UserReminderType = UserReminderTypeEnum.Message,
                            Text = $"Message Ref:{messageBody.RefNumber} from:{messageBody.AssignedByUser} to {messageBody.AssignedToUser} Message: {messageBody.Text}",
                        };

                        userReminders.Add(userReminder);
                        serviceBusMessage.MessageProcessingStatusText = "Success";
                        await _serviceBusMessage.UpdateBusMessage(serviceBusMessage);
                    }

                    await _userReminderService.CreateUserReminders(userReminders);

                }
            }
            catch (Exception e)
            {
                e.LogException();
            }

            return true;
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
