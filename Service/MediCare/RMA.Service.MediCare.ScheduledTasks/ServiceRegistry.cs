using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.ScheduledTasks.Tasks.Medical;

namespace RMA.Service.MediCare.ScheduledTasks
{
    public class ServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<ProcessSwitchBatchInvoicesTask>();
            builder.RegisterType<AutoPayRunTask>();
            builder.RegisterType<MedicalInvoiceStatusUpdatesTask>();
            builder.RegisterType<CreateMedicalInvoicesTask>();
            builder.RegisterType<ValidateSwitchBatchMedicalInvoicesTask>();
            builder.RegisterType<ProcessCompcareContactCareTask>();

            ConsumeTheirServices(builder);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IInvoiceService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ISwitchBatchService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceMedicalSwitchService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ICommonProcessorService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IHealthBridgeProcessorService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IMediSwitchProcessorService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IServiceBusMessage>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IInvoiceHelperService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ITebaProcessorService>(AppNames.MediCare, AppPrefix.Medical);
        }
    }
}