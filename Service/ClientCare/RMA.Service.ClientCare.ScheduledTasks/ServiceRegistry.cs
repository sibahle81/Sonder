using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.ScheduledTasks.Tasks.BulkMessaging;
using RMA.Service.ClientCare.ScheduledTasks.Tasks.ConsoleWriter;
using RMA.Service.ClientCare.ScheduledTasks.Tasks.FspDailyImport;
using RMA.Service.ClientCare.ScheduledTasks.Tasks.LeadReminder;
using RMA.Service.ClientCare.ScheduledTasks.Tasks.LeadSLAEscalation;
using RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy;
using RMA.Service.ClientCare.ScheduledTasks.Tasks.Renewal;
using RMA.Service.ClientCare.ScheduledTasks.Tasks.SLAEscalation;
using RMA.Service.Integrations.Contracts.Interfaces.Fspe;

namespace RMA.Service.ClientCare.ScheduledTasks
{
    public class ServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<ClientCareConsoleWriterTask>();
            builder.RegisterType<FspDailyImport>();
            builder.RegisterType<ReInstatePolicy>();
            builder.RegisterType<MonitorAnniversary>();
            builder.RegisterType<MonitorChildAge>();
            builder.RegisterType<OverAgeDailyCheck>();
            builder.RegisterType<LapsePolicy>();
            builder.RegisterType<CancelPolicy>();
            builder.RegisterType<MonitorReinstatementPayments>();
            builder.RegisterType<MonitorContinuationPayments>();
            builder.RegisterType<PremiumListingPolicyPremiumMovement>();
            builder.RegisterType<LeadRemindersTask>();
            builder.RegisterType<LeadSLAEscalationTask>();
            builder.RegisterType<PremiumListingPaymentTask>();
            builder.RegisterType<EstimatesTask>();
            builder.RegisterType<RenewalLetterTask>();
            builder.RegisterType<UpgradeDowngradePolicy>();
            builder.RegisterType<ActivateFreePolicies>();
            builder.RegisterType<SLAEscalationTask>();
            builder.RegisterType<ProcessQlinkAffordabilityCheck>();
            builder.RegisterType<ProcessQlinkReservations>();
            builder.RegisterType<ProcessStagedQlinkTransactions>();
            builder.RegisterType<MonitorFirstPremiumPendingPolicies>();
            builder.RegisterType<LifeExtensionPremiumAdjustmentRequest>();
            builder.RegisterType<LifeExtensionPremiumAdjustmentNotification>();
            builder.RegisterType<LifeExtensionPremiumAdjustment>();
            builder.RegisterType<PolicyHolderBirthdayWishesTask>();
            builder.RegisterType<ProcessQlinkQtosTransactions>();
            builder.RegisterType<PremiumPaybackCalculate>();
            builder.RegisterType<PremiumPaybackPayment>();
            builder.RegisterType<ProcessStagedPolicyIntegrationRequest>();
            builder.RegisterType<BulkSmsProccessingTask>();
            builder.RegisterType<CorporatePaymentFileTask>();
            builder.RegisterType<RollForwardBenefitPayrollTask>();
            builder.RegisterType<PolicyScheduleCommunicationTask>();



            ConsumeTheirServices(builder);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IFspeService>(AppNames.Integrations, AppPrefix.Fspe);
            builder.UseStatelessService<IPolicyMonitoringService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IBrokerageService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<IRolePlayerPolicyService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IPremiumListingPolicyPremiumMovementService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<ILeadService>(AppNames.ClientCare, AppPrefix.Lead);
            builder.UseStatelessService<IPremiumListingService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IConsolidatedFuneralService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IMyValuePlusService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IQLinkService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IDeclarationService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<IMemberService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<IIndustryClassService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ILifeExtensionService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPolicyCommunicationService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPolicyIntegrationService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<ISendSmsService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IPolicyReportService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IGroupRiskPolicyCaseService>(AppNames.ClientCare, AppPrefix.Policy);
        }
    }
}