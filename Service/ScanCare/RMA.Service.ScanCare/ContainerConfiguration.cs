using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.Integrations.Contracts.Interfaces.AzureBlob;

namespace RMA.Service.ScanCare
{
    public static partial class ContainerConfiguration
    {

        public static ContainerBuilder Configure()
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<RMA.Common.Service.ServiceLocation.ServiceFabricServiceRegistry>();

            // Register any regular dependencies.
            builder.RegisterModule<RMA.Common.Service.CommonServiceServiceRegistry>();
            builder.RegisterModule<RMA.Common.Database.CommonDatabaseServiceRegistry>();
            builder.RegisterModule<Database.EfDbContextServiceRegistry>();

            ConsumeTheirServices(builder);
            HostOurServices(builder);

            return builder;
        }

        private static void HostOurServices(ContainerBuilder builder)
        {
            HostOurServicesPartial(builder);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            //if any other module services are used register them here
            builder.UseStatelessService<IBinaryStorageService>(AppNames.Integrations, AppPrefix.AzureBlob);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<Admin.CampaignManager.Contracts.Interfaces.ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<Admin.CampaignManager.Contracts.Interfaces.IEmailTemplateService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IDocumentTemplateService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IEventService>(AppNames.ClaimCare, AppPrefix.Event);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
        }
    }
}
