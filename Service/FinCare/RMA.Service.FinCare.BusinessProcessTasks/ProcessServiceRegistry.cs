using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.FinCare.BusinessProcessTasks.BadDebtWriteOff;
using RMA.Service.FinCare.BusinessProcessTasks.CollectionRejectionNotifications;
using RMA.Service.FinCare.BusinessProcessTasks.InterBankTransfer;
using RMA.Service.FinCare.BusinessProcessTasks.InterDebtorTransfer;
using RMA.Service.FinCare.BusinessProcessTasks.InterestAdjustment;
using RMA.Service.FinCare.BusinessProcessTasks.InterestIndicator;
using RMA.Service.FinCare.BusinessProcessTasks.InterestReversal;
using RMA.Service.FinCare.BusinessProcessTasks.PaymentReversal;
using RMA.Service.FinCare.BusinessProcessTasks.TermsArrangement;
using RMA.Service.FinCare.BusinessProcessTasks.TermsArrangementsInadequatePayment;
using RMA.Service.FinCare.BusinessProcessTasks.TermsArrangementsMissedPayments;
using RMA.Service.FinCare.BusinessProcessTasks.TermsInitiationNotification;
using RMA.Service.FinCare.BusinessProcessTasks.TermsTwoMissedPayments;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using Module = Autofac.Module;

namespace RMA.Service.FinCare.BusinessProcessTasks
{
    public class ProcessServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            ConsumeTheirServices(builder);

            builder.RegisterType<AdhocCollection.AdhocCollectionWizard>().Named<IWizardProcess>("adhoc-collection");
            builder.RegisterType<Refund.RefundWizard>().Named<IWizardProcess>("refund");
            builder.RegisterType<CreditNote.CreditNoteWizard>().Named<IWizardProcess>("credit-note");
            builder.RegisterType<CollectionAssignment.CollectionAssignmentWizard>().Named<IWizardProcess>("collection-assignment");
            builder.RegisterType<Reallocation.ReallocationWizard>().Named<IWizardProcess>("reallocation");
            builder.RegisterType<CreditNoteReversal.CreditNoteReversalWizard>().Named<IWizardProcess>("credit-note-reversal");
            builder.RegisterType<Notification.NotificationTask>().Named<IWizardProcess>("fincare-notification");
            builder.RegisterType<InterBankNotification.InterBankSubmittedNotificationTask>().Named<IWizardProcess>("inter-bank-submitted-notification");
            builder.RegisterType<InterBankNotification.InterBankCompletedNotificationTask>().Named<IWizardProcess>("inter-bank-complete-notification");
            builder.RegisterType<ClaimantRecovery.ClaimantRecoveryWizard>().Named<IWizardProcess>("claimant-recovery-approval");
            builder.RegisterType<InterDebtorTransferWizard>().Named<IWizardProcess>("inter-debtor-transfer");
            builder.RegisterType<InterBankTransferWizard>().Named<IWizardProcess>("inter-bank-transfer");
            builder.RegisterType<CollectionRejectedNotificationTask>().Named<IWizardProcess>("collection-rejected-notification");
            builder.RegisterType<CollectionBankingUpdatedNotificationTask>().Named<IWizardProcess>("collection-banking-updated-notification");
            builder.RegisterType<TermsArrangementWizard>().Named<IWizardProcess>("terms-arrangement");
            builder.RegisterType<CreditNoteDebitReversal.CreditNoteDebitReversalWizard>().Named<IWizardProcess>("credit-note-debit-reversal");
            builder.RegisterType<InterestReversalWizard>().Named<IWizardProcess>("interest-reversal");
            builder.RegisterType<TermsArrangementsInadequatePaymentWizard>().Named<IWizardProcess>("terms-arrangements-inadequate-payment");
            builder.RegisterType<TermsArrangementsMissedPaymentsWizard>().Named<IWizardProcess>("terms-arrangements-missed-payments");
            builder.RegisterType<TermsInitiationNotificationWizard>().Named<IWizardProcess>("terms-unsuccessful-notification");
            builder.RegisterType<TermArrangementTwoMissedPaymentsWizard>().Named<IWizardProcess>("terms-arrangements-two-missed-payments");
            builder.RegisterType<PaymentReversalWizard>().Named<IWizardProcess>("payment-reversal-wizard");
            builder.RegisterType<InterestAdjustmentWizard>().Named<IWizardProcess>("interest-adjustment");
            builder.RegisterType<BadDebtWriteOffWizard>().Named<IWizardProcess>("debtor-debt-writeoff");
            builder.RegisterType<InterestIndicatorWizard>().Named<IWizardProcess>("interest-indicator");
            builder.RegisterType<ManageGroupRiskBilling.ManageGroupRiskBilling>().Named<IWizardProcess>("manage-grouprisk-billing");
        }


        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IBillingService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IStatementService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ICollectionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ITransactionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IPaymentCreatorService>(AppNames.FinCare, AppPrefix.Payments);
            builder.UseStatelessService<IAgeAnalysisService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IInterBankTransferService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IInterDebtorTransferService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IInvoiceLineItemService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IPaymentAllocationService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IClaimRecoveryInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ISendEmailService>(AppNames.Admin, AppPrefix.CampaignManager);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPolicyNoteService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<ITermsArrangementService>(AppNames.Billing, AppPrefix.Billing);
        }
    }
}
