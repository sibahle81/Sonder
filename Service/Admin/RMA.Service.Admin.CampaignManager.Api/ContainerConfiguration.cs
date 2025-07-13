using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Interfaces.AzureBlob;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

namespace RMA.Service.Admin.CampaignManager.Api
{
    public static class ContainerConfiguration
    {
        public static ContainerBuilder Configure(IServiceCollection services)
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<CommonServiceServiceRegistry>();
            builder.RegisterModule<ServiceFabricServiceRegistry>();
            builder.Populate(services);

            ConsumeTheirServices(builder);

            return builder;
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<ITargetAudienceService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISmsTokenService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISmsTemplateService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISmsService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IReminderService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IProcessService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<INoteService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ILastViewedService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IImportFileService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IEmailTokenService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IEmailTemplateService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISmsAuditService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ICampaignService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IAuditLogService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ITargetAudienceMemberService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISendSmsService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IBinaryStorageService>(AppNames.Integrations, AppPrefix.AzureBlob);
        }
    }
}