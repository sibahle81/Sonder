using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;

namespace RMA.Service.Integrations.Api
{
    public static class ContainerConfiguration
    {
        private const string IntegrationsApp = "RMA.ServiceFabric.Integrations";

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

            //builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.AzureBlob.IBinaryStorageService>(AppNames.Integrations, AppPrefix.AzureBlob);
            builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Fspe.IFspeService>(AppNames.Integrations, AppPrefix.Fspe);
            builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Hyphen.IHyphenAccountVerificationService>(AppNames.Integrations, AppPrefix.Hyphen);
            builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.CompCare.ICCClaimService>(AppNames.Integrations, AppPrefix.CompCare);
            builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.CompCare.IMedicalReportService>(AppNames.Integrations, AppPrefix.CompCare);
            builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Qlink.IQlinkIntegrationService>(AppNames.Integrations, AppPrefix.Qlink);


        }
    }
}