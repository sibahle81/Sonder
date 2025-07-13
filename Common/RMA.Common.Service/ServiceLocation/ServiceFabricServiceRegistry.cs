using Autofac;
using Autofac.Integration.ServiceFabric;

using Microsoft.ServiceFabric.Actors.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;

using RMA.Common.Service.ServiceFabric;

namespace RMA.Common.Service.ServiceLocation
{
    public class ServiceFabricServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterServiceFabricSupport();

            builder.RegisterType<ProxyFactoryProvider>().As<IProxyFactoryProvider>();

            builder.Register(context =>
            {
                var proxyFactoryProvider = context.Resolve<IProxyFactoryProvider>();
                return proxyFactoryProvider.CreateServiceProxyFactory();
            }).As<IServiceProxyFactory>();

            builder.Register(context =>
            {
                var proxyFactoryProvider = context.Resolve<IProxyFactoryProvider>();
                return proxyFactoryProvider.CreateActorProxyFactory();
            }).As<IActorProxyFactory>();
        }
    }
}