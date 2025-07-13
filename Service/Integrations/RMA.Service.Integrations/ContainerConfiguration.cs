using Autofac;

using RMA.Common.Constants;
using RMA.Common.Database;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;
using RMA.Service.Integrations.Database;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;

namespace RMA.Service.Integrations
{
    public static partial class ContainerConfiguration
    {
        public static ContainerBuilder Configure()
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<ServiceFabricServiceRegistry>();

            // Register any regular dependencies.
            builder.RegisterModule<CommonServiceServiceRegistry>();
            builder.RegisterModule<CommonDatabaseServiceRegistry>();
            builder.RegisterModule<EfDbContextServiceRegistry>();

            HostOurServices(builder);
            ConsumeTheirServices(builder);
            RegisterImporters(builder);

            return builder;
        }

        private static void RegisterImporters(ContainerBuilder builder)
        {
        }

        private static void HostOurServices(ContainerBuilder builder)
        {
            //Call the generated code
            HostOurServicesPartial(builder);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IBankVerificationResponseProcessorService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<IIntegrationLoggingService>(AppNames.DigiCare, AppPrefix.Digi);
            builder.UseStatelessService<IMailboxConfigurationService>(AppNames.ScanCare, AppPrefix.AutoProcessing);
        }
    }
}