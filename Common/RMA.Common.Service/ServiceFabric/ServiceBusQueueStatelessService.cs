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
    public abstract class ServiceBusQueueStatelessService<TMessage> : ServiceBusStatelessService<TMessage> where TMessage : ServiceBusMessageBase
    {
        /// <summary>
        /// Gets the name of the monitored Service Bus Queue.
        /// </summary>
        public string ServiceBusQueueName { get; }

        protected ServiceBusQueueStatelessService(StatelessServiceContext serviceContext,
            string serviceBusQueueName)
            : base(serviceContext, Environment.GetEnvironmentVariable("SBConnectionString"))
        {
            var environment = Environment.GetEnvironmentVariable("EnvName");
            ServiceBusQueueName = $"{environment}{serviceBusQueueName}";
        }

        protected ServiceBusQueueStatelessService(StatelessServiceContext serviceContext,
            string serviceBusQueueName, string connectionString)
            : base(serviceContext, connectionString)
        {
            var environment = Environment.GetEnvironmentVariable("EnvName");
            ServiceBusQueueName = $"{environment}{serviceBusQueueName}";
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            Logger.LogInformation(ServiceFabricEvent.ServiceListening,
                "The stateless service {ServiceType} started listening (endpoint {Endpoint})", GetType().FullName,
                Context.ServiceName.ToString());

            FabricTelemetryInitializerExtension.SetServiceCallContext(Context);

            yield return new ServiceInstanceListener(context =>
                new ServiceBusQueueCommunicationListener<TMessage>(this));
        }
    }
}