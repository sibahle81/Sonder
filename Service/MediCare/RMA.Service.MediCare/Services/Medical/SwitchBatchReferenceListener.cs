using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class SwitchBatchReferenceListener : ServiceBusSubscriptionStatelessService<SwitchBatchReference>, ISwitchBatchReferenceListener
    {
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly IUserService _userService;
        private readonly IConfigurationService _configurationService;

        public SwitchBatchReferenceListener(StatelessServiceContext serviceContext,
            IServiceBusMessage serviceBusMessage,
            IConfigurationService configurationService,
            IUserService userService
            ) : base(serviceContext,
            GetTopic(configurationService),
            GetSubscription(configurationService),
            GetConnectionString(configurationService)
        )
        {
            _serviceBusMessage = serviceBusMessage;
            _userService = userService;
            _configurationService = configurationService;
        }

        public override async Task ReceiveMessageAsync(SwitchBatchReference switchBatchReference, CancellationToken cancellationToken)
        {
            Contract.Requires(switchBatchReference != null);

            try
            {
                var subscription = GetSetting(_configurationService, SystemSettings.SwitchBatchSubscriptionServiceBusSubscription);
                string[] values = subscription.Split('.');
                MessageType messageType = new MessageType()
                {
                    MessageId = switchBatchReference.MessageId,
                    From = values[3],
                    To = values[4],
                    Environment = values[0],
                    EnqueuedTime = DateTime.Now,
                    MessageTaskType = values[3],
                    MessageBody = switchBatchReference.BatchReference,
                    MessageProcessedTime = DateTime.Now
                };
                await _serviceBusMessage.AddServiceBusMessage(messageType);
            }
            catch (Exception ex)
            {
                ex.LogException($"SwitchBatchReferenceReceiveMessageAsync: BatchReference = {switchBatchReference.BatchReference} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
        }

        private static string GetConnectionString(IConfigurationService configurationService)
        {
            if (configurationService != null)
            {
                return GetSetting(configurationService, SystemSettings.SwitchBatchSubscriptionServiceBusConnectionString);
            }
            else
            {
                return string.Empty;
            }

        }

        private static string GetSubscription(IConfigurationService configurationService)
        {
            if (configurationService != null)
            {
                return GetSetting(configurationService, SystemSettings.SwitchBatchSubscriptionServiceBusSubscription);
            }
            else
            {
                return string.Empty;
            }
        }

        private static string GetTopic(IConfigurationService configurationService)
        {
            if (configurationService != null)
            {
                return GetSetting(configurationService, SystemSettings.SwitchBatchSubscriptionServiceBusTopic);
            }
            else
            {
                return string.Empty;
            }
        }

        private static string GetSetting(IConfigurationService configService, string settingsName)
        {
            return configService?.GetModuleSetting(settingsName)?.Result;
        }

        protected override async Task ImpersonateUser(string username)
        {
            try
            {
                var userInfo = await _userService.GetUserImpersonationInfo(!string.IsNullOrEmpty(username) ? username : SystemSettings.SystemUserAccount);
                userInfo.SetRemotingContext();

                if (string.IsNullOrEmpty(username))
                {
                    RemotingContext.SetData($"{RemotingContext.Keys.Count() + 1}_permission", "SuperMagicSecretClaim");
                }
            }
            catch (TechnicalException ex)
            {
                ex.LogException();
            }
        }
    }
}