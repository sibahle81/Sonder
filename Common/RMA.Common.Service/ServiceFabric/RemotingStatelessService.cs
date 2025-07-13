using Microsoft.ApplicationInsights.ServiceFabric;
using Microsoft.Extensions.Logging;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting;
using Microsoft.ServiceFabric.Services.Remoting.V2.FabricTransport.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

using RMA.Common.Service.Diagnostics.Serilog;
using RMA.Common.Service.ServiceFabric.Constants;

using Serilog;

using ServiceFabric.Remoting.CustomHeaders.ReliableServices;

using System.Collections.Generic;
using System.Fabric;

using ILogger = Microsoft.Extensions.Logging.ILogger;

namespace RMA.Common.Service.ServiceFabric
{
    public abstract class RemotingStatelessService : StatelessService, IService
    {
        protected RemotingStatelessService(StatelessServiceContext context)
            : base(context)
        {
            /** TelemetryConfiguration.Active.TelemetryInitializers.Add(FabricTelemetryInitializerExtension.CreateFabricTelemetryInitializer(context)); **/

            Logger = new LoggerFactory()
                .AddSerilog(Log.Logger.ForContext(new ServiceFabricEnricher(context)))
                .CreateLogger(GetType());
        }

        protected ILogger Logger { get; }

        /// <summary>
        ///     Optional override to create listeners (e.g., TCP, HTTP) for this service replica to handle client or user requests.
        /// </summary>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            Logger.LogInformation(ServiceFabricEvent.ServiceListening,
                "The stateless service {ServiceType} started listening (endpoint {Endpoint})", GetType().FullName,
                Context.ServiceName.ToString());

            FabricTelemetryInitializerExtension.SetServiceCallContext(Context);

            return new[]
            {
                new ServiceInstanceListener(context =>
                    new FabricTransportServiceRemotingListener(context,
                        new ExtendedServiceRemotingMessageDispatcher(context, this)))
            };
        }
    }
}