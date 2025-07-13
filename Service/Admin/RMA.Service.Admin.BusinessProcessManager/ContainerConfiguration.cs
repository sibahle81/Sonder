using Autofac;

using RMA.Common.Constants;
using RMA.Common.Database;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.BusinessProcessManager.Database;
using RMA.Service.Admin.BusinessProcessManager.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

namespace RMA.Service.Admin.BusinessProcessManager
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

            builder.RegisterType<WizardHost>().As<IWizardHost>();
            builder.RegisterType<WizardContext>().As<IWizardContext>();

            //Register BPM Work flows
            builder.RegisterModule<ClientCare.BusinessProcessTasks.ProcessServiceRegistry>();
            builder.RegisterModule<ClaimCare.BusinessProcessTasks.ProcessServiceRegistry>();
            builder.RegisterModule<FinCare.BusinessProcessTasks.ProcessServiceRegistry>();
            builder.RegisterModule<DigiCare.BusinessProcessTasks.ProcessServiceRegistry>();
            builder.RegisterModule<MediCare.BusinessProcessTasks.ProcessServiceRegistry>();
            builder.RegisterModule<PensCare.BusinessProcessTasks.ProcessServiceRegistry>();
            builder.RegisterModule<MemberPortal.BusinessProcessTasks.ProcessServiceRegistry>();

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
            builder.UseStatelessService<IStateProvinceService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRoleService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IRuleEngineService>(AppNames.Admin, AppPrefix.RulesManager);
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IBankAccountService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankBranchService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankAccountTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAuditLogV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<ILastViewedV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<IUserRegistrationService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IPremiumListingFileAuditService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IDiseaseService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IGroupRiskPolicyCaseService>(AppNames.ClientCare, AppPrefix.Policy);
            
        }
    }
}