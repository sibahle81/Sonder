using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

using RMA.Common.Service.Diagnostics;

using Serilog;

using System.Collections.Generic;
using System.Fabric;
using System.Fabric.Description;
using System.IO;
using System.Linq;

namespace RMA.Web.MemberPortal.Host
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance. 
    /// </summary>
    internal sealed class Host : StatelessService
    {
        public Host(StatelessServiceContext context)
            : base(context)
        { }

        /// <summary>
        /// Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            var endpoints = Context.CodePackageActivationContext.GetEndpoints().Where(endpoint => endpoint.Protocol == EndpointProtocol.Http || endpoint.Protocol == EndpointProtocol.Https);

            return endpoints.Select(endpoint => new ServiceInstanceListener(serviceContext =>
                    new HttpSysCommunicationListener(serviceContext, endpoint.Name, (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting HttpSysCommunicationListener on {url}");
                        return new WebHostBuilder()
                            .UseHttpSys(options =>
                            {
                                options.Authentication.Schemes = Microsoft.AspNetCore.Server.HttpSys.AuthenticationSchemes.None;
                                options.Authentication.AllowAnonymous = true;
                                options.MaxConnections = null;
                                options.MaxRequestBodySize = 30000000;
                                options.UrlPrefixes.Add(url);
                            })
                            .ConfigureServices(services => services.AddSingleton<StatelessServiceContext>(serviceContext))
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseStartup<Startup>()
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(url)
                            .UseSerilog()
                            .Build();
                    }), endpoint.Name
            ));
        }
    }
}
