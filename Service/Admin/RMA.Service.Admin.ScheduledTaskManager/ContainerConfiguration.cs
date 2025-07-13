using Autofac;

using RMA.Common.Database;
using RMA.Common.Service;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.ScheduledTaskManager.Database;

namespace RMA.Service.Admin.ScheduledTaskManager
{
    public static partial class ContainerConfiguration
    {
        public static ContainerBuilder Configure()
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<CommonServiceServiceRegistry>();
            builder.RegisterModule<ServiceFabricServiceRegistry>();
            // Register any regular dependencies.
            builder.RegisterModule<CommonDatabaseServiceRegistry>();
            builder.RegisterModule<EfDbContextServiceRegistry>();

            builder.RegisterModule<ClientCare.ScheduledTasks.ServiceRegistry>();
            builder.RegisterModule<ClaimCare.ScheduledTasks.ServiceRegistry>();
            builder.RegisterModule<FinCare.ScheduledTasks.ServiceRegistry>();
            builder.RegisterModule<MemberPortal.ScheduledTasks.ServiceRegistry>();
            builder.RegisterModule<MediCare.ScheduledTasks.ServiceRegistry>();
            builder.RegisterModule<PensCare.ScheduledTasks.ServiceRegistry>();

            ConsumeTheirServices(builder);
            HostOurServices(builder);

            return builder;
        }

        private static void HostOurServices(ContainerBuilder builder)
        {
            //Call the generated code
            HostOurServicesPartial(builder);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
        }
    }
}
