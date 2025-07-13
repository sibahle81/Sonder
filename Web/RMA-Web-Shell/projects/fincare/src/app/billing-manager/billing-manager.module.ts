import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { FrameworkModule } from 'src/app/framework.module';
import { PublicHolidayDataSource } from 'projects/admin/src/app/configuration-manager/views/public-holidays/public-holidays.datasource';
import { PublicHolidayService } from 'projects/admin/src/app/configuration-manager/shared/public-holiday.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { BillingManagerRoutingModule } from './billing-manager-routing.module';
import { BillingHomeComponent } from './views/billing-home/billing-home.component';
import { BillingLayoutComponent } from './views/billing-layout/billing-layout.component';
import { SearchModule } from 'projects/clientcare/src/app/shared/search/search.module';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { ContactService } from 'projects/clientcare/src/app/client-manager/shared/services/contact.service';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { AddressService } from 'projects/clientcare/src/app/client-manager/shared/services/address.service';
import { ClientCoverService } from 'projects/clientcare/src/app/policy-manager/shared/Services/client-cover.service';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { BankAccountService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account.service';
import { SendEmailService } from 'projects/shared-services-lib/src/lib/services/email-request/send-email.service';
import { BankAccountTypeService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account-type.service';
import { CollectionsService } from './services/collections.service';
import { ManualAlloactionUnallocatedPaymentsComponent } from './views/manual-allocation/manual-alloaction-unallocated-payments/manual-alloaction-unallocated-payments.component';
import { AutoAllocationUnallocatedPaymentsComponent } from './views/auto-allocation/auto-allocation-unallocated-payments/auto-allocation-unallocated-payments.component';
import { ManualAllocationAllocatePaymentComponent } from './views/manual-allocation/manual-allocation-allocate-payment/manual-allocation-allocate-payment.component';
import { InvoiceDetailsComponent } from './views/invoice-details/invoice-details.component';
import { InvoiceSearchComponent } from './views/invoice-search/invoice-search.component';
import { AdhocCollectionWizard } from './wizards/adhoc-collection-wizard';
import { NotificationWizard } from './wizards/notification-wizard';
import { InvoiceService } from '../shared/services/invoice.service';
import { DebitOrderCollectionListComponent } from './views/debit-order-collection-list/debit-order-collection-list.component';
import { AgeAnalysisComponent } from './views/age-analysis/age-analysis.component';
import { RefundWizard } from './wizards/refund-wizard';
import { RefundComponent } from './views/refund/refund/refund.component';
import { StatementDetailsComponent } from './views/statement-details/statement-details.component';
import { CreditNoteComponent } from './views/credit-note/credit-note/credit-note.component';
import { AccountService } from '../shared/services/account.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { CreditNoteWizard } from './wizards/credit-note-wizard';
import { TransactionalStatementComponent } from './views/transactional-statement/transactional-statement.component';
import { AgeAnalysisService } from '../shared/services/age-analysis.service';
import { AgeAnalysisNotesComponent } from './views/age-analysis-notes/age-analysis-notes.component';
import { RefundListComponent } from './views/refund/refund-list/refund-list.component';
import { AbilityCollectionsAuditComponent } from './views/ability-collections-audit/ability-collections-audit.component';
import { AbilityCollectionsComponent } from './views/ability-collections/ability-collections.component';
import { AbilityCollectionsListGroupComponent } from './views/ability-collections-list-group/ability-collections-list-group.component';
import { AbilityCollectionsListGroupDatasource } from './views/ability-collections-list-group/ability-collections-list-group.datasource';
import { AbilityCollectionsService } from '../shared/services/ability-collections.service';
import { AbilityCollectionsDatasource } from './views/ability-collections/ability-collections.datasource';
import { AbilityCollectionsAuditDatasource } from './views/ability-collections-audit/ability-collections-audit.datasource';
import { ProductCrossRefTranTypeService } from 'projects/admin/src/app/configuration-manager/shared/productCrossRefTranType.service';
import { InterBankTransfersComponent } from './views/inter-bank-transfers/inter-bank-transfers.component';
import { CollectionDialogComponent } from './views/collection-dialog/collection-dialog.component';
import { CollectionsComponent } from './views/collections/collections.component';
import { CollectionsDataSource } from './views/collections/collections.datasource';
import { CollectionAssignmentComponent } from './views/collection-assignment/collection-assignment.component';
import { OverdueAccountsWizard } from './wizards/overdue-accounts-wizard';
import { InterBankSubmittedNotificationWizard } from './wizards/inter-bank-submitted-notification-wizard';
import { InterBankCompletedNotificationWizard } from './wizards/inter-bank-completed-notification-wizard';
import { ViewDocumentsComponent } from './views/view-documents/view-documents.component';
import { CreditNoteFindAccountComponent } from './views/credit-note/credit-note-find-account/credit-note-find-account.component';
import { StatementAccountSearchComponent } from './views/statement-account-search/statement-account-search.component';
import { TransactionHistoryComponent } from './views/transaction-history/transaction-history.component';
import { TransactionDataSource } from './views/transaction-history/transaction-history.datasource';
import { UploadCollectionAgentsComponent } from './views/upload-collection-agents/upload-collection-agents.component';
import { ViewDebtorComponent } from './views/view-debtor/view-debtor.component';
import { InsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/insured-life.service';
import { UnpaidInvoiceReportComponent } from './views/unpaid-invoice-report/unpaid-invoice-report.component';
import { InactivePoliciesReportComponent } from './views/inactive-policies-report/inactive-policies-report.component';
import { InactivePoliciesDatasource } from './views/inactive-policies-report/inactive-policies-report.datasource';
import { DebitOrderReportComponent } from './views/debit-order-report/debit-order-report.component';
import { DebitOrderReportDatasource } from './views/debit-order-report/debit-order-report.datasource';
import { TransactionsRefundComponent } from './views/transactions-refund/transactions-refund.component';
import { UnallocatedPaymentsComponent } from './views/unallocated-payments/unallocated-payments.component';
import { AllocatedPaymentsComponent } from './views/allocated-payments/allocated-payments.component';
import { AllocatedPaymentsDatasource } from './views/allocated-payments/allocated-payments.datasource';
import { StatementAnalysisComponent } from './views/statement-analysis/statement-analysis.component';
import { StatementAnalysisDatasource } from './views/statement-analysis/statement-analysis.datasource';
import { ReAlloctionComponent } from './views/manual-allocation/re-allocation/re-alloction/re-alloction.component';
import { CreditNoteReallocationWizard } from './wizards/credit-note-reallocation-wizard';
import { TransactionReversalComponent } from './views/transaction-reversal/transaction-reversal.component';
import { SearchDebtorDialogComponent } from './views/search-debtor-dialog/search-debtor-dialog.component';
import { SeachDebtorComponent } from './views/seach-debtor/seach-debtor.component';
import { InterDebtorTransferWizard } from './wizards/inter-debtor-transfer-wizard';
import { InterBankTransferService } from './services/interbanktransfer.service';
import { InterDebtorTransferService } from './services/interdebtortransfer.service';
import { CreditNoteReversalDetailsComponent } from './views/credit-note-reversal-details/credit-note-reversal-details.component';
import { CreditNoteReversalDocumentsComponent } from './views/credit-note-reversal-documents/credit-note-reversal-documents.component';
import { CreditNoteReversalNotesComponent } from './views/credit-note-reversal-notes/credit-note-reversal-notes.component';
import { CreditNoteReversalWizard } from './wizards/credit-note-reversal-wizard';
import { DocumentsComponent } from './views/documents/documents.component';
import { InterDebtorTransfersCaptureDataSource } from './views/inter-debtor-transfers/inter-debtor-transfers-capture.datasource';
import { InterDebtorTransfersApprovalComponent } from './views/inter-debtor-transfers/inter-debtor-transfers-approval/inter-debtor-transfers-approval.component';
import { InterDebtorTransfersCaptureComponent } from './views/inter-debtor-transfers/inter-debtor-transfers-capture.component';
import { CreditNoteReallocationNotesComponent } from './views/credit-note-reallocation-notes/credit-note-reallocation-notes.component';
import { RefundDocumentComponent } from './views/refund-document/refund-document.component';
import { ConfirmPremiumReceivedComponent } from './views/confirm-premium-received/confirm-premium-received.component';
import { AmountDetailsComponent } from './views/confirm-premium-received/amount-details-dialog/amount-details.component';
import { InterDebtorTransferNotesComponent } from './views/interdebtortransfer-notes/interdebtortransfer-notes.component';
import { InterDebtorTransferDocumentsComponent } from './views/inter-debtor-transfer-documents/inter-debtor-transfer-documents.component';
import { InterBankTransfersApprovalComponent } from './views/inter-bank-transfers/inter-bank-transfers-approval/inter-bank-transfers-approval.component';
import { InterBankTransferNotesComponent } from './views/interbanktransfer-notes/interbanktransfer-notes.component';
import { InterBankTransferWizard } from './wizards/inter-bank-transfer-wizard';
import { InterBankTransferDocumentsComponent } from './views/inter-bank-transfer-documents/inter-bank-transfer-documents.component';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { SalesDistributionReportComponent } from './views/sales-distribution-report/sales-distribution-report.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { MonthlyNewBusinessReportComponent } from './views/monthly-new-business-report/monthly-new-business-report.component';
import { CancelledBusinessReportComponent } from './views/cancelled-business-report/cancelled-business-report.component';
import { BillingNotesComponent } from './views/billing-notes/billing-notes.component';
import { BillingService } from './services/billing.service';
import { NoteDialogComponent } from './views/billing-notes/dialog/dialog.component';
import { InvoiceAuditReportComponent } from './views/invoice-audit-report/invoice-audit-report.component';
import { TransactionViewDialogComponent } from './views/transaction-view-dialog/transaction-view-dialog.component';
import { InterdebtorTransferAuditReportComponent } from './views/interdebtor-transfer-audit-report/interdebtor-transfer-audit-report.component';
import { AdhocPaymentAuditComponent } from './views/adhoc-payment-audit/adhoc-payment-audit.component';
import { InterBankTransferAuditReportComponent } from './views/inter-bank-transfer-audit-report/inter-bank-transfer-audit-report.component';
import { DashboardNoteComponent } from './views/dashboard-note/dashboard-note.component';
import { BalanceRemainingComponent } from './views/manual-allocation/manual-allocation-allocate-payment/balace-remaining-dialog/balance-remaining.component';
import { ConcurrentPeriodComponent } from './views/concurrent-period/concurrent-period/concurrent-period.component';
import { PaymentRefundListComponent } from './views/payment-refund-list/payment-refund-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RefundPaymentAuditComponent } from './views/refund-payment-audit/refund-payment-audit.component';
import { RefundPaymentAuditLogComponent } from './views/refund-payment-audit-log/refund-payment-audit-log.component';
import { DebitTransactionAllocationLinkComponent } from './views/manual-allocation/manual-allocation-allocate-payment/debit-transaction-allocation-link/debit-transaction-allocation-link.component';
import { RefundPaymentDialogComponent } from './views/refund-payment-dialog/refund-payment-dialog.component';
import { CollectionRejectedNotificationWizard } from './wizards/collection-rejected-notification-wizard';
import { CollectionBankingUpdatedNotificationWizard } from './wizards/collection-banking-updated-notification-wizard';
import { ViewAllDocumentsComponent } from './views/view-all-documents/view-all-documents.component';
import { EuropAssistPremiumsComponent } from './views/europ-assist-premiums/europ-assist-premiums.component';
import { EuropAssistPremiumsDatasource } from './views/europ-assist-premiums/europ-assist-premiums.datasource';
import { TermsArrangementListComponent } from './views/terms-arrangement-list/terms-arrangement-list.component';
import { TermsArrangementWizard } from './wizards/terms-arrangement-wizard';
import { TermsArrangementEligibilityCheckComponent } from './views/terms-arrangement/terms-arrangement-eligibility-check/terms-arrangement-eligibility-check.component';
import { TermsArrangementNotesComponent } from './views/terms-arrangement/terms-arrangement-notes/terms-arrangement-notes.component';
import { TermsArrangementDocumentsComponent } from './views/terms-arrangement/terms-arrangement-documents/terms-arrangement-documents.component';
import { TermsArrangementService } from './services/terms-arrangement.service';
import { InvoiceDatasource } from './datasources/invoice.datasource';
import { NgxPaginationModule } from 'ngx-pagination';
import { InvoiceListComponent } from './views/invoice-list/invoice-list.component';
import { InterestReversalComponent } from './views/interest-reversal/interest-reversal.component';
import { ReverseConfirmationComponent } from './views/interest-reversal/reverse-confirmation/reverse-confirmation.component';
import { CreditNoteDebitReversalWizard } from './wizards/credit-note-debit-reversal-wizard';
import { CreditNoteDebitReversalComponent } from './views/credit-note-debit-reversal/credit-note-debit-reversal.component';
import { BulkManualAllocationsComponent } from './views/bulk-manual-allocations/bulk-manual-allocations.component';
import { BackDateInterestComponent } from './views/back-date-interest/back-date-interest.component';
import { DialogBackdateConfirmationComponent } from './views/back-date-interest/dialog-backdate-confirmation/dialog-backdate-confirmation.component';
import { UploadedFileDetailsComponent } from './views/bulk-manual-allocations/uploaded-file-details/uploaded-file-details.component';
import { UploadedFilesComponent } from './views/bulk-manual-allocations/uploaded-files/uploaded-files.component';
import { InterestReversalDetailsComponent } from './views/interest-reversal/interest-reversal-details/interest-reversal-details.component';
import { InterestReversalWizard } from './wizards/interest-reversal-wizard';
import { PolicyReclassificationRefundComponent } from './views/policy-reclassification-refund/policy-reclassification-refund.component';
import { ViewApprovalsComponent } from 'projects/shared-components-lib/src/lib/wizard/views/view-approvals/view-approvals.component';
import { CollectionAgeingComponent } from './views/collection-ageing/collection-ageing.component';
import { TermsArrangementInitiationComponent } from './views/terms-arrangement/terms-arrangement-initiation/terms-arrangement-initiation.component';
import { EarningsUptodateDialogComponent } from './views/terms-arrangement/earnings-uptodate-dialog/earnings-uptodate-dialog.component';
import { TermsArrangementCaptureComponent } from './views/terms-arrangement-capture/terms-arrangement-capture.component';
import { TermsConditionsDialogComponent } from './views/terms-arrangement/terms-conditions-dialog/terms-conditions-dialog.component';
import { TermsArrangementsInadequatePaymentWizard } from './wizards/TermsArrangementsInadequatePaymentWizard';
import { TermsArrangementsMissedPaymentsWizard } from './wizards/TermsArrangementsMissedPaymentsWizard';
import { TermsUnsuccessfulNotificationWizard } from './wizards/terms-unsuccessful-notification-wizard';
import { TermsArrangementDebtorDetailsComponent } from './views/terms-arrangement/terms-arrangement-debtor-details/terms-arrangement-debtor-details.component';
import { MemoOfAgreementComponent } from './views/terms-arrangement/memo-of-agreement/memo-of-agreement.component';
import { TermScheduleComponent } from './views/terms-arrangement/term-schedule/term-schedule.component';
import { TermsArrangementsTwoMissedPaymentsWizard } from './wizards/terms-arrangements-two-missed-payments';
import { TermSubsidiaryDialogComponent } from './views/terms-arrangement/term-subsidiary-dialog/term-subsidiary-dialog.component';
import { UploadedPaymentFilesComponent } from './views/bulk-payment-allocations/uploaded-payment-files/uploaded-payment-files.component'
import { UploadedPaymentFileDetailsComponent } from './views/bulk-payment-allocations/uploaded-payment-file-details/uploaded-payment-file-details.component'
import { TermScheduleCaptureComponent } from './views/terms-arrangement/term-schedule-capture/term-schedule-capture.component';
import { AdhocInterestCalculationComponent } from './views/adhoc-interest_calculation/adhoc-interest_calculation.component';
import { InterestCalculationListComponent } from './views/interest-calculation-list/interest-calculation-list.component';
import { AdhocInterestWizard } from './wizards/adhoc-interest-wizard';
import { BulkPaymentAllocationsComponent } from './views/bulk-payment-allocations/bulk-payment-allocations.component';
import { InterestAdjustmentComponent } from './views/interest-adjustment/interest-adjustment.component';
import { AdjustmentAmountDialogComponent } from './views/adjustment-amount-dialog/adjustment-amount-dialog.component';
import { AdhocInterestMonthsDialogComponent } from './views/adhoc-interest-months-dialog/adhoc-interest-months-dialog.component';
import { ConfirmWriteOffComponent } from './views/write-offs/confirm-write-off/confirm-write-off.component';
import { InterestReinstateComponent } from './views/reinstate/interest-reinstate/interest-reinstate.component';
import { PremiumReinstateComponent } from './views/reinstate/premium-reinstate/premium-reinstate.component';
import { ConfirmReinstateComponent } from './views/reinstate/confirm-reinstate/confirm-reinstate.component';
import { BadDebtWriteOffComponent } from './views/write-offs/bad-debt-write-off/bad-debt-write-off.component';
import { MemberLetterOfGoodStandingComponent } from './views/member-letter-of-good-standing/member-letter-of-good-standing.component';
import { BadDebtReinstateComponent } from './views/reinstate/bad-debt-reinstate/bad-debt-reinstate.component';
import { FailedExceptionAllocationsComponent } from './views/failed-exception-allocations/failed-exception-allocations.component';
import { ExceptionFileDetailsComponent } from './views/failed-exception-allocations/exception-file-details/exception-file-details.component';
import { ExceptionFilesComponent } from './views/failed-exception-allocations/exception-files/exception-files.component';
import { InterstAdjustmentDetailsComponent } from './views/interst-adjustment-details/interst-adjustment-details.component';
import { InterestAdjustmentWizard } from './wizards/interest-adjustment-wizard';
import { DebtorNotesComponent } from './views/notes/debtor-notes/debtor-notes.component';
import { DebtorNoteAddDialogComponent } from './views/notes/debtor-note-add-dialog/debtor-note-add-dialog.component';
import { DebtorAuditComponent } from './views/debtor-audit/debtor-audit.component';
import { CreditNoteListComponent } from './views/credit-note/credit-note-list/credit-note-list.component';
import { CreditNoteDetailComponent } from './views/credit-note/credit-note/credit-note-detail/credit-note-detail.component';
import { CreateAdhocDebitComponent } from './views/collections/create-adhoc-debit/create-adhoc-debit.component';
import { DebtorPoliciesComponent } from './views/debtor-policies/debtor-policies.component';
import { DebitOrderInfoDialogComponent } from './views/debit-order-report/debit-order-info-dialog/debit-order-info-dialog.component';
import { BundleRaiseDetailsComponent } from './views/bundle-raise/bundle-raise-details/bundle-raise-details.component';
import { BundleRaiseCollectionsComponent } from './views/bundle-raise/bundle-raise-collections/bundle-raise-collections.component';
import { UnallocatedPaymentDetailsDialogComponent } from './views/unallocated-payments/unallocated-payment-details-dialog/unallocated-payment-details-dialog.component';
import { AbilityCollectionsDetailsDialogComponent } from './views/ability-collections/ability-collections-details-dialog/ability-collections-details-dialog.component';
import { AllocatedPaymentsDetailsDialogComponent } from './views/allocated-payments/allocated-payments-details-dialog/allocated-payments-details-dialog.component';
import { OpenTransactionsComponent } from './views/transaction-history/open-transactions/open-transactions.component';
import { InterBankTransfersMainComponent } from './views/inter-bank-transfers/inter-bank-transfers-main/inter-bank-transfers-main.component';
import { InterBankTransfersFromDebtorsComponent } from './views/inter-bank-transfers/inter-bank-transfers-from-debtors/inter-bank-transfers-from-debtors.component';
import { WriteOffDetailsComponent } from './views/write-offs/write-off-details/write-off-details.component';
import { BadDebtWriteOffWizard } from './wizards/bad-debt-writeoff-wizard';
import { BadDebtReinstateDetailsComponent } from './views/reinstate/bad-debt-reinstate-details/bad-debt-reinstate-details.component';
import { PremiumPaybackWizard } from './wizards/premium-payback-wizard';
import { TermScheduleListComponent } from './views/terms-arrangement/term-schedule-list/term-schedule-list.component';
import { AutoAllocationConfigurationComponent } from './views/manual-allocation/auto-allocation-configuration/auto-allocation-configuration.component';
import { TermArrangementReassessmentComponent } from './views/terms-arrangement/term-arrangement-reassessment/term-arrangement-reassessment.component';
import { InterestIndicatorWizard } from './wizards/InterestIndicator/interest-indicator-wizard';
import { InterestIndicatorWizardStepComponent } from './wizards/InterestIndicator/steps/interest-indicator-wizard-step/interest-indicator-wizard-step.component';
import { InterestIndicatorComponent } from './views/transaction-history/interest-indicator/interest-indicator.component';
import { TermArrangementAdhocPaymentInstructionsDialogComponent } from './views/terms-arrangement/term-arrangement-adhoc-payment-instructions-dialog/term-arrangement-adhoc-payment-instructions-dialog.component';
import { RefundPartialDialogComponent } from './views/transactions-refund/refund-partial-dialog/refund-partial-dialog.component';
import { DialogHeaderComponent } from './views/dialog-header/dialog-header.component';
import { BillingUploadsComponent } from './views/billing-uploads/billing-uploads.component';
import { UploadPremiumTransactionComponent } from './views/upload-premium-transaction/upload-premium-transaction.component';
import { ListReferenceLookupsComponent } from './views/auto-allocation/list-reference-lookups/list-reference-lookups.component';
import { ChildAllocationResultsComponent } from './views/child-allocation-results/child-allocation-results.component';
import { ChildAllocationReconComponent } from './views/child-allocation-recon/child-allocation-recon.component';
import {MaintainGroupRiskBillingComponent} from "./views/maintain-group-risk-billing/maintain-group-risk-billing.component";
import {GroupRiskPayrollDetailComponent} from "./views/group-risk-payroll-detail/group-risk-payroll-detail.component";
import { GroupRiskDebtorSearchComponent } from './views/group-risk-billing/group-risk-debtor-search/group-risk-debtor-search.component';
import { GroupRiskPolicyBillingWizard } from './wizards/grouprisk-policy-billing-wizard';
import {
  GroupRiskBillingPayrollDetailViewComponent
} from "./views/group-risk-billing-payroll-detail-view/group-risk-billing-payroll-detail-view.component";
import { UploadNewListComponent } from './views/write-offs/bulk-write-offs/upload-new-list/upload-new-list.component';
import { UploadedWriteOffFilesComponent } from './views/write-offs/bulk-write-offs/uploaded-files/uploaded-write-off-files.component';
import { UploadedWriteOffFileDetailsComponent } from './views/write-offs/bulk-write-offs/uploaded-file-details/uploaded-write-off-file-details.component';
import { PagedCalculatedInterestSearchComponent } from './views/interest/calculate-interest/paged-calculated-interest-search.component';
import { ValidatePaymentFilesComponent } from './views/validate-payment-files/validate-payment-files.component';
import { BulkDebtorHandoverUploadComponent } from './views/bulk-debtor-handover/bulk-debtor-handover-upload.component';
import { LegalReconReportComponent } from './views/bulk-debtor-handover/recon-report/legal-recon-report/legal-recon-report.component';
import { HandedReconUploadComponent } from './views/bulk-debtor-handover/recon/handed-recon-upload/handed-recon-upload.component';
import { InterPolicyDebtorTransfersComponent } from './views/inter-policy-debtor-transfers/inter-policy-debtor-transfers.component';
import { AllocatePaymentToPolicyComponent } from './views/manual-allocation/allocate-payment-to-policy/allocate-payment-to-policy.component';
import { PolicyPaymentListComponent } from './views/manual-allocation/policy-payment-list/policy-payment-list.component';
import { PolicyPaymentListDialogComponent } from './views/manual-allocation/policy-payment-list-dialog/policy-payment-list-dialog.component';

@NgModule({
  imports: [
    FrameworkModule,
    BillingManagerRoutingModule,
    ClientCareSharedModule,
    SearchModule,
    SharedModule,
    WizardModule,
    SharedComponentsLibModule,
    NgxPaginationModule,
  ],
  declarations: [
    BillingHomeComponent,
    BillingLayoutComponent,
    ManualAlloactionUnallocatedPaymentsComponent,
    AutoAllocationUnallocatedPaymentsComponent,
    InvoiceDetailsComponent,
    ManualAllocationAllocatePaymentComponent,
    InvoiceSearchComponent,
    DebitOrderCollectionListComponent,
    AgeAnalysisComponent,
    RefundComponent,
    StatementDetailsComponent,
    CreditNoteComponent,
    TransactionalStatementComponent,
    AgeAnalysisNotesComponent,
    RefundListComponent,
    InterBankTransfersMainComponent,
    InterBankTransfersComponent,
    InterBankTransfersFromDebtorsComponent,
    AbilityCollectionsAuditComponent,
    AbilityCollectionsComponent,
    AbilityCollectionsListGroupComponent,
    CollectionsComponent,
    CollectionDialogComponent,
    CollectionAssignmentComponent,
    ViewDocumentsComponent,
    CreditNoteFindAccountComponent,
    StatementAccountSearchComponent,
    UploadCollectionAgentsComponent,
    ViewDebtorComponent,
    TransactionHistoryComponent,
    InactivePoliciesReportComponent,
    DebitOrderReportComponent,
    UnpaidInvoiceReportComponent,
    TransactionsRefundComponent,
    UnallocatedPaymentsComponent,
    AllocatedPaymentsComponent,
    StatementAnalysisComponent,
    ReAlloctionComponent,
    SearchDebtorDialogComponent,
    TransactionReversalComponent,
    SeachDebtorComponent,
    InterDebtorTransfersCaptureComponent,
    InterDebtorTransfersApprovalComponent,
    CreditNoteReversalDetailsComponent,
    CreditNoteReversalDocumentsComponent,
    CreditNoteReversalNotesComponent,
    DocumentsComponent,
    CreditNoteReallocationNotesComponent,
    RefundDocumentComponent,
    ConfirmPremiumReceivedComponent,
    AmountDetailsComponent,
    InterDebtorTransferNotesComponent,
    InterDebtorTransferDocumentsComponent,
    InterBankTransfersApprovalComponent,
    InterBankTransferDocumentsComponent,
    InterBankTransferNotesComponent,
    SalesDistributionReportComponent,
    MonthlyNewBusinessReportComponent,
    CancelledBusinessReportComponent,
    BillingNotesComponent,
    NoteDialogComponent,
    InvoiceAuditReportComponent,
    TransactionViewDialogComponent,
    InterdebtorTransferAuditReportComponent,
    AdhocPaymentAuditComponent,
    InterBankTransferAuditReportComponent,
    DashboardNoteComponent,
    BalanceRemainingComponent,
    ConcurrentPeriodComponent,
    PaymentRefundListComponent,
    RefundPaymentDialogComponent,
    RefundPaymentAuditComponent,
    RefundPaymentAuditLogComponent,
    BalanceRemainingComponent,
    ConcurrentPeriodComponent,
    DebitTransactionAllocationLinkComponent,
    ViewAllDocumentsComponent,
    EuropAssistPremiumsComponent,
    TermsArrangementListComponent,
    TermsArrangementNotesComponent,
    TermsArrangementEligibilityCheckComponent,
    TermsArrangementDocumentsComponent,
    InvoiceListComponent,
    InterestReversalComponent,
    ReverseConfirmationComponent,
    CreditNoteDebitReversalComponent,
    BulkManualAllocationsComponent,
    BackDateInterestComponent,
    DialogBackdateConfirmationComponent,
    UploadedFilesComponent,
    UploadedFileDetailsComponent,
    InterestReversalDetailsComponent,
    PolicyReclassificationRefundComponent,
    ViewApprovalsComponent,
    CollectionAgeingComponent,
    TermsArrangementInitiationComponent,
    EarningsUptodateDialogComponent,
    TermsArrangementCaptureComponent,
    TermsArrangementDebtorDetailsComponent,
    MemoOfAgreementComponent,
    TermScheduleComponent,
    TermsConditionsDialogComponent,
    TermSubsidiaryDialogComponent,
    UploadedPaymentFilesComponent,
    UploadedPaymentFileDetailsComponent,
    BulkPaymentAllocationsComponent,
    TermScheduleCaptureComponent,
    AdhocInterestCalculationComponent,
    InterestCalculationListComponent,
    InterestAdjustmentComponent,
    AdjustmentAmountDialogComponent,
    AdhocInterestMonthsDialogComponent,
    ConfirmWriteOffComponent,
    InterestReinstateComponent,
    PremiumReinstateComponent,
    ConfirmReinstateComponent,
    BadDebtWriteOffComponent,
    MemberLetterOfGoodStandingComponent,
    BadDebtReinstateComponent,
    FailedExceptionAllocationsComponent,
    ExceptionFileDetailsComponent,
    ExceptionFilesComponent,
    InterstAdjustmentDetailsComponent,
    DebtorNotesComponent,
    DebtorNoteAddDialogComponent,
    DebtorAuditComponent,
    CreditNoteListComponent,
    CreditNoteDetailComponent,
    CreateAdhocDebitComponent,
    DebtorPoliciesComponent,
    DebitOrderInfoDialogComponent,
    BundleRaiseDetailsComponent,
    BundleRaiseCollectionsComponent,
    UnallocatedPaymentDetailsDialogComponent,
    AbilityCollectionsDetailsDialogComponent,
    AllocatedPaymentsDetailsDialogComponent,
    OpenTransactionsComponent,
    WriteOffDetailsComponent,
    BadDebtReinstateDetailsComponent,
    TermScheduleListComponent,
    AutoAllocationConfigurationComponent,
    TermArrangementReassessmentComponent,
    InterestIndicatorComponent,
    InterestIndicatorWizardStepComponent,
    TermArrangementAdhocPaymentInstructionsDialogComponent,
    RefundPartialDialogComponent,
    DialogHeaderComponent,
    BillingUploadsComponent,
    UploadPremiumTransactionComponent,
    ListReferenceLookupsComponent,
    ChildAllocationResultsComponent,
    ChildAllocationReconComponent,
    MaintainGroupRiskBillingComponent,
    GroupRiskPayrollDetailComponent,
    GroupRiskDebtorSearchComponent,
    GroupRiskBillingPayrollDetailViewComponent,
    UploadNewListComponent,
    UploadedWriteOffFilesComponent,
    UploadedWriteOffFileDetailsComponent,
    PagedCalculatedInterestSearchComponent,
    ValidatePaymentFilesComponent,
    BulkDebtorHandoverUploadComponent,
    LegalReconReportComponent,
    HandedReconUploadComponent,
    InterPolicyDebtorTransfersComponent,
    AllocatePaymentToPolicyComponent,
    PolicyPaymentListComponent,
    PolicyPaymentListDialogComponent
  ],
  exports: [],
  entryComponents: [
    DebitOrderCollectionListComponent,
    CreditNoteComponent,
    AgeAnalysisNotesComponent,
    CollectionsComponent,
    CollectionDialogComponent,
    CollectionAssignmentComponent,
    TransactionsRefundComponent,
    SearchDebtorDialogComponent,
    DocumentsComponent,
    InterDebtorTransfersApprovalComponent,
    CreditNoteReversalNotesComponent,
    CreditNoteReallocationNotesComponent,
    InterDebtorTransferNotesComponent,
    AmountDetailsComponent,
    InterBankTransferNotesComponent,
    InterBankTransfersApprovalComponent,
    NoteDialogComponent,
    TransactionViewDialogComponent,
    BalanceRemainingComponent,
    RefundPaymentDialogComponent,
    RefundPaymentAuditLogComponent,
    RefundPaymentAuditComponent,
    DebitTransactionAllocationLinkComponent,
    TermsArrangementNotesComponent,
    TermsArrangementEligibilityCheckComponent,
    TermsArrangementDocumentsComponent,
    ReverseConfirmationComponent,
    DialogBackdateConfirmationComponent,
    EarningsUptodateDialogComponent,
    TermsConditionsDialogComponent,
    MemoOfAgreementComponent,
    TermScheduleComponent,
    TermSubsidiaryDialogComponent,
    TermScheduleCaptureComponent,
    AdhocInterestCalculationComponent,
    InterestCalculationListComponent,
    AdjustmentAmountDialogComponent,
    AdhocInterestMonthsDialogComponent,
    ConfirmReinstateComponent,
    ConfirmWriteOffComponent,
    DebtorNoteAddDialogComponent,
    TermScheduleListComponent,
    TermArrangementReassessmentComponent,
    InterestIndicatorComponent,
    InterestIndicatorWizardStepComponent,
    TermArrangementAdhocPaymentInstructionsDialogComponent,
    MaintainGroupRiskBillingComponent,
    GroupRiskPayrollDetailComponent,
    GroupRiskBillingPayrollDetailViewComponent
  ],
  providers: [
    CampaignService,
    ClientService,
    PublicHolidayDataSource,
    PublicHolidayService,
    WizardService,
    PolicyService,
    ContactService,
    ProductOptionService,
    AddressService,
    ClientCoverService,
    BankAccountService,
    BankAccountTypeService,
    SendEmailService,
    CollectionsService,
    InvoiceService,
    AccountService,
    RolePlayerService,
    AgeAnalysisService,
    AbilityCollectionsService,
    AbilityCollectionsDatasource,
    AbilityCollectionsAuditDatasource,
    AbilityCollectionsListGroupDatasource,
    ProductCrossRefTranTypeService,
    DatePipe,
    CollectionsDataSource,
    TransactionDataSource,
    InsuredLifeService,
    InactivePoliciesDatasource,
    DebitOrderReportDatasource,
    AllocatedPaymentsDatasource,
    EuropAssistPremiumsDatasource,
    StatementAnalysisDatasource,
    InterDebtorTransfersCaptureDataSource,
    InterBankTransferService,
    InterDebtorTransferService,
    PeriodService,
    BillingService,
    TermsArrangementService,
    InvoiceDatasource,
  ],
})
export class BillingManagerModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {

    // register the context factories used in the wizard controls
    contextFactory.addWizardContext(new NotificationWizard(componentFactoryResolver), 'fincare-notification');
    contextFactory.addWizardContext(new InterBankSubmittedNotificationWizard(componentFactoryResolver), 'inter-bank-submitted-notification');
    contextFactory.addWizardContext(new InterBankCompletedNotificationWizard(componentFactoryResolver), 'inter-bank-complete-notification');
    contextFactory.addWizardContext(new AdhocCollectionWizard(componentFactoryResolver), 'adhoc-collection');
    contextFactory.addWizardContext(new RefundWizard(componentFactoryResolver), 'refund');
    contextFactory.addWizardContext(new CreditNoteWizard(componentFactoryResolver), 'credit-note');
    contextFactory.addWizardContext(new OverdueAccountsWizard(componentFactoryResolver), 'collection-assignment');
    contextFactory.addWizardContext(new CreditNoteReallocationWizard(componentFactoryResolver), 'reallocation');
    contextFactory.addWizardContext(new CreditNoteReversalWizard(componentFactoryResolver), 'credit-note-reversal');
    contextFactory.addWizardContext(new InterDebtorTransferWizard(componentFactoryResolver), 'inter-debtor-transfer');
    contextFactory.addWizardContext(new InterBankTransferWizard(componentFactoryResolver), 'inter-bank-transfer');
    contextFactory.addWizardContext(new CollectionRejectedNotificationWizard(componentFactoryResolver), 'collection-rejected-notification');
    contextFactory.addWizardContext(new CollectionBankingUpdatedNotificationWizard(componentFactoryResolver), 'collection-banking-updated-notification');
    contextFactory.addWizardContext(new TermsArrangementWizard(componentFactoryResolver), 'terms-arrangement');
    contextFactory.addWizardContext(new CreditNoteDebitReversalWizard(componentFactoryResolver), 'credit-note-debit-reversal');
    contextFactory.addWizardContext(new InterestReversalWizard(componentFactoryResolver), 'interest-reversal');
    contextFactory.addWizardContext(new TermsArrangementsInadequatePaymentWizard(componentFactoryResolver), 'terms-arrangements-inadequate-payment');
    contextFactory.addWizardContext(new TermsArrangementsMissedPaymentsWizard(componentFactoryResolver), 'terms-arrangements-missed-payments');
    contextFactory.addWizardContext(new TermsUnsuccessfulNotificationWizard(componentFactoryResolver), 'terms-unsuccessful-notification');
    contextFactory.addWizardContext(new TermsArrangementsTwoMissedPaymentsWizard(componentFactoryResolver), 'terms-arrangements-two-missed-payments');
    contextFactory.addWizardContext(new AdhocInterestWizard(componentFactoryResolver), 'adhoc-interest-wizard');
    contextFactory.addWizardContext(new InterestAdjustmentWizard(componentFactoryResolver), 'interest-adjustment');
    contextFactory.addWizardContext(new BadDebtWriteOffWizard(componentFactoryResolver), 'debtor-debt-writeoff');
    contextFactory.addWizardContext(new PremiumPaybackWizard(componentFactoryResolver), 'policy-premium-payback');
    contextFactory.addWizardContext(new InterestIndicatorWizard(componentFactoryResolver), 'interest-indicator');
    contextFactory.addWizardContext(new GroupRiskPolicyBillingWizard(componentFactoryResolver), 'manage-grouprisk-billing');
  }
}
