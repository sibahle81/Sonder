using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimCommunicationListener : ServiceBusQueueStatelessService<ClaimCommunicationMessage>, IClaimCommunicationListener
    {
        private readonly IClaimCommunicationService _claimCommunicationService;

        public const string QueueName = "mcc.clm.emailcomms";

        public ClaimCommunicationListener(StatelessServiceContext serviceContext,
            IClaimCommunicationService claimCommunicationService)
            : base(serviceContext, QueueName)
        {
            _claimCommunicationService = claimCommunicationService;
        }

        public override async Task ReceiveMessageAsync(ClaimCommunicationMessage message, CancellationToken cancellationToken)
        {
            Contract.Requires(message != null);

            await _claimCommunicationService.ProccessCommunicationNotification(message);
        }

        protected override async Task ImpersonateUser(string username)
        {

        }
    }
}
