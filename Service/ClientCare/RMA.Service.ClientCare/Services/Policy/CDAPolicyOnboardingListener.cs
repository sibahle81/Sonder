using RMA.Common.Entities;
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
    public class CDAPolicyOnboardingListener : ServiceBusQueueStatelessService<PolicyDataRequest>, ICDAPolicyOnboardingListener
    {
        private readonly IPolicyIntegrationService _policyIntegrationService;
        private readonly IServiceBusMessage _serviceBusMessage;
        public const string QueueName = "mcc.cda.policyadd";

        public CDAPolicyOnboardingListener(StatelessServiceContext serviceContext,
            IPolicyIntegrationService policyIntegrationService,
            IServiceBusMessage serviceBusMessage) : base(serviceContext, QueueName)
        {
            _policyIntegrationService = policyIntegrationService;
            _serviceBusMessage = serviceBusMessage;
        }

        public override async Task ReceiveMessageAsync(PolicyDataRequest policyDataRequest, CancellationToken cancellationToken)
        {
            Contract.Requires(policyDataRequest != null);
            var messageType = new MessageType
            {
                MessageBody = policyDataRequest?.ReferenceNumber,
                From = "CDA Policy Add",
                To = "Mcc",
                MessageTaskType = "00009",
                Environment = "CDA Policy Add",
                EnqueuedTime = DateTime.Now,
            };
            await _serviceBusMessage.AddServiceBusMessage(messageType);
            await _policyIntegrationService.CreateCDAPolicy(policyDataRequest);
        }

        protected override Task ImpersonateUser(string username)
        {
            throw new NotImplementedException();
        }
    }
}
