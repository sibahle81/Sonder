using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using IAuditLogService = RMA.Service.MediCare.Contracts.Interfaces.Medical.IAuditLogService;

namespace RMA.Service.MediCare.Api
{
    public static class ContainerConfiguration
    {
        public static ContainerBuilder Configure(IServiceCollection services)
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<Common.Service.CommonServiceServiceRegistry>();
            builder.RegisterModule<Common.Service.ServiceLocation.ServiceFabricServiceRegistry>();
            builder.Populate(services);
            ConsumeTheirServices(builder);
            return builder;
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IMediCareService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IHealthCareProviderService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IPreAuthorisationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceMedicalSwitchService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IPreAuthBreakdownUnderAssessReasonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ITariffBaseUnitCostTypeService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IICD10CodeService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ISwitchBatchService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceUnderAssessReasonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceLineUnderAssessReasonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ISwitchBatchInvoiceLineUnderAssessReasonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ISwitchBatchInvoiceUnderAssessReasonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IRuleService>(AppNames.Admin, AppPrefix.RulesManager);
            builder.UseStatelessService<IHealthCareProviderService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IMedicalItemFacadeService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IInvoiceHelperService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceCommonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IPensionMedicalPlanService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IPreAuthInvoiceService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceCompCareMapService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ICompCareIntegrationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IAuditLogService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IUnderAssessReasonService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ITravelAuthorisationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            
        }
    }
}
