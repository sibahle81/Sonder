using Autofac;
using Autofac.Integration.ServiceFabric;

using Microsoft.ServiceFabric.Services.Remoting;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Runtime;

using RMA.Common.Service.Diagnostics;

using System;
using System.Diagnostics;

namespace RMA.Common.Service.Extensions
{
    public static class ContainerBuilderExtensions
    {
        public static ContainerBuilder HostServiceBusListener<TInterface, TImplementation>(this ContainerBuilder builder,
            string servicePrefix)
            where TImplementation : StatelessService, TInterface
        {
            var serviceName = typeof(TInterface).Name;
            if (!string.IsNullOrEmpty(servicePrefix)) serviceName = $"{servicePrefix}/{serviceName}";

            builder.RegisterStatelessService<TImplementation>(serviceName);

            ServiceEventSource.Current.ServiceTypeRegistered(Process.GetCurrentProcess().Id, serviceName);

            return builder;
        }

        public static ContainerBuilder HostStatelessService<TInterface, TImplementation>(this ContainerBuilder builder,
            string appName, string servicePrefix)
            where TImplementation : StatelessService, TInterface where TInterface : IService
        {
            var serviceName = typeof(TInterface).Name;
            if (!string.IsNullOrEmpty(servicePrefix)) serviceName = $"{servicePrefix}/{serviceName}";

            builder.RegisterStatelessService<TImplementation>(serviceName);
            builder.UseStatelessService<TInterface>(appName, servicePrefix);

            ServiceEventSource.Current.ServiceTypeRegistered(Process.GetCurrentProcess().Id, serviceName);

            return builder;
        }

        public static ContainerBuilder UseStatelessService<TInterface>(this ContainerBuilder builder, string appName,
            string servicePrefix) where TInterface : IService
        {
            var serviceName = typeof(TInterface).Name;
            var environment = Environment.GetEnvironmentVariable("EnvName");
            if (!string.IsNullOrEmpty(servicePrefix)) serviceName = $"{servicePrefix}/{serviceName}";

            builder.Register(c =>
            {
                var factory = c.Resolve<IServiceProxyFactory>();
                return factory.CreateServiceProxy<TInterface>(new Uri($"fabric:/{environment}{appName}/{serviceName}"));
            }).InstancePerDependency();

            return builder;
        }
    }
}