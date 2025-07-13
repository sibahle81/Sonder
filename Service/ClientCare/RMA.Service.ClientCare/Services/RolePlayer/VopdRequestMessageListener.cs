using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.Integrations.Contracts.Entities.Vopd;
using RMA.Service.Integrations.Contracts.Interfaces.Vopd;

using System;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class VopdRequestMessageListener : ServiceBusQueueStatelessService<VopdRequestMessage>, IVopdRequestMessageListener
    {
        private readonly IVopdRequestProcessorService _vopdRequestProcessorFacadeService;
        public const string QueueName = "mcc.vopdsend";

        public VopdRequestMessageListener(StatelessServiceContext serviceContext, IVopdRequestProcessorService vopdRequestProcessorFacadeService) : base(serviceContext, QueueName)
        {
            _vopdRequestProcessorFacadeService = vopdRequestProcessorFacadeService;
        }


        public override async Task ReceiveMessageAsync(VopdRequestMessage message, CancellationToken cancellationToken)
        {
            await _vopdRequestProcessorFacadeService.ReceiveMessageAsync(message, cancellationToken);
        }

        protected override Task ImpersonateUser(string username)
        {
            throw new NotImplementedException();
        }


    }
}
