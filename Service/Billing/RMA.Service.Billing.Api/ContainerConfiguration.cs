using Autofac;
using Autofac.Extensions.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;

namespace RMA.Service.Billing.Api
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
            builder.UseStatelessService<Contracts.Interfaces.IInterestService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IDataExchangeService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IAgeAnalysisService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IBillingService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IBrokerPaymentScheduleService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.ICollectionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IInvoiceLineItemService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IPaymentAllocationService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IPaymentAllocationLookupService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IStatementService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.ITransactionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IInterBankTransferService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IAbilityCollectionsService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IAbilityCollectionsAuditService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IAbilityTransactionsAuditService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IInterDebtorTransferService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IInterBankTransferService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IInterDebtorTransferNoteService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.ITransactionCreatorService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IClaimRecoveryInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IAuditLogService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.ITermsArrangementService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<Contracts.Interfaces.IRolePlayerPolicyInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IScheduledTaskService>(AppNames.Admin, AppPrefix.ScheduledTaskManager);
            builder.UseStatelessService<ILetterOfGoodStandingService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<IDeclarationService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<IBankAccountService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBankBranchService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}