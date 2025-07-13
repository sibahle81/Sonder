using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    using Newtonsoft.Json;

    using RMA.Common.Entities;
    using RMA.Common.Extensions;

    public class ProcessQlinkTransactionListener : ServiceBusQueueStatelessService<ProcessQlinkTransactionRequest>, IProcessQlinkTransactionListener
    {
        private readonly IQLinkService _qlinkService;
        private readonly IServiceBusMessage _serviceBusMessage;
        public const string QueueName = "mcc.qlink.processqlintTransaction";

        public ProcessQlinkTransactionListener(StatelessServiceContext serviceContext,
            IQLinkService qlinkService,
            IServiceBusMessage serviceBusMessage) : base(serviceContext, QueueName)
        {
            _qlinkService = qlinkService;
            _serviceBusMessage = serviceBusMessage;
        }

        public override async Task ReceiveMessageAsync(ProcessQlinkTransactionRequest processQlinkTransactionRequest, CancellationToken cancellationToken)
        {
            Contract.Requires(processQlinkTransactionRequest != null);

            var messageType = new MessageType
            {
                  MessageBody = JsonConvert.SerializeObject(processQlinkTransactionRequest),
                  From = "Manual Qlink Trigger",
                  To = "Mcc",
                  MessageTaskType = "00008",
                  Environment = "QLink",
                  EnqueuedTime = DateTimeHelper.SaNow
            };

            await _serviceBusMessage.AddServiceBusMessage(messageType);

            await _qlinkService.ProcessQlinkTransactionAsync(processQlinkTransactionRequest.PolicyNumbers, processQlinkTransactionRequest.QLinkTransactionType, false);
        }

        protected override Task ImpersonateUser(string username)
        {
            throw new NotImplementedException();
        }
    }
}
