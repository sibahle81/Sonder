using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Broker
{
    public class FspeImportMessageListener : ServiceBusSubscriptionStatelessService<RootFSPEResponseReference>, IFspeImportMessageListener
    {
        private readonly IBrokerageService _brokerageService;
        private readonly IUserService _userService;
        private readonly IServiceBusMessage _serviceBusMessage;

        public FspeImportMessageListener(
            StatelessServiceContext serviceContext,
            IBrokerageService brokerageService,
            IConfigurationService configurationService,
            IUserService userService,
            IServiceBusMessage serviceBusMessage
        ) : base(serviceContext,
            GetTopic(configurationService),
            GetSubscription(configurationService),
            GetConnectionString(configurationService)
        )
        {
            _brokerageService = brokerageService;
            _userService = userService;
            _serviceBusMessage = serviceBusMessage;
        }

        private static string GetConnectionString(IConfigurationService configurationService)
        {
            if (configurationService != null)
            {
                return GetSetting(configurationService, SystemSettings.FSPESubscriptionServiceBusConnectionString);
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
                return GetSetting(configurationService, SystemSettings.FSPESubscriptionServiceBusSubscription);
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
                return GetSetting(configurationService, SystemSettings.FSPESubscriptionServiceBusTopic);
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

        public override async Task ReceiveMessageAsync(RootFSPEResponseReference response, CancellationToken cancellationToken)
        {
            var messageType = new MessageType
            {
                MessageBody = response?.FSPEResponse?.ClaimCheckReference,
                From = "Astute Fsp Import",
                To = "Mcc",
                MessageTaskType = "00008",
                Environment = "Astute Fsp Import",
                EnqueuedTime = DateTime.Now,
            };
            await _serviceBusMessage.AddServiceBusMessage(messageType);

            await _brokerageService.ProcessFSPDataImportResponse(response?.FSPEResponse?.ClaimCheckReference);
        }

        protected override async Task ImpersonateUser(string username)
        {
            try
            {
                // This process should not affect message processing
                var userInfo = await _userService.GetUserImpersonationInfo(username);
                userInfo.SetRemotingContext();

                // Lets insert the supermagic claim here because we impersonated the system user
                RemotingContext.SetData($"{RemotingContext.Keys.Count() + 1}_permission", "SuperMagicSecretClaim");
            }
            catch (TechnicalException ex)
            {
                ex.LogException();
            }
        }
    }
}
