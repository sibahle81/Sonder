using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;

namespace RMA.Service.Admin.ScheduledTaskManager.Api
{
    public static class ContainerConfiguration
    {

        public static ContainerBuilder Configure(IServiceCollection services)
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<RMA.Common.Service.CommonServiceServiceRegistry>();
            builder.RegisterModule<RMA.Common.Service.ServiceLocation.ServiceFabricServiceRegistry>();
            builder.Populate(services);


            ConsumeTheirServices(builder);
            return builder;
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IScheduledTaskService>(AppNames.Admin, AppPrefix.ScheduledTaskManager);

        }
    }
}
