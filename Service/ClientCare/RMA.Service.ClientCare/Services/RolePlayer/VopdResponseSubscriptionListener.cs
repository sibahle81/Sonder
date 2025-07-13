using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.Integrations.Contracts.Entities.Vopd;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class VopdResponseSubscriptionListener : ServiceBusSubscriptionStatelessService<VopdResponseMessage>, IVopdResponseSubscriptionListener
    {
        private readonly IUserService _userService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimService _claimService;
        public VopdResponseSubscriptionListener(StatelessServiceContext serviceContext,
            IUserService userService, IRolePlayerService rolePlayerService, IClaimService claimService) : base(serviceContext,
            GetTopicName(),
            GetSubscriptionName(),
            Environment.GetEnvironmentVariable("IntegrationsSBConnectionString")
        )
        {
            _userService = userService;
            _rolePlayerService = rolePlayerService;
            _claimService = claimService;
        }

        private static string GetSubscriptionName()
        {
            //e.g. qa.vopd.uat.mcc
            return $"{GetTopicName()}.{Environment.GetEnvironmentVariable("EnvName").Replace(".", "")}.mcc";
        }

        private static string GetTopicName()
        {
            //e.g. qa.vopd
            return Environment.GetEnvironmentVariable("EnvName").IndexOf("prod", StringComparison.OrdinalIgnoreCase) >= 0
                ? "prod.vopd"
                : "qa.vopd";
        }

        public override async Task ReceiveMessageAsync(VopdResponseMessage message, CancellationToken cancellationToken)
        {
            await ImpersonateUser(SystemSettings.SystemUserAccount);
            var userDetailId = await _rolePlayerService.UserVopdUpdate(message);
            var rolePlayerId = await _rolePlayerService.RolePlayerVopdUpdate(message);
            if (rolePlayerId != 0)
            {
                await _claimService.ProcessVOPDReponse(rolePlayerId);
                await _claimService.ProcessBeneficiaryVOPDResponse(rolePlayerId);
            }
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
