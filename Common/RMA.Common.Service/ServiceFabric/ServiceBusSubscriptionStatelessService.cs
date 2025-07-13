using Microsoft.ApplicationInsights.ServiceFabric;
using Microsoft.Extensions.Logging;
using Microsoft.ServiceFabric.Services.Communication.Runtime;

using RMA.Common.Entities;
using RMA.Common.Service.ServiceBus.Consumers;
using RMA.Common.Service.ServiceFabric.Constants;

using System;
using System.Collections.Generic;
using System.Fabric;

namespace RMA.Common.Service.ServiceFabric
{
    public abstract class ServiceBusSubscriptionStatelessService<TMessage>
        : ServiceBusStatelessService<TMessage> where TMessage : ServiceBusMessageBase
    {
        public string ServiceBusTopicName { get; }
        public string ServiceBusSubscriptionName { get; }

        protected ServiceBusSubscriptionStatelessService(StatelessServiceContext serviceContext,
            string serviceBusTopicName,
            string serviceBusSubscriptionName)
            : base(serviceContext, Environment.GetEnvironmentVariable("SBConnectionString"))
        {
            ServiceBusTopicName = serviceBusTopicName;
            ServiceBusSubscriptionName = $"{serviceBusSubscriptionName}";
        }

        protected ServiceBusSubscriptionStatelessService(StatelessServiceContext serviceContext,
            string serviceBusTopicName,
            string serviceBusSubscriptionName,
            string connectionString)
            : base(serviceContext, connectionString)
        {
            ServiceBusTopicName = serviceBusTopicName;
            ServiceBusSubscriptionName = $"{serviceBusSubscriptionName}";
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            Logger.LogInformation(ServiceFabricEvent.ServiceListening,
                "The stateless service {ServiceType} started listening (endpoint {Endpoint})", GetType().FullName,
                Context.ServiceName.ToString());

            FabricTelemetryInitializerExtension.SetServiceCallContext(Context);

            yield return new ServiceInstanceListener(context =>
                new ServiceBusSubscriptionCommunicationListener<TMessage>(this));
        }

    }
}