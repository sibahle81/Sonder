using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;

namespace RMA.Service.FinCare.Api
{
    public static class ContainerConfiguration
    {
        public static ContainerBuilder Configure(IServiceCollection services)
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<RMA.Common.Service.ServiceLocation.ServiceFabricServiceRegistry>();
            builder.RegisterModule<RMA.Common.Service.CommonServiceServiceRegistry>();
            builder.Populate(services);

            ConsumeTheirServices(builder);

            return builder;
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Finance.IAbilityPostingAuditService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Finance.IAbilityPostingService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Commissions.ICommissionService>(AppNames.FinCare, AppPrefix.Commissions);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Finance.IProductCrossRefTranTypeService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Finance.IRecoveryReceiptService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Finance.IRefundHeaderDetailService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Finance.IRefundHeaderService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Payments.IAuditLogService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Payments.IPaymentCreatorService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Payments.IPaymentService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Payments.IPaymentErrorAuditService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Payments.IBankFacsRequestService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Payments.IPaymentNoteService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<RMA.Service.Admin.MasterDataManager.Contracts.Interfaces.IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<RMA.Service.FinCare.Contracts.Interfaces.Payments.IPaymentCommunicationService>(AppNames.FinCare, AppPrefix.Payments);
        }
    }
}
