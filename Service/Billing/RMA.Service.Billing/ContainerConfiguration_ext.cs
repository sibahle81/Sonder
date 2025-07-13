using Autofac;

using RMA.Common.Constants;
using RMA.Common.Database;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Database;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

namespace RMA.Service.Billing
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
            builder.UseStatelessService<IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPolicyNoteService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IRolePlayerPolicyService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankAccountService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankBranchService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IProductOptionService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IProductService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<FinCare.Contracts.Interfaces.Commissions.ICommissionService>(AppNames.FinCare, AppPrefix.Commissions);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IPeriodService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBillingInterfaceService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IPaymentService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<ILetterOfGoodStandingService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<IRoleService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IDeclarationService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<IServiceBusMessage>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPaymentCreatorService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}