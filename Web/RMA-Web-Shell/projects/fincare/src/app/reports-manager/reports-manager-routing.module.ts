import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { ReportsManagerLayoutComponent } from './views/reports-manager-layout/reports-manager-layout.component';
import { CommissionReportComponent } from './views/commission/commission-report/commission-report.component';
import { BankStatementAnalysisReportComponent } from './views/billing-reports/bank-statement-analysis-report/bank-statement-analysis-report.component';
import { CancellationsReportComponent } from './views/billing-reports/cancellations-report/cancellations-report.component';
import { ClawbackReportComponent } from './views/billing-reports/clawback-report/clawback-report.component';
import { CircularReportComponent } from './views/billing-reports/circular-report/circular-report.component';
import { CollectionsComparisonReportComponent } from './views/billing-reports/collections-comparison-report/collections-comparison-report.component';
import { CreditNoteReportComponent } from './views/billing-reports/credit-note-report/credit-note-report.component';
import { RefundsReportComponent } from './views/billing-reports/refunds-report/refunds-report.component';
import { CashCollectionsReportComponent } from './views/billing-reports/cash-collections-report/cash-collections-report.component';
import { InvoiceCollectionsReportComponent } from './views/billing-reports/invoice-collections-report/invoice-collections-report.component';
import { ReconReportComponent } from './views/finance/recon-report/recon-report.component';
import { PaymentAuditTrailReportComponent } from './views/finance/payment-audit-trail-report/payment-audit-trail-report.component';
import { PaymentsReportComponent } from './views/finance/payments-report/payments-report.component';
import { RecoveryReportComponent } from './views/finance/recovery-report/recovery-report.component';
import { RejectionReportComponent } from './views/finance/rejection-report/rejection-report.component';
import { WithheldCommissionComponent } from './views/commission/withheld-commission/withheld-commission.component';
import { RejectedCommissionComponent } from './views/commission/rejected-commission/rejected-commission.component';
import { PremiumVsCommisssionComponent } from './views/commission/premium-vs-commisssion/premium-vs-commisssion.component';
import { BrokerCommissionAccountsComponent } from './views/commission/broker-commission-accounts/broker-commission-accounts.component';
import { CommissionAbilityPostingComponent } from './views/commission/commission-ability-posting/commission-ability-posting.component';
import { PaidCommissionComponent } from './views/commission/paid-commission/paid-commission.component';
import { RecoveryAgeAnalysisReportComponent } from './views/finance/recovery-age-analysis-report/recovery-age-analysis-report.component';
import { ConsolidatedPostingsComponent } from './views/billing-reports/consolidated-postings/consolidated-postings.component';
import { GeneralLedgerReportComponent } from './views/billing-reports/general-ledger-report/general-ledger-report.component';
import { GeneralLedgerExceptionsComponent } from './views/billing-reports/general-ledger-exceptions/general-ledger-exceptions.component';
import { AbilityPostingsReportComponent } from './views/billing-reports/ability-postings-report/ability-postings-report.component';
import { YearAbilityPostingsReportComponent } from './views/billing-reports/year-ability-postings-report/year-ability-postings-report.component';
import { DebtorsReportComponent } from './views/billing-reports/debtors-report/debtors-report.component';
import { PremiumDebtorsReportComponent } from './views/billing-reports/premium-debtors-report/premium-debtors-report.component';
import { TrialBalanceReportComponent } from './views/billing-reports/trial-balance-report/trial-balance-report.component';
import { TrialBalanceReconComponent } from './views/billing-reports/trial-balance-recon/trial-balance-recon.component';
import { InvoiceCollectionDetailsComponent } from './views/finance/invoice-collection-details/invoice-collection-details.component';
import { CommissionComplianceComponent } from './views/commission/commission-compliance/commission-compliance.component';
import { UnmetTransactionReportComponent } from './views/billing-reports/unmet-transaction-report/unmet-transaction-report.component';
import { AuditTrailComponent } from './views/billing-reports/audit-trail/audit-trail.component';
import { EuropPremiumComponent } from './views/billing-reports/europ-premium-report/europ-premium-report.component';
import { TransactionsAuditTrailComponent } from './views/billing-reports/transactions-audit-trail/transactions-audit-trail.component';
import { BouncedInvoiceComponent } from './views/billing-reports/bounced-invoice-report/bounced-invoice-report.component';
import { InvoiceExceptionReportComponent } from './views/billing-reports/invoice-exception-report/invoice-exception-report.component';
import { PremiumReconComponent } from './views/billing-reports/premium-recon/premium-recon.component';
import { TermsArrangementReportComponent } from './views/billing-reports/terms-arrangement-report/terms-arrangement-report.component';
import { TermsArrangementArrearsReportComponent } from './views/billing-reports/terms-arrangement-arrears-report/terms-arrangement-arrears-report.component';
import { FinanceReportComponent } from './views/finance/finance-report/finance-report.component';
import { InterestCalculationReportComponent } from './views/billing-reports/interest-calculation-report/interest-calculation-report.component';
import { InterestPaidSummaryReportComponent } from './views/billing-reports/interest-paid-summary-report/interest-paid-summary-report';
import { InterestAlreadyProvisionedReportComponent } from './views/billing-reports/interest-already-provisioned-report/interest-already-provisioned-report.component';
import { InterestProvisionedSummaryReportComponent } from './views/billing-reports/interest-provisioned-summary-report/interest-provisioned-summary-report.component';
import { CommissionSummaryComponent } from './views/commission/commission-summary/commission-summary.component';
import { PremiumExceptionReportComponent } from './views/billing-reports/premium-exception-report/premium-exception-report.component';
import { ClaimDebtorReconReportComponent } from './views/finance/claim-debtor-recon-report/claim-debtor-recon-report.component';
import { ClaimsRejectionReportComponent } from './views/finance/claims-rejection-report/claims-rejection-report.component';
import { PensionsRejectionReportComponent } from './views/finance/pensions-rejection-report/pensions-rejection-report.component';
import { FinanceReportsComponent } from './views/finance-reports/finance-reports.component';
import { RemittanceExceptionReportComponent } from './views/finance/remittance-exception-report/remittance-exception-report.component';
import { BankStatementReportComponent } from './views/finance/bank-statement-report/bank-statement-report.component';
import { TribunalPaymentReportComponent } from './views/finance/tribunal-payment-report/tribunal-payment-report.component';
import { MemberPortalAuditTrailReportComponent } from './views/billing-reports/member-portal-audit-trail-report/member-portal-audit-trail-report.component';
import { WriteOffReportComponent } from './views/billing-reports/write-off-report/write-off-report.component';
import { BankstatementGlReconReportComponent } from './views/billing-reports/bankstatement-gl-recon-report/bankstatement-gl-recon-report.component';
import { DebtorReconReportComponent } from './views/billing-reports/debtor-recon-report/debtor-recon-report.component';
import { InterestReportComponent } from './views/billing-reports/interest-report/interest-report.component';
import { ClaimRemittancesReportComponent } from './views/finance/claim-remittances-report/claim-remittances-report/claim-remittances-report.component';
import { ClaimRemittancesTransactionsReportComponent } from './views/finance/claim-remittances-report/claim-remittances-transactions-report/claim-remittances-transactions-report.component';
import { PaymentExceptionsComponent } from './Views/billing-reports/payment-exceptions/payment-exceptions.component';
import { ReinstatementReportComponent } from './Views/billing-reports/reinstatement-report/reinstatement-report.component';
import { ChildPolicyAllocationComponentV2 } from  './Views/billing-reports/child-policy-allocation/child-policy-allocation.component';
import { BillingForecastReportComponent } from './views/billing-reports/billing-forecast-report/billing-forecast-report.component';

