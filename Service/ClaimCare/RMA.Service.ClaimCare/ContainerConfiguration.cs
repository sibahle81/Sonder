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
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClaimCare.Database;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.Integrations.Contracts.Interfaces.EuropAssistNotification;
using RMA.Service.Integrations.Contracts.Interfaces.Hyphen;
using RMA.Service.PensCare.Contracts.Interfaces.PensionCase;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using IBankAccountService = RMA.Service.Admin.MasterDataManager.Contracts.Interfaces.IBankAccountService;
using ILastViewedService = RMA.Service.ClientCare.Contracts.Interfaces.Policy.ILastViewedService;

namespace RMA.Service.ClaimCare
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
            builder.UseStatelessService<IBankAccountService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentTemplateService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICauseOfDeathService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IEmailTemplateService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IBeneficiaryTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBrokerageService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ILastViewedService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPolicyInsuredLifeService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IProductService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IProductOptionCoverService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IWorkPoolService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IRoleService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IBankAccountTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankBranchService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IClientTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IRuleEngineService>(AppNames.Admin, AppPrefix.RulesManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IServiceBusMessage>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ISendSmsService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISmsTemplateService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IPaymentCreatorService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IRolePlayerPolicyService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IProductOptionService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IProductOptionRuleService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<ITransactionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IClaimRecoveryInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IInterBankTransferService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IBillingService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ITransactionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IAuditLogV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<ILastViewedV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<IHyphenAccountVerificationService>(AppNames.Integrations, AppPrefix.Hyphen);
            builder.UseStatelessService<IBankAccountVerificationCreatorService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<IBankVerificationResponseProcessorService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<IEuropAssistNotificationService>(AppNames.Integrations, AppPrefix.EuropAssistNotification);
            builder.UseStatelessService<IIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<MediCare.Contracts.Interfaces.Medical.IICD10CodeService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IBenefitService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IServiceBusMessage>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDigiService>(AppNames.DigiCare, AppPrefix.Digi);
            builder.UseStatelessService<IMedicalFormService>(AppNames.DigiCare, AppPrefix.Digi);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPoolWorkFlowService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPensionCaseService>(AppNames.PensCare, AppPrefix.PensionCase);
            builder.UseStatelessService<IInsuredLifeService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPaymentsAllocationService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IPaymentService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IRepresentativeService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<ICommonSystemNoteService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAuthorityLimitService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}