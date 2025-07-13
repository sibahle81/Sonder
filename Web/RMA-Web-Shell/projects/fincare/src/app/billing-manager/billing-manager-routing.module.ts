import { InterBankTransferAuditReportComponent } from './views/inter-bank-transfer-audit-report/inter-bank-transfer-audit-report.component';
import { AdhocPaymentAuditComponent } from './views/adhoc-payment-audit/adhoc-payment-audit.component';
import { NgModule } from '@angular/core';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { RouterModule, Routes } from '@angular/router';
import { BillingHomeComponent } from '../billing-manager/views/billing-home/billing-home.component';
import { BillingLayoutComponent } from '../billing-manager/views/billing-layout/billing-layout.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { ManualAlloactionUnallocatedPaymentsComponent } from './views/manual-allocation/manual-alloaction-unallocated-payments/manual-alloaction-unallocated-payments.component';
import { ManualAllocationAllocatePaymentComponent } from './views/manual-allocation/manual-allocation-allocate-payment/manual-allocation-allocate-payment.component';
import { InvoiceDetailsComponent } from './views/invoice-details/invoice-details.component';
import { AgeAnalysisComponent } from './views/age-analysis/age-analysis.component';
import { RefundComponent } from './views/refund/refund/refund.component';
import { StatementDetailsComponent } from './views/statement-details/statement-details.component';
import { TransactionalStatementComponent } from './views/transactional-statement/transactional-statement.component';
import { InterBankTransfersComponent } from './views/inter-bank-transfers/inter-bank-transfers.component';
import { AbilityCollectionsComponent } from './views/ability-collections/ability-collections.component';
import { AbilityCollectionsListGroupComponent } from './views/ability-collections-list-group/ability-collections-list-group.component';
import { AbilityCollectionsAuditComponent } from './views/ability-collections-audit/ability-collections-audit.component';
import { CollectionsComponent } from './views/collections/collections.component';
import { CreditNoteFindAccountComponent } from './views/credit-note/credit-note-find-account/credit-note-find-account.component';
import { TransactionHistoryComponent } from './views/transaction-history/transaction-history.component';
import { UploadCollectionAgentsComponent } from './views/upload-collection-agents/upload-collection-agents.component';
import { ViewDebtorComponent } from './views/view-debtor/view-debtor.component';
import { UnpaidInvoiceReportComponent } from './views/unpaid-invoice-report/unpaid-invoice-report.component';
import { InactivePoliciesReportComponent } from './views/inactive-policies-report/inactive-policies-report.component';
import { DebitOrderReportComponent } from './views/debit-order-report/debit-order-report.component';
import { TransactionsRefundComponent } from './views/transactions-refund/transactions-refund.component';
import { UnallocatedPaymentsComponent } from './views/unallocated-payments/unallocated-payments.component';
import { AllocatedPaymentsComponent } from './views/allocated-payments/allocated-payments.component';
import { ReAlloctionComponent } from './views/manual-allocation/re-allocation/re-alloction/re-alloction.component';
import { TransactionReversalComponent } from './views/transaction-reversal/transaction-reversal.component';
import { CreditNoteReversalDetailsComponent } from './views/credit-note-reversal-details/credit-note-reversal-details.component';
import { InterDebtorTransfersCaptureComponent } from './views/inter-debtor-transfers/inter-debtor-transfers-capture.component';
import { ConfirmPremiumReceivedComponent } from './views/confirm-premium-received/confirm-premium-received.component';
import { SalesDistributionReportComponent } from './views/sales-distribution-report/sales-distribution-report.component';
import { MonthlyNewBusinessReportComponent } from './views/monthly-new-business-report/monthly-new-business-report.component';
import { CancelledBusinessReportComponent } from './views/cancelled-business-report/cancelled-business-report.component';
import { InvoiceAuditReportComponent } from './views/invoice-audit-report/invoice-audit-report.component';
import { InterdebtorTransferAuditReportComponent } from './views/interdebtor-transfer-audit-report/interdebtor-transfer-audit-report.component';
import { PaymentRefundListComponent } from './views/payment-refund-list/payment-refund-list.component';
import { EuropAssistPremiumsComponent } from './views/europ-assist-premiums/europ-assist-premiums.component';
import { InvoiceListComponent } from './views/invoice-list/invoice-list.component';
import { InterestReversalComponent } from './views/interest-reversal/interest-reversal.component';
import { BulkManualAllocationsComponent } from './views/bulk-manual-allocations/bulk-manual-allocations.component';
import { BackDateInterestComponent } from './views/back-date-interest/back-date-interest.component';
import { UploadedFileDetailsComponent } from './views/bulk-manual-allocations/uploaded-file-details/uploaded-file-details.component';
import { UploadedFilesComponent } from './views/bulk-manual-allocations/uploaded-files/uploaded-files.component';
import { PolicyReclassificationRefundComponent } from './views/policy-reclassification-refund/policy-reclassification-refund.component';
import { ViewApprovalsComponent } from 'projects/shared-components-lib/src/lib/wizard/views/view-approvals/view-approvals.component';
import { CollectionAgeingComponent } from './views/collection-ageing/collection-ageing.component';
import { TermsArrangementInitiationComponent } from './views/terms-arrangement/terms-arrangement-initiation/terms-arrangement-initiation.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { TermsArrangementDebtorDetailsComponent } from './views/terms-arrangement/terms-arrangement-debtor-details/terms-arrangement-debtor-details.component';
import { UploadedPaymentFilesComponent } from './views/bulk-payment-allocations/uploaded-payment-files/uploaded-payment-files.component';
import { BulkPaymentAllocationsComponent } from './views/bulk-payment-allocations/bulk-payment-allocations.component'
import { AdhocInterestCalculationComponent } from './views/adhoc-interest_calculation/adhoc-interest_calculation.component';
import { InterestAdjustmentComponent } from './views/interest-adjustment/interest-adjustment.component';
import { BadDebtWriteOffComponent } from './views/write-offs/bad-debt-write-off/bad-debt-write-off.component';
import { MemberLetterOfGoodStandingComponent } from './views/member-letter-of-good-standing/member-letter-of-good-standing.component';
import { BadDebtReinstateComponent } from './views/reinstate/bad-debt-reinstate/bad-debt-reinstate.component';
import { FailedExceptionAllocationsComponent } from './views/failed-exception-allocations/failed-exception-allocations.component';
import { ExceptionFileDetailsComponent } from './views/failed-exception-allocations/exception-file-details/exception-file-details.component';
import { ExceptionFilesComponent } from './views/failed-exception-allocations/exception-files/exception-files.component';
import { DebtorAuditComponent } from './views/debtor-audit/debtor-audit.component';
import { CreditNoteDetailComponent } from './views/credit-note/credit-note/credit-note-detail/credit-note-detail.component';
import { CreateAdhocDebitComponent } from './views/collections/create-adhoc-debit/create-adhoc-debit.component';
import { BundleRaiseDetailsComponent } from './views/bundle-raise/bundle-raise-details/bundle-raise-details.component';
import { BundleRaiseCollectionsComponent } from './views/bundle-raise/bundle-raise-collections/bundle-raise-collections.component';
import { InterBankTransfersMainComponent } from './views/inter-bank-transfers/inter-bank-transfers-main/inter-bank-transfers-main.component';
import { InterBankTransfersFromDebtorsComponent } from './views/inter-bank-transfers/inter-bank-transfers-from-debtors/inter-bank-transfers-from-debtors.component';
import { AutoAllocationConfigurationComponent } from './views/manual-allocation/auto-allocation-configuration/auto-allocation-configuration.component';
import { BillingUploadsComponent } from './views/billing-uploads/billing-uploads.component';
import { AutoAllocationUnallocatedPaymentsComponent } from './views/auto-allocation/auto-allocation-unallocated-payments/auto-allocation-unallocated-payments.component';
import { UploadPremiumTransactionComponent } from './views/upload-premium-transaction/upload-premium-transaction.component';
import { ChildAllocationResultsComponent } from './views/child-allocation-results/child-allocation-results.component';
import { ChildPolicyAllocationComponent } from 'projects/clientcare/src/app/policy-manager/views/child-policy-allocation/child-policy-allocation.component';
import { ChildAllocationReconComponent } from './views/child-allocation-recon/child-allocation-recon.component';
import { MaintainGroupRiskBillingComponent } from "./views/maintain-group-risk-billing/maintain-group-risk-billing.component";
import { GroupRiskDebtorSearchComponent } from './views/group-risk-billing/group-risk-debtor-search/group-risk-debtor-search.component';
import {
  GroupRiskBillingPayrollDetailViewComponent
} from "./views/group-risk-billing-payroll-detail-view/group-risk-billing-payroll-detail-view.component";
import { UploadNewListComponent } from './views/write-offs/bulk-write-offs/upload-new-list/upload-new-list.component';
import { UploadedWriteOffFileDetailsComponent } from './views/write-offs/bulk-write-offs/uploaded-file-details/uploaded-write-off-file-details.component';
import { UploadedWriteOffFilesComponent } from './views/write-offs/bulk-write-offs/uploaded-files/uploaded-write-off-files.component';
import { PagedCalculatedInterestSearchComponent } from './views/interest/calculate-interest/paged-calculated-interest-search.component';
import { ValidatePaymentFilesComponent } from './views/validate-payment-files/validate-payment-files.component';
import { BulkDebtorHandoverUploadComponent } from './views/bulk-debtor-handover/bulk-debtor-handover-upload.component';
import { LegalReconReportComponent } from './views/bulk-debtor-handover/recon-report/legal-recon-report/legal-recon-report.component';
import { HandedReconUploadComponent } from './views/bulk-debtor-handover/recon/handed-recon-upload/handed-recon-upload.component';
import { InterPolicyDebtorTransfersComponent } from './views/inter-policy-debtor-transfers/inter-policy-debtor-transfers.component';


