using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using IAuditLogService = RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces.IAuditLogService;
using INoteService = RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces.INoteService;

namespace RMA.Service.Admin.BusinessProcessManager.Api
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
            builder.UseStatelessService<IApprovalService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IApprovalTypeService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IAuditLogService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<INoteService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IWizardConfigurationService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IWizardConfigurationRouteSettingService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}