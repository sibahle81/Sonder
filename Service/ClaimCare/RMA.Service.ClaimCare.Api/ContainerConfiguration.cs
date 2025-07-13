using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Cost;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
namespace RMA.Service.ClaimCare.Api
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
            builder.UseStatelessService<ICauseOfDeathService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<Contracts.Interfaces.Claim.IAuditLogService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimIntegrationService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IPreAuthClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<Contracts.Interfaces.Claim.INoteService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IFatalService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<ITypeOfDeathService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<ICostService>(AppNames.ClaimCare, AppPrefix.Cost);
            builder.UseStatelessService<IEventService>(AppNames.ClaimCare, AppPrefix.Event);
            builder.UseStatelessService<IBillingInterfaceService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IUnclaimedBenefitService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IAccidentService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimCommunicationService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IUnclaimedBenefitService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IMedicalInvoiceClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IBenefitService>(AppNames.ClientCare, AppPrefix.Client);
            builder.UseStatelessService<IMedicalEstimatesService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimRequirementService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimEarningService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IDiseaseService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPoolWorkFlowService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IClaimFinalizedIntegrationService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimInvoiceService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimDisabilityService>(AppNames.ClaimCare, AppPrefix.Claim);
        }
    }
}