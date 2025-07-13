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
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.Integrations.Contracts.Interfaces.Fspe;
using RMA.Service.Integrations.Contracts.Interfaces.Hyphen;
using RMA.Service.Integrations.Contracts.Interfaces.Qlink;
using RMA.Service.Integrations.Contracts.Interfaces.Vopd;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using IPaymentMethodService = RMA.Service.Admin.MasterDataManager.Contracts.Interfaces.IPaymentMethodService;

namespace RMA.Service.ClientCare
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
            builder.UseStatelessService<IPermissionService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IDocumentTemplateService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserRegistrationService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IClientTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPhoneTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAddressTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICountryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IStateProvinceService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICityService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUploadsService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IOwnerUploadService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IBeneficiaryTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPaymentMethodService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ITitleService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISendSmsService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISmsService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISmsTemplateService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IEmailTemplateService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IBankAccountTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IEuropAssistPremiumMatrixService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankBranchService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IIndustryClassService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<Admin.BusinessProcessManager.Contracts.Interfaces.INoteService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<ICountryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICoverTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IFrequencyTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IProductClassService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRuleService>(AppNames.Admin, AppPrefix.RulesManager);
            builder.UseStatelessService<IUnderwriterService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IFspeService>(AppNames.Integrations, AppPrefix.Fspe);
            builder.UseStatelessService<IVopdRequestProcessorService>(AppNames.Integrations, AppPrefix.Vopd);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IProductOptionRuleService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IAuditLogV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<ILastViewedV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<Billing.Contracts.Interfaces.ITransactionCreatorService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Billing.Contracts.Interfaces.ITransactionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IPeriodService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IProductOptionService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IBankAccountService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<Billing.Contracts.Interfaces.IInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IFspeImportIntegrationService>(AppNames.Integrations, AppPrefix.Fspe);
            builder.UseStatelessService<Billing.Contracts.Interfaces.IInvoiceAddService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<INatureOfBusinessService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<Billing.Contracts.Interfaces.IRolePlayerPolicyInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IHealthCareProviderService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IScheduledTaskService>(AppNames.Admin, AppPrefix.ScheduledTaskManager);
            builder.UseStatelessService<IQlinkIntegrationService>(AppNames.Integrations, AppPrefix.Qlink);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IServiceBusMessage>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IHyphenAccountVerificationService>(AppNames.Integrations, AppPrefix.Hyphen);
            builder.UseStatelessService<IPaymentCreatorService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<ITransactionCreatorService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IServiceBusMessage>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ClaimCare.Contracts.Interfaces.Event.IEventService>(AppNames.ClaimCare, AppPrefix.Event);
            builder.UseStatelessService<IPeriodService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}