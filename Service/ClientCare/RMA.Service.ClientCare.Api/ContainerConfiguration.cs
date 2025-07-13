using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

namespace RMA.Service.ClientCare.Api
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
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Broker.IAuditLogService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Broker.IBrokerageNoteService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Broker.IBrokerageService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Broker.IRepresentativeNoteService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Broker.IRepresentativeService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Client.IAuditLogService>(AppNames.ClientCare, AppPrefix.Client);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Client.ILastViewedService>(AppNames.ClientCare, AppPrefix.Client);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IAuditLogService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IEligibilityService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IFuneralPolicyPremiumService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IGeneratePolicyScheduleService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IInsuredLifeService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.ILastViewedService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyCaseService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyCommunicationService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyDocumentsService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyMonitoringService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyNoteService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPremiumListingFileAuditService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPremiumListingErrorAuditService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyStatusService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPremiumListingService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IConsolidatedFuneralService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IMyValuePlusService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IQLinkService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IAuditLogService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IBenefitNoteService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IBenefitRuleService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IBenefitService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IDiscountTypeService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.ILastViewedService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IProductNoteService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IProductOptionNoteService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IProductOptionRuleService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IProductOptionService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IProductRuleService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IProductService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IStatisticsService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Product.IUniqueFieldValidatorService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer.IPolicyInsuredLifeService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer.IRolePlayerNoteService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer.IRolePlayerPolicyService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer.IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Lead.ILeadService>(AppNames.ClientCare, AppPrefix.Lead);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Lead.IAuditLogService>(AppNames.ClientCare, AppPrefix.Lead);
            builder.UseStatelessService<IUserRegistrationService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Quote.IQuoteService>(AppNames.ClientCare, AppPrefix.Quote);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Member.IMemberService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Quote.IAuditLogService>(AppNames.ClientCare, AppPrefix.Quote);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IClientPolicyScheduleDocumentsService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Member.IDeclarationService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyIntegrationService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IInsuredLifeUploadErrorAuditService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IScheduledTaskService>(AppNames.Admin, AppPrefix.ScheduledTaskManager);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Member.ILetterOfGoodStandingService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IDiscountFileListingService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IGroupRiskService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.ILifeExtensionService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer.IQuickTransactionVopdService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IMyValuePlusService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IGroupRiskPolicyCaseService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<RMA.Service.ClientCare.Contracts.Interfaces.Policy.IPolicyReportService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPolicyDocumentService>(AppNames.ClientCare, AppPrefix.Policy);
        }
    }
}