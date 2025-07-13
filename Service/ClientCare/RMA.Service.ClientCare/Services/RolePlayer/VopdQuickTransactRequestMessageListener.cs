using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using ServiceFabric.Remoting.CustomHeaders;

using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class VopdQuickTransactRequestMessageListener : ServiceBusQueueStatelessService<VopdQuickTransactRequestMessage>, IVopdQuickTransactRequestMessageListener
    {
        private readonly IUserService _userService;
        private readonly IRolePlayerService _rolePlayerService;
        public const string QueueName = "mcc.vopd.quicktransact";
        public VopdQuickTransactRequestMessageListener(
            StatelessServiceContext serviceContext,
            IUserService userService,
            IRolePlayerService rolePlayerService
        ) : base(serviceContext, QueueName)
        {
            _userService = userService;
            _rolePlayerService = rolePlayerService;
        }


        public override async Task ReceiveMessageAsync(VopdQuickTransactRequestMessage vopdQuickTransactRequestMessage, CancellationToken cancellationToken)
        {
            Contract.Requires(vopdQuickTransactRequestMessage != null);

            foreach (var idNumber in vopdQuickTransactRequestMessage.IdNumbers)
            {
                _ = await _rolePlayerService.UserPlayerVopdRequest(idNumber).ConfigureAwait(false);
            }

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
