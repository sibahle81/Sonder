using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;
using RMA.Service.Integrations.Contracts.Entities.Hyphen;
using RMA.Service.Integrations.Contracts.Interfaces.Hyphen;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Services.Hyphen
{
    public class HyphenAccountVerificationResponseListener : ServiceBusSubscriptionStatelessService<RootHyphenVerificationBankResponse>, IHyphenAccountVerificationResponseListener
    {
        private readonly IHyphenAccountVerificationService _bankAccountVerificationService;
        private readonly IBankVerificationResponseProcessorService _bankVerificationResponseProcessorService;
        private readonly IUserService _userService;

        public HyphenAccountVerificationResponseListener(StatelessServiceContext serviceContext,
            IHyphenAccountVerificationService bankAccountVerificationService,
            IUserService userService,
            IBankVerificationResponseProcessorService bankVerificationResponseProcessorService
        ) : base(serviceContext,
            GetTopicName(),
            GetSubscriptionName(),
            Environment.GetEnvironmentVariable("IntegrationsSBConnectionString")
            )
        {
            _bankAccountVerificationService = bankAccountVerificationService;
            _userService = userService;
            _bankVerificationResponseProcessorService = bankVerificationResponseProcessorService;
        }

        private static string GetSubscriptionName()
        {
            return $"{GetTopicName()}.{Environment.GetEnvironmentVariable("EnvName").Replace(".", "")}.mcc";
        }

        private static string GetTopicName()
        {
            return Environment.GetEnvironmentVariable("EnvName").IndexOf("prod", StringComparison.OrdinalIgnoreCase) >= 0
                ? "prod.bankavs"
                : "qa.bankavs";
        }

        public override async Task ReceiveMessageAsync(RootHyphenVerificationBankResponse message,
            CancellationToken cancellationToken)
        {
            await ImpersonateUser(SystemSettings.SystemUserAccount);

            await _bankVerificationResponseProcessorService.UpdateBankAccountVerification(message);
        }

        protected override async Task ImpersonateUser(string username)
        {
            try
            {
                // This process should not affect message processing
                var userInfo = await _userService.GetUserImpersonationInfo(username);
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