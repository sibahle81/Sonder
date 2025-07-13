using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.AdjudicateNotificationEvents;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.AdjudicateSTP;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.AutoAcknowledgeAccidentClaim;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.AutoAcknowledgeDiseaseClaim;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.AutoCloseStpClaim;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.ConsoleWriter;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.DocumentsFollowUp;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.FollowUpEmail;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.InternalClaimsDocumentsFollowUp;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.MmiHcpReminders;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.ReOpenSection40CompCareClaimsAndSQ;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.ResubmitUnprocessedSTMRequests;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.ResubmitVopdRequests;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.SendAcknowledgementNotifications;
using RMA.Service.ClaimCare.ScheduledTasks.Tasks.WorkPoolSLA;


namespace RMA.Service.ClaimCare.ScheduledTasks
{
    public class ServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<ClaimCareConsoleWriterTask>();
            builder.RegisterType<ScheduledNotificationForOverDueSLA>();
            builder.RegisterType<ScheduledNotificationForFollowUpTask>();
            builder.RegisterType<ScheduledNotificationForDocumentsFollowUpTask>();
            builder.RegisterType<AdjudicateNotificationOnlyEventsTask>();
            builder.RegisterType<AdjudicateSTPTask>();
            builder.RegisterType<SendAcknowledgementNotificationsTask>();
            builder.RegisterType<AutoCloseStpClaimTask>();
            builder.RegisterType<ResubmitVopdRequests>();
            builder.RegisterType<ResubmitUnprocessedSTMRequestsTask>();
            builder.RegisterType<ReOpenSection40CompCareClaimsAndSQTask>();
            builder.RegisterType<ScheduledDocumentFollowUpTasks>();
            builder.RegisterType<AutoAcknowledgeDiseaseClaimTask>();
            builder.RegisterType<AutoAcknowledgeAccidentClaimTask>();
            builder.RegisterType<MmiHcpReminderTask>();            
            ConsumeTheirServices(builder);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimCommunicationService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IAccidentService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IDiseaseService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IEventService>(AppNames.ClaimCare, AppPrefix.Event);
        }
    }
}
