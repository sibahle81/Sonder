using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Interfaces.Commissions;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.FinCare.ScheduledTasks.Tasks.AbilityPosting;
using RMA.Service.FinCare.ScheduledTasks.Tasks.Billing;
using RMA.Service.FinCare.ScheduledTasks.Tasks.Commissions;
using RMA.Service.FinCare.ScheduledTasks.Tasks.ConsoleWriter;
using RMA.Service.FinCare.ScheduledTasks.Tasks.Payments;

namespace RMA.Service.FinCare.ScheduledTasks
{
    public class ServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<FinCareConsoleWriterTask>();
            builder.RegisterType<FinCareSubmitPaymentsTask>();
            builder.RegisterType<FinCareProcessBankStatementsTask>();
            builder.RegisterType<GenerateAnnualGroupInvoicesTask>();
            builder.RegisterType<GenerateAnnualInvoicesTask>();
            builder.RegisterType<GenerateMonthlyGroupInvoicesTask>();
            builder.RegisterType<GenerateMonthlyInvoicesTask>();
            builder.RegisterType<AssignInvoiceNumbersTask>();
            builder.RegisterType<FinCarePostToAbilityTask>();
            builder.RegisterType<FinCareProcessPaymentstoPostTask>();
            builder.RegisterType<GenerateCollectionsTask>();
            builder.RegisterType<SubmitCollectionsTask>();
            builder.RegisterType<ProcessBankStatementsTask>();
            builder.RegisterType<ProcessExternalDebitOrdersTask>();
            builder.RegisterType<ProcessEFTPaymentsTask>();
            builder.RegisterType<ProcessCFPPaymentsTask>();
            builder.RegisterType<ProcessClaimRecoveryEFTPaymentsTask>();
            builder.RegisterType<ProcessAbilityPostingItemsTask>();
            builder.RegisterType<PostCollectionToAbilityTask>();
            builder.RegisterType<SendGroupInvoicesTask>();
            builder.RegisterType<SendCoidInvoicesTask>();
            builder.RegisterType<SendCoidCreditNotesTask>();
            builder.RegisterType<RunCommissionsTask>();
            builder.RegisterType<FitAndProperCheckTask>();
            builder.RegisterType<AutoSendCommissionStatementsTask>();
            builder.RegisterType<ProcessTransactionsForGeneralLedgerTask>();
            builder.RegisterType<GenerateQuarterlyGroupInvoicesTask>();
            builder.RegisterType<GenerateQuarterlyInvoicesTask>();
            builder.RegisterType<GenerateBiAnnualGroupInvoicesTask>();
            builder.RegisterType<GenerateBiAnnualInvoicesTask>();
            builder.RegisterType<DuplicateInvoiceMonitorTask>();
            builder.RegisterType<BankStatementImportMonitorTask>();
            builder.RegisterType<CancelledPolicyInvoicesMonitorTask>();
            builder.RegisterType<RaiseInterestOnOverDueInvoicesTask>();
            builder.RegisterType<ProcessPremiumListingCreditNoteTask>();
            builder.RegisterType<AdjustInterestForBudgetedDeclarationsTask>();
            builder.RegisterType<MonitorBankStatementImportFailuresTask>();
            builder.RegisterType<TermsArrangementsInadequatePaymentTask>();
            builder.RegisterType<TermsArrangementsMissedPaymentsTask>();
            builder.RegisterType<GenerateLetterOfGoodStandingForTermsTask>();
            builder.RegisterType<TermsArrangementsMissedPaymentsStatusUpdateTask>();
            builder.RegisterType<TermsArrangementsInadequatePaymentRoleUpdateTask>();
            builder.RegisterType<TermArrangementMissedTwoPaymentsTask>();
            builder.RegisterType<RaiseInterestForUnpaidInvoicesForDefaultedTermsTask>();
            builder.RegisterType<SendLogsForAllocatedInvoicesTask>();
            builder.RegisterType<ProcessQueuedInvoicesAndCreditNotesTask>();
            builder.RegisterType<ProcessQueuedFuneralInvoicesAndCreditNotesTask>();
            builder.RegisterType<OpenPeriodTask>();
            builder.RegisterType<FinCareSendRemittanceExceptionReportTask>();
            builder.RegisterType<NotActionedTermsDiscardTask>();
            builder.RegisterType<FinCareSendRefundReportTask>();
            builder.RegisterType<ImportMissingBankStatementTask>();
            builder.RegisterType<ProcessPaymentLookupReferencesTask>();
            builder.RegisterType<EarnedIncomeTask>();
            builder.RegisterType<TermsArrangementsIncompleteApplicationsTask>();
            builder.RegisterType<TermsArrangementsPaymentsDueSoonRemindersTask>();
            builder.RegisterType<GenerateBrokerPaymentScheduleTask>();
            builder.RegisterType<ProcessExternalLifeDebitOrdersTask>();
            builder.RegisterType<BulkAllocationLogsTask>();
            ConsumeTheirServices(builder);
        }
        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IPaymentService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IClaimRecoveryInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IAbilityPostingService>(AppNames.FinCare, AppPrefix.Finance);
            builder.UseStatelessService<ICollectionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IAbilityCollectionsService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ICommissionService>(AppNames.FinCare, AppPrefix.Commissions);
            builder.UseStatelessService<IIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IProductOptionService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IAbilityTransactionsAuditService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBillingService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IPaymentAllocationService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ITransactionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ITermsArrangementService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IStatementService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IPeriodService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPaymentCommunicationService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IPaymentCreatorService>(AppNames.Finance, AppPrefix.Payments);
            builder.UseStatelessService<IPaymentAllocationLookupService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IBrokerPaymentScheduleService>(AppNames.Billing, AppPrefix.Billing);
        }
    }
}