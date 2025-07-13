using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

namespace RMA.Service.Admin.MasterDataManager.Api
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
            builder.UseStatelessService<IAddressTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankAccountService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankAccountServiceTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankAccountTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankBranchService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBeneficiaryTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICampaignAudienceTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICampaignCategoryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICampaignStatusService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICampaignTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICancellationReasonService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICoidCancellationReasonService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICaseStatusService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICityService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IClaimBranchService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IClientTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICommunicationTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IContactTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICountryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICoverMemberTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICoverTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentCategoryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentCategoryTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentTemplateService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IEarningsTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IEuropAssistPremiumMatrixService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IEnquiryQueryTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IEventTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IFollowUpService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IFrequencyTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IIndustryClassService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IItemTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IIdTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ILanguageService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ILocationsService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ILookupService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IMedicalReportTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IMenuService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IModuleService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<INatureOfBusinessService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IOwnerUploadService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPaymentMethodService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPhoneTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPrimeRateService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IProductClassService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IProductStatusService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPublicHolidayService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRateIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRecipientTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRequiredDocumentService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISendFollowUpService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IServiceTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ISkillCategoryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ISkillSubCategoryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IStateProvinceService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ITitleService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUnderwriterService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUploadsService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IValidityCheckSetService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IManagePolicyTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IInsuredLifeRemovalReasonService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPolicyCancelReasonService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPeriodService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICommissionBandService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<Contracts.Interfaces.IAuditLogService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAnnouncementService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAnnouncementRoleService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAnnouncementUserAcceptanceService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IVatService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPayeeTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUnderAssessReasonService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPensionTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IServiceBusMessage>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPoolWorkFlowService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IWorkpoolUserScheduleService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAdditionalTaxTypeService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICommonSystemNoteService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IReferralService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAuthorityLimitService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IGazetteService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRolePlayerQueryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IContactValidationService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}