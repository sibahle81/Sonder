using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;

namespace RMA.Web.Login
{
    public static class ContainerConfiguration
    {
        public static ContainerBuilder Configure()
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<RMA.Common.Service.CommonServiceServiceRegistry>();
            builder.RegisterModule<RMA.Common.Service.ServiceLocation.ServiceFabricServiceRegistry>();

            //Add custom Registrations here
            ConsumeTheirServices(builder);

            return builder;
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<RMA.Service.Admin.SecurityManager.Contracts.Interfaces.IAuthenticationService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<RMA.Service.Admin.SecurityManager.Contracts.Interfaces.IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
        }
    }
}
