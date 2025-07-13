using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.ApplicationInsights.ServiceFabric;
using Microsoft.ApplicationInsights.ServiceFabric.Module;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.HttpSys;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

using RMA.Common.Service.Diagnostics;
using RMA.Common.Service.Diagnostics.Serilog;

using Serilog;

using System.Collections.Generic;
using System.Fabric;
using System.Fabric.Description;
using System.IO;
using System.Linq;

using ILogger = Microsoft.Extensions.Logging.ILogger;

namespace RMA.Common.Web.ServiceFabric
{
    public abstract class HttpSysStatelessService<TStartup> : StatelessService where TStartup : class
    {
        private readonly string _appPrefix;

        protected HttpSysStatelessService(StatelessServiceContext context, string appPrefix)
            : base(context)
        {
            _appPrefix = appPrefix;

            Logger = new LoggerFactory()
                .AddSerilog(Log.Logger.ForContext(new ServiceFabricEnricher(context)))
                .CreateLogger(GetType());
        }

        protected ILogger Logger { get; }

        /// <summary>
        ///     Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            FabricTelemetryInitializerExtension.SetServiceCallContext(Context);

            var endpoints = Context.CodePackageActivationContext.GetEndpoints().Where(endpoint => endpoint.Protocol == EndpointProtocol.Http || endpoint.Protocol == EndpointProtocol.Https);
            return endpoints.Select(endpoint => new ServiceInstanceListener(serviceContext =>
                    new HttpSysCommunicationListener(serviceContext, endpoint.Name, (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting HttpSysCommunicationListener on {url}");
                        var siteUrl = $"{url}/{_appPrefix}";
                        return new WebHostBuilder()
                            .ConfigureServices(
                                services => services
                                    .AddSingleton<StatelessServiceContext>(serviceContext)
                                    .AddSingleton<ITelemetryInitializer>(FabricTelemetryInitializerExtension.CreateFabricTelemetryInitializer(serviceContext))
                                    .AddSingleton<ITelemetryModule>(new ServiceRemotingDependencyTrackingTelemetryModule())
                                    .AddSingleton<ITelemetryModule>(new ServiceRemotingRequestTrackingTelemetryModule())
                                    .AddSingleton<ILoggerFactory>(new SerilogLoggerFactory(Log.Logger))
                            )
                            .UseHttpSys(options =>
                            {
                                options.Authentication.Schemes = AuthenticationSchemes.None;
                                options.Authentication.AllowAnonymous = true;
                                options.MaxConnections = null;
                                options.MaxRequestBodySize = 30000000;
                                options.UrlPrefixes.Add(siteUrl);
                            })
                            .UseSetting("detailedErrors", "true")
                            .ConfigureServices(services =>
                            {
                                services.AddSingleton<StatelessServiceContext>(serviceContext);
                                services.Configure<FormOptions>(o =>
                                {
                                    o.ValueLengthLimit = int.MaxValue;
                                    o.MultipartBodyLengthLimit = int.MaxValue;
                                    o.MemoryBufferThreshold = int.MaxValue;
                                });
                            })
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseStartup<TStartup>()
                            .UseApplicationInsights()
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(siteUrl)
                            .UseSerilog()
                            .Build();
                    }), endpoint.Name
            ));
        }
    }
}