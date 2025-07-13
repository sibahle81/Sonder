using Autofac;

using RMA.Common.Constants;
using RMA.Common.Database;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database;

namespace RMA.Service.MediCare
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
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICommonSystemNoteService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPreAuthClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IVatService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPayeeTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IMedicalInvoiceClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IRuleService>(AppNames.Admin, AppPrefix.RulesManager);
            builder.UseStatelessService<IMedicalFormService>(AppNames.DigiCare, AppPrefix.Digi);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IRuleEngineService>(AppNames.Admin, AppPrefix.RulesManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IHealthCareProviderService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IMediCareService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IMedicalItemFacadeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IEventService>(AppNames.ClaimCare, AppPrefix.Event);
            builder.UseStatelessService<IPaymentService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IPaymentCreatorService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IProductService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IBankAccountService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUnderAssessReasonService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRoleService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IPreAuthBreakdownUnderAssessReasonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceHelperService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IWizardConfigurationRouteSettingService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IInvoiceCommonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IPreAuthInvoiceService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IPaymentsAllocationService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IServiceBusMessage>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IInvoiceCompCareMapService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ICompCareIntegrationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ISwitchInvoiceHelperService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IAuditLogV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<ILookupService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IVatService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAuthorityLimitService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IMedicareCommunicationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}
