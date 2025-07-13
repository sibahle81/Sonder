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
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using IAuditLogService = RMA.Service.Admin.SecurityManager.Contracts.Interfaces.IAuditLogService;
using ILastViewedService = RMA.Service.Admin.SecurityManager.Contracts.Interfaces.ILastViewedService;
using INoteService = RMA.Service.Admin.SecurityManager.Contracts.Interfaces.INoteService;

namespace RMA.Service.Admin.SecurityManager.Api
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
            builder.UseStatelessService<IAuthenticationService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<ILastViewedService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<INoteService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IPasswordResetAuthorizationService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IPermissionService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IRoleService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IUniqueFieldValidatorService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IUserPreferenceService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IWorkPoolService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IAuditLogService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IPermissionGroupService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<ILookupService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICityService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserRegistrationService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<ICountryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IStateProvinceService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ITenantPreferenceService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IBankService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankBranchService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}