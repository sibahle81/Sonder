using Autofac;

using RMA.Common.Constants;
using RMA.Common.Database;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.CampaignManager.Database;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Interfaces.AzureBlob;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

namespace RMA.Service.Admin.CampaignManager
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

            return builder;
        }


        private static void HostOurServices(ContainerBuilder builder)
        {
            //Call the generated code
            HostOurServicesPartial(builder);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IClientTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUploadsService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICampaignCategoryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICampaignTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRoleService>(AppNames.Admin, AppPrefix.SecurityManager);

            builder.UseStatelessService<IAuditLogV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<ILastViewedV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<ClientCare.Contracts.Interfaces.Product.IProductService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<Integrations.Contracts.Interfaces.Sms.ISmsRequestService>(AppNames.Integrations, AppPrefix.Sms);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IBinaryStorageService>(AppNames.Integrations, AppPrefix.AzureBlob);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);

        }
    }
}