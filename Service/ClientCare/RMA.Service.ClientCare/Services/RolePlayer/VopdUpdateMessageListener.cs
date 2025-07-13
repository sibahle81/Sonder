using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class VopdUpdateMessageListener : ServiceBusQueueStatelessService<VopdUpdateResponse>, IVopdUpdateMessageListener
    {
        private readonly IRolePlayerService _rolePlayerService;
        public const string QueueName = "mcc.cda.vopdupdate";

        public VopdUpdateMessageListener(StatelessServiceContext serviceContext,
            IRolePlayerService rolePlayerService) : base(serviceContext, QueueName)
        {
            _rolePlayerService = rolePlayerService;
        }

        public override async Task ReceiveMessageAsync(VopdUpdateResponse vopdUpdateResponseMessage, CancellationToken cancellationToken)
        {
            Contract.Requires(vopdUpdateResponseMessage != null);

            foreach (var model in vopdUpdateResponseMessage.VopdUpdateResponses)
            {
                model.ModifiedBy = QueueName;
                await _rolePlayerService.ProcessVopdUpdateResponse(model);
            }
        }

        protected override Task ImpersonateUser(string username)
        {
            throw new NotImplementedException();
        }
    }
}
