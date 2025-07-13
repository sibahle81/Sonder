using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using ServiceFabric.Remoting.CustomHeaders;

using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class CfpOnboardingRequestMessageListener : ServiceBusSubscriptionStatelessService<PolicyRequestReferenceMessage>, ICfpOnboardingRequestMessageListener
    {
        private readonly IUserService _userService;
        private readonly IConsolidatedFuneralService _consolidatedFuneralService;
        public CfpOnboardingRequestMessageListener(
            StatelessServiceContext serviceContext,
            IConfigurationService configurationService,
            IUserService userService,
            IConsolidatedFuneralService consolidatedFuneralService
        ) : base(serviceContext,
            GetTopic(configurationService),
            GetSubscription(configurationService),
            GetConnectionString(configurationService)
        )
        {
            _userService = userService;
            _consolidatedFuneralService = consolidatedFuneralService;
        }

        private static string GetConnectionString(IConfigurationService configurationService)
        {
            if (configurationService != null)
            {
                return GetSetting(configurationService, SystemSettings.CfpSubscriptionServiceBusReceiveConnectionString);
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
                return GetSetting(configurationService, SystemSettings.CfpSubscriptionServiceBusReceiveSubscription);
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
                return GetSetting(configurationService, SystemSettings.CfpSubscriptionServiceBusReceiveTopic);
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

        public override async Task ReceiveMessageAsync(PolicyRequestReferenceMessage policyRequestReferenceMessage, CancellationToken cancellationToken)
        {
            _ = await _consolidatedFuneralService.ProcessPolicyRequestReferenceMessageAsync(policyRequestReferenceMessage);
        }

        protected override async Task ImpersonateUser(string username)
        {
            if (!string.IsNullOrEmpty(username))
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
}
