using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class QLinkMonthlyPremiumQueueListener : ServiceBusSubscriptionStatelessService<QLinkMonthlyPremiumReferenceMessage>, IQLinkMonthlyPremiumQueueListener
    {
        private readonly IUserService _userService;
        private readonly IBillingService _billingService;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly IConfigurationService _configurationService;
        public QLinkMonthlyPremiumQueueListener(
          StatelessServiceContext serviceContext,
          IConfigurationService configurationService,
          IUserService userService,
          IBillingService billingService,
          IServiceBusMessage serviceBusMessage
      ) : base(serviceContext,
          GetTopic(configurationService),
          GetSubscription(configurationService),
          GetConnectionString(configurationService)
      )

        {
            _userService = userService;
            _billingService = billingService;
            _serviceBusMessage = serviceBusMessage;
            _configurationService = configurationService;

        }
        private static string GetConnectionString(IConfigurationService configurationService)
        {
            if (configurationService != null)
            {
                return GetSetting(configurationService, SystemSettings.QLinkSubscriptionServiceBusReceiveConnectionString);
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
                return GetSetting(configurationService, SystemSettings.QLinkSubscriptionServiceBusReceiveSubscription);
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
                return GetSetting(configurationService, SystemSettings.QLinkSubscriptionServiceBusReceiveTopic);
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
        public override async Task ReceiveMessageAsync(QLinkMonthlyPremiumReferenceMessage message, CancellationToken cancellationToken)
        {
            var pauseQLinkMonthlyPremiumQueueListener = await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.PauseQLinkMonthlyPremiumQueueListener);

            if (pauseQLinkMonthlyPremiumQueueListener)
            {
                return;
            }

            Contract.Requires(message != null);
            Contract.Requires(message.QlinkMonthlyStatementReference != null);
            Contract.Requires(message.QlinkMonthlyStatementReference.ClaimCheckReference != null);

            try
            {
                if (message != null)
                {
                    await ImpersonateUser(message.ImpersonateUser);

                    var statementStaged = await _billingService.CheckStagePaymentRecordsAreStagedAsync(message.QlinkMonthlyStatementReference.ClaimCheckReference);

                    if (statementStaged)
                    {
                        return;
                    }

                    var messageType = new MessageType
                    {
                        MessageBody = JsonConvert.SerializeObject(message.QlinkMonthlyStatementReference.ClaimCheckReference),
                        From = "Craig MS",
                        To = "Mcc",
                        MessageTaskType = "00007",
                        Environment = "QLink",
                        EnqueuedTime = DateTime.Now,
                    };
                    await _serviceBusMessage.AddServiceBusMessage(messageType);
                    //import Qlink items to the database
                    _ = await _billingService.ImportQLinkPremiumTransactionsAsync(message.QlinkMonthlyStatementReference.ClaimCheckReference);

                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

        }

        protected override async Task ImpersonateUser(string username)
        {
            try
            {
                // This process should not affect message processing
                var userInfo = await _userService.GetUserImpersonationInfo(!string.IsNullOrEmpty(username)
                    ? username
                    : SystemSettings.SystemUserAccount);
                userInfo.SetRemotingContext();

                if (string.IsNullOrEmpty(username))
                {
                    // Lets insert the supermagic claim here because we impersonated the system user
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
