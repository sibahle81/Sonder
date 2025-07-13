using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using ServiceFabric.Remoting.CustomHeaders;

using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class SmsStatusRequestMessageListener : ServiceBusSubscriptionStatelessService<SmsStatusRequestReferenceMessage>, ISmsStatusRequestMessageListener
    {
        private readonly IUserService _userService;
        private readonly ISendSmsService _sendSmsService;

        public SmsStatusRequestMessageListener(
            StatelessServiceContext serviceContext,
            IConfigurationService configurationService,
            IUserService userService,
            ISendSmsService sendSmsService

        ) : base(serviceContext,
            GetTopic(configurationService),
            GetSubscription(configurationService),
            GetConnectionString(configurationService)
        )
        {
            _userService = userService;
            _sendSmsService = sendSmsService;
        }

        private static string GetConnectionString(IConfigurationService configurationService)
        {
            if (configurationService != null)
            {
                return GetSetting(configurationService, SystemSettings.SmsStatusSubscriptionServiceBusReceiveConnectionString);
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
                return GetSetting(configurationService, SystemSettings.SmsStatusSubscriptionServiceBusReceiveSubscription);
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
                return GetSetting(configurationService, SystemSettings.SmsStatusSubscriptionServiceBusReceiveTopic);
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

        public override async Task ReceiveMessageAsync(SmsStatusRequestReferenceMessage smsStatusRequestReferenceMessage, CancellationToken cancellationToken)
        {
            Contract.Requires(smsStatusRequestReferenceMessage != null);

            var smsAuditDetail = new SmsAuditDetail
            {
                RegistrationDate = smsStatusRequestReferenceMessage.RegistrationDate,
                StatusReportDate = smsStatusRequestReferenceMessage.StatusReportDate,
                SmsNumber = smsStatusRequestReferenceMessage.SmsNumber,
                SmsReference = smsStatusRequestReferenceMessage.SmsReference,
                Status = smsStatusRequestReferenceMessage.Status,
                StatusDescription = smsStatusRequestReferenceMessage.StatusDescription,
                ErrorDescription = smsStatusRequestReferenceMessage.ErrorDescription,
                Operator = smsStatusRequestReferenceMessage.Operator,
                Campaign = smsStatusRequestReferenceMessage.Campaign,
                Department = smsStatusRequestReferenceMessage.Department,
                UserName = smsStatusRequestReferenceMessage.UserName
            };

            await _sendSmsService.AddSmsStatusAuditDetail(smsAuditDetail).ConfigureAwait(false);
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