const routes: Routes = [
  {
    path: 'finance/finance-report',
    component: ReportsManagerLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Reports manager view'] },
    children: [
      { path: 'finance/finance-report', component: ReportsManagerLayoutComponent },
      { path: 'finance-manager-reports', component: FinanceReportComponent, data: { title: 'Finance' } },
      { path: 'commission-manager-reports', component: CommissionReportComponent, data: { title: 'Commission' } },
      { path: 'recon-report', component: ReconReportComponent, data: { title: 'Recon' } },
      { path: 'payment-audit-trail-report', component: PaymentAuditTrailReportComponent, data: { title: 'Payment Audit Trail' } },
      { path: 'payments-report', component: PaymentsReportComponent, data: { title: 'Payments' } },
      { path: 'bounced-invoice', component: BouncedInvoiceComponent, data: { title: 'Bounced Invoice Report' } },
      { path: 'premium-recon', component: PremiumReconComponent, data: { title: 'Premium Reconciliation' } },
      { path: 'rejection-report', component: RejectionReportComponent, data: { title: 'Rejection' } },
      { path: 'recovery-report', component: RecoveryReportComponent, data: { title: 'Recovery' } },
      { path: 'recovery-age-analysis-report', component: RecoveryAgeAnalysisReportComponent, data: { title: 'Recovery Age Analysis' } },
      { path: 'invoice-collection-details', component: InvoiceCollectionDetailsComponent, data: { title: 'Invoice Collection Details' } },
      { path: 'transactions-audit-trail', component: TransactionsAuditTrailComponent, data: { title: 'Transactions Audit Trail' } },
      { path: 'audit-trail', component: AuditTrailComponent, data: { title: 'Audit Trail' } },
      { path: 'bank-statement-analysis', component: BankStatementAnalysisReportComponent, data: { title: 'Bank Statement Analysis' } },
      { path: 'cancellations', component: CancellationsReportComponent, data: { title: 'Cancellations' } },
      { path: 'cash-collections', component: CashCollectionsReportComponent, data: { title: 'Cash Collections' } },
      { path: 'invoice-collections', component: InvoiceCollectionsReportComponent, data: { title: 'Invoice Collections' } },
      { path: 'circular', component: CircularReportComponent, data: { title: 'Circular' } },
      { path: 'clawback', component: ClawbackReportComponent, data: { title: 'Clawback' } },
      { path: 'collections-comparison', component: CollectionsComparisonReportComponent, data: { title: 'Collections Comparison' } },
      { path: 'credit-note', component: CreditNoteReportComponent, data: { title: 'Credit Note' } },
      { path: 'debtors', component: DebtorsReportComponent, data: { title: 'Debtors' } },
      { path: 'europ-premium', component: EuropPremiumComponent, data: { title: 'Europ Assist Premium' } },
      { path: 'refunds', component: RefundsReportComponent, data: { title: 'Refund' } },
      { path: 'consolidated-postings', component: ConsolidatedPostingsComponent, data: { title: 'Consolidated Postings' } },
      { path: 'general-ledger-report', component: GeneralLedgerReportComponent, data: { title: 'General Ledger' } },
      { path: 'year-ability-postings-report', component: YearAbilityPostingsReportComponent, data: { title: '365 D/ Ability Postings' } },
      { path: 'ability-postings-report', component: AbilityPostingsReportComponent, data: { title: 'Ability Postings' } },
      { path: 'general-ledger-exceptions', component: GeneralLedgerExceptionsComponent, data: { title: 'General Ledger Exceptions' } },
      { path: 'trial-balance-report', component: TrialBalanceReportComponent, data: { title: 'Trial Balance' } },
      { path: 'premium-debtors-report', component: PremiumDebtorsReportComponent, data: { title: 'Premium Debtors' } },
      { path: 'trial-recon-report', component: TrialBalanceReconComponent, data: { title: 'Trial Balance/Recon' } },
      { path: 'unmet-transaction-report', component: UnmetTransactionReportComponent, data: { title: 'Unmet Transactions' } },
      { path: 'invoice-exception-report', component: InvoiceExceptionReportComponent, data: { title: 'Invoice Exception Report' } },
      { path: 'withheld-commission', component: WithheldCommissionComponent, data: { title: 'Withheld Commission' } },
      { path: 'rejected-commission', component: RejectedCommissionComponent, data: { title: 'Rejected Commission' } },
      { path: 'premium-vs-commisssion', component: PremiumVsCommisssionComponent, data: { title: 'Premium Vs Commission' } },
      { path: 'broker-commission-accounts', component: BrokerCommissionAccountsComponent, data: { title: 'Broker Commission Accounts' } },
      { path: 'commission-ability-posting', component: CommissionAbilityPostingComponent, data: { title: 'Commission Ability Posting' } },
      { path: 'paid-commission', component: PaidCommissionComponent, data: { title: 'Paid Commission' } },
      { path: 'commission-compliance', component: CommissionComplianceComponent, data: { title: 'Commission Compliance' } },
      { path: 'terms-arrangement-report', component: TermsArrangementReportComponent, data: { title: 'Terms Arrangement Report' } },
      { path: 'terms-arrangement-arrears-report', component: TermsArrangementArrearsReportComponent, data: { title: 'Terms Arrears Report' } },
      { path: 'interest-calculation-report', component: InterestCalculationReportComponent, data: { title: 'Interest Calculation Report' } },
      { path: 'interest-paid-summary-report', component: InterestPaidSummaryReportComponent, data: { title: 'Interest Paid Summary Report' } },
      { path: 'interest-already-provisioned-report', component: InterestAlreadyProvisionedReportComponent, data: { title: 'Interest Already Provisioned Report' } },
      { path: 'interest-provisioned-summary-report', component: InterestProvisionedSummaryReportComponent, data: { title: 'Interest Provisioned Summary Report' } },
      { path: 'commission-summary-report', component: CommissionSummaryComponent, data: { title: 'Commission Summary Report' } },
      { path: 'premium-exception-report', component: PremiumExceptionReportComponent, data: { title: 'Premium Exception Report' } },
      { path: 'claim-debtor-recon-report', component: ClaimDebtorReconReportComponent, data: { title: 'Claim Debtor Recon Report' } },
      { path: 'claims-rejection-report', component: ClaimsRejectionReportComponent, data: { title: 'Claims Rejection Report' } },
      { path: 'pensions-rejection-report', component: PensionsRejectionReportComponent, data: { title: 'Pensions Rejection Report' } },
      { path: 'finance-reports', component: FinanceReportsComponent, data: { title: 'Finance Reports' } },
      { path: 'claim-remittances', component: ClaimRemittancesReportComponent, data: { title: 'Claim Remittances' } },
      { path: 'claim-remittances-transactions/:reference', component: ClaimRemittancesTransactionsReportComponent, data: { title: 'Claim Remittances Transactions' } },
      { path: 'remittance-exception-report', component: RemittanceExceptionReportComponent, data: { title: 'Remittance Exception Report' } },
      { path: 'bank-statement-report', component: BankStatementReportComponent, data: { title: 'Bank Statement Report' } },
      { path: 'tribunal-payment-report', component: TribunalPaymentReportComponent, data: { title: 'Tribunal Payment Report' } },
      { path: 'member-portal-audit-trail-report', component: MemberPortalAuditTrailReportComponent, data: { title: 'Member Portal Audit Trail Report' } },
      { path: 'write-off-report', component: WriteOffReportComponent, data: { title: 'Write Off Report' } },
      { path: 'bankstatement-gl-recon-report', component: BankstatementGlReconReportComponent, data: { title: 'Bankstatement Gl Recon Report' } },
      { path: 'debtor-recon-report', component: DebtorReconReportComponent, data: { title: 'Debtor Recon Report' } },
      { path: 'interest-report', component: InterestReportComponent, data: { title: 'Interest Report' } },
      { path: 'payment-exceptions', component: PaymentExceptionsComponent, data: { title: 'Payment Exceptions Report' } },
      { path: 'reinstatement-report', component: ReinstatementReportComponent, data: { title: 'Reintstatement Report' } },
      { path: 'child-policy-allocation', component: ChildPolicyAllocationComponentV2, data: { title: 'Child Policy Allocation Consolidation' } },
      { path: 'billing-forecast-report', component: BillingForecastReportComponent, data: { title: 'Billing Forecast Report' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ReportsManagerRoutingModule { }