const routes: Routes = [
  {
    path: '',
    component: BillingLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'Billing Manager', permissions: ['Billing manager view'] },
    children: [
      { path: '', component: BillingHomeComponent, data: { title: 'Billing Manager' } },
      { path: 'manual-allocation-unallocated-payments', component: ManualAlloactionUnallocatedPaymentsComponent, data: { title: 'Unallocated Payments' } },
      { path: 'auto-allocation-unallocated-payments', component: AutoAllocationUnallocatedPaymentsComponent, data: { title: 'Auto Allocated Payment' } },
      { path: 'manual-allocation-unallocated-payments/:receiverDebtorNumber', component: ManualAlloactionUnallocatedPaymentsComponent, data: { title: 'Unallocated Payments' } },
      { path: 'manual-allocation-allocate-payment/:allocationType/:paymentId', component: ManualAllocationAllocatePaymentComponent, data: { title: 'Allocated Payment' } },
      { path: 'manual-allocation-allocate-payment/:roleplayerId/:allocationType/:paymentId', component: ManualAllocationAllocatePaymentComponent, data: { title: 'Allocated Payment' } },
      { path: 'refund', component: RefundComponent, data: { title: 'Refund' } },
      { path: 'credit-note-find-account', component: CreditNoteFindAccountComponent, data: { title: 'Account Search' } },
      { path: 'groupriskbillingpayroll-details/:employerRolePlayerId/:benefitPayrollId', component: GroupRiskBillingPayrollDetailViewComponent, data: { title: 'Group Risk  Benefit Payrolls' } },
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'view-invoice', component: InvoiceDetailsComponent, data: { title: 'View Invoice', group: 1 } },
      { path: 'view-transaction', component: TransactionHistoryComponent, data: { title: 'View Transactions', group: 1 } },
      { path: 'view-transaction/:policyId', component: TransactionHistoryComponent, data: { title: 'View Transactions', group: 1 } },
      { path: 'view-debtor', component: ViewDebtorComponent, data: { title: 'View Invoice', group: 1 } },
      { path: 'age-analysis', component: AgeAnalysisComponent, data: { title: 'Age Analysis', group: 1 } },
      { path: 'upload-collection-agents', component: UploadCollectionAgentsComponent, data: { title: 'Age Analysis', group: 1 } },
      { path: 'view-statement', component: StatementDetailsComponent, data: { title: 'View Statement', group: 1 } },
      { path: 'view-transactional', component: TransactionalStatementComponent, data: { title: 'View Statement', group: 1 } },
      { path: 'inter-bank-transfers-main', component: InterBankTransfersMainComponent, data: { title: 'Interbank Transfer' } },
      { path: 'ability-collections-list', component: AbilityCollectionsComponent, data: { title: 'Ability Collections', group: 1 } },
      { path: 'ability-collections-list-group', component: AbilityCollectionsListGroupComponent },
      { path: 'ability-collections-list-group/:id', component: AbilityCollectionsListGroupComponent },
      { path: 'posted-collections-list', component: AbilityCollectionsAuditComponent },
      { path: 'posted-collections-list/:id', component: AbilityCollectionsAuditComponent },
      { path: 'collections-pool', component: CollectionsComponent, data: { title: 'Collections' } },
      { path: 'unpaid-invoices', component: UnpaidInvoiceReportComponent, data: { title: 'View Unpaid Invoices', group: 1 } },
      { path: 'inactive-policies', component: InactivePoliciesReportComponent, data: { title: 'View Inactive Policies', group: 1 } },
      { path: 'debit-orders', component: DebitOrderReportComponent, data: { title: 'View Debit Orders', group: 1 } },
      { path: 'unallocated-payments', component: UnallocatedPaymentsComponent, data: { title: 'View Unallocated Payments', group: 1 } },
      { path: 'allocated-payments', component: AllocatedPaymentsComponent, data: { title: 'View Allocated Payments', group: 1 } },
      { path: 'europe-assist-premiums', component: EuropAssistPremiumsComponent, data: { title: 'Europe Assist Premium History', group: 1 } },
      { path: 'transactions-refund', component: TransactionsRefundComponent },
      { path: 're-allocation', component: ReAlloctionComponent },
      { path: 'credit-note-reversal', component: CreditNoteReversalDetailsComponent },
      { path: 'transaction-reversal', component: TransactionReversalComponent },
      { path: 'inter-debtor-transfers-capture', component: InterDebtorTransfersCaptureComponent },
      { path: 'confirm-premium-received', component: ConfirmPremiumReceivedComponent },
      { path: 'sales-distribution-report', component: SalesDistributionReportComponent },
      { path: 'cancelled-business-report', component: CancelledBusinessReportComponent },
      { path: 'monthly-new-business-report', component: MonthlyNewBusinessReportComponent },
      { path: 'invoice-audit', component: InvoiceAuditReportComponent },
      { path: 'inter-debtor-transfer-audit', component: InterdebtorTransferAuditReportComponent },
      { path: 'adhoc-payment-audit', component: AdhocPaymentAuditComponent },
      { path: 'inter-bank-transfer-audit', component: InterBankTransferAuditReportComponent },
      { path: 'payment-refund-list', component: PaymentRefundListComponent },
      { path: 'terms-arrangements', component: TermsArrangementDebtorDetailsComponent },
      { path: 'invoice-list', component: InvoiceListComponent },
      { path: 'interest-reversal', component: InterestReversalComponent },
      { path: 'bulk-manual-allocation', component: BillingUploadsComponent },
      { path: 'back-date-interest', component: BackDateInterestComponent },
      { path: 'credit-note-find-account/:finPayeNumber/:roleplayerId/:type', component: CreditNoteFindAccountComponent, data: { title: 'Account Search' }, },
      { path: 'bulk-manual-files', component: UploadedFilesComponent },
      { path: 'bulk-file-details/:id', component: UploadedFileDetailsComponent },
      { path: 'policy-reclassification-refund', component: PolicyReclassificationRefundComponent },
      { path: 'view-approvals', component: ViewApprovalsComponent },
      { path: 'collection-ageing', component: CollectionAgeingComponent },
      { path: 'terms-arrangement-init', component: TermsArrangementInitiationComponent },
      { path: 'bulk-payment-files', component: UploadedPaymentFilesComponent },
      { path: 'bulk-payment-allocation', component: BulkPaymentAllocationsComponent },
      { path: 'adhoc-interest_calculation', component: AdhocInterestCalculationComponent },
      { path: 'interest-adjustment', component: InterestAdjustmentComponent },
      { path: 'bad-debt-write-off', component: BadDebtWriteOffComponent },
      { path: 'view-letter-of-good-standing', component: MemberLetterOfGoodStandingComponent },
      { path: 'bad-debt-reinstate', component: BadDebtReinstateComponent },
      { path: 'failed-exception-allocations', component: FailedExceptionAllocationsComponent },
      { path: 'exception-file-details', component: ExceptionFileDetailsComponent },
      { path: 'exception-files', component: ExceptionFilesComponent },
      { path: 'debtor-audit', component: DebtorAuditComponent },
      { path: 'view-credit-notes', component: CreditNoteDetailComponent },
      { path: 'create-adhoc-debit', component: CreateAdhocDebitComponent },
      { path: 'bundle-raise-details', component: BundleRaiseDetailsComponent },
      { path: 'bundle-raise-collections', component: BundleRaiseCollectionsComponent },
      { path: 'policy-reclassification-refund', component: PolicyReclassificationRefundComponent },
      { path: 'auto-allocation-accounts', component: AutoAllocationConfigurationComponent },
      { path: 'upload-payment-transactions', component: UploadPremiumTransactionComponent, data: { title: 'Upload Payment Transactions' } },
      { path: 'view-allocation-results/:id', component: ChildAllocationResultsComponent },
      { path: 'child-policy-recon', component: ChildAllocationReconComponent },
      { path: 'create-group-risk-billing', component: GroupRiskDebtorSearchComponent, data: { title: 'Create Group Risk Billing' } },
      { path: 'maintain-group-risk-billing', component: MaintainGroupRiskBillingComponent, data: { title: 'Maintain Group Risk Billing' } },
      { path: 'view-debtor-transaction-history/:rolepalyerId', component: TransactionHistoryComponent, data: { title: 'View Transactions', group: 1 } },
      { path: 'groupriskbillingpayrolls/:type/:action/:linkedId', component: WizardHostComponent },
      { path: 'write-offlists', component: UploadedWriteOffFilesComponent, data: { title: 'Bulk Write-Offs' } },
      { path: 'write-offlist-details/:fileId', component: UploadedWriteOffFileDetailsComponent, data: { title: 'Bulk Write-Offs Details' } },
      { path: 'new-write-offlist', component: UploadNewListComponent, data: { title: 'New Bulk Write-Offs' } },
      { path: 'manage-interest', component: PagedCalculatedInterestSearchComponent, data: { title: 'Manage Interest' } },
      { path: 'validate-payment-files', component: ValidatePaymentFilesComponent, data: { title: 'Validate Files' } },
      { path: 'validate-payment-files/:id', component: ValidatePaymentFilesComponent, data: { title: 'Validate Files' } },
      { path: 'bulk-debtor-handover-upload', component: BulkDebtorHandoverUploadComponent, data: { title: 'Upload' } },
      { path: 'handedover-recon-report', component: LegalReconReportComponent},
      { path: 'handover-recon-upload', component: HandedReconUploadComponent, data: { title: 'Handover Recon' } },
      { path: 'inter-policy-debtor-transfers', component: InterPolicyDebtorTransfersComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingManagerRoutingModule {
}
