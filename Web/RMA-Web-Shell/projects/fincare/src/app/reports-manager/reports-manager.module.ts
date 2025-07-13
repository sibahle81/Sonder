import { ReportsManagerRoutingModule } from './reports-manager-routing.module';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReportsManagerLayoutComponent } from './views/reports-manager-layout/reports-manager-layout.component';
import { CommissionReportComponent } from './views/commission/commission-report/commission-report.component';
import { BankAccountService } from 'projects/shared-services-lib/src/lib/services/bank-account/bank-account.service';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { CreditNoteReportComponent } from './views/billing-reports/credit-note-report/credit-note-report.component';
import { RefundsReportComponent } from './views/billing-reports/refunds-report/refunds-report.component';
import { BankStatementAnalysisReportComponent } from './views/billing-reports/bank-statement-analysis-report/bank-statement-analysis-report.component';
import { CancellationsReportComponent } from './views/billing-reports/cancellations-report/cancellations-report.component';
import { CollectionsComparisonReportComponent } from './views/billing-reports/collections-comparison-report/collections-comparison-report.component';
import { CircularReportComponent } from './views/billing-reports/circular-report/circular-report.component';
import { ClawbackReportComponent } from './views/billing-reports/clawback-report/clawback-report.component';
import { CashCollectionsReportComponent } from './views/billing-reports/cash-collections-report/cash-collections-report.component';
import { InvoiceCollectionsReportComponent } from './views/billing-reports/invoice-collections-report/invoice-collections-report.component';
import { FrameworkModule } from 'src/app/framework.module';
import { ReconReportComponent } from './views/finance/recon-report/recon-report.component';
import { PaymentAuditTrailReportComponent } from './views/finance/payment-audit-trail-report/payment-audit-trail-report.component';
import { PaymentsReportComponent } from './views/finance/payments-report/payments-report.component';
import { RejectionReportComponent } from './views/finance/rejection-report/rejection-report.component';
import { RecoveryReportComponent } from './views/finance/recovery-report/recovery-report.component';
import { WithheldCommissionComponent } from './views/commission/withheld-commission/withheld-commission.component';
import { RejectedCommissionComponent } from './views/commission/rejected-commission/rejected-commission.component';
import { PremiumVsCommisssionComponent } from './views/commission/premium-vs-commisssion/premium-vs-commisssion.component';
import { BrokerCommissionAccountsComponent } from './views/commission/broker-commission-accounts/broker-commission-accounts.component';
import { CommissionAbilityPostingComponent } from './views/commission/commission-ability-posting/commission-ability-posting.component';
import { PaidCommissionComponent } from './views/commission/paid-commission/paid-commission.component';
import { RecoveryAgeAnalysisReportDatasource } from './views/finance/recovery-age-analysis-report/recovery-age-analysis-report.datasource';
import { RecoveryAgeAnalysisReportComponent } from './views/finance/recovery-age-analysis-report/recovery-age-analysis-report.component';
import { AgeAnalysisService } from '../shared/services/age-analysis.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { RecoveryAgeAnalysisNotesComponent } from './views/finance/recovery-age-analysis-notes/recovery-age-analysis-notes.component';
import { ConsolidatedPostingsComponent } from './views/billing-reports/consolidated-postings/consolidated-postings.component';
import { GeneralLedgerReportComponent } from './views/billing-reports/general-ledger-report/general-ledger-report.component';
import { GeneralLedgerExceptionsComponent } from './views/billing-reports/general-ledger-exceptions/general-ledger-exceptions.component';
import { AbilityPostingsReportComponent } from './views/billing-reports/ability-postings-report/ability-postings-report.component';
import { YearAbilityPostingsReportComponent } from './views/billing-reports/year-ability-postings-report/year-ability-postings-report.component';
import { DebtorsReportComponent } from './views/billing-reports/debtors-report/debtors-report.component';
import { TrialBalanceReportComponent } from './views/billing-reports/trial-balance-report/trial-balance-report.component';
import { PremiumDebtorsReportComponent } from './views/billing-reports/premium-debtors-report/premium-debtors-report.component';
import { TrialBalanceReconComponent } from './views/billing-reports/trial-balance-recon/trial-balance-recon.component';
import { CommissionComplianceComponent } from './views/commission/commission-compliance/commission-compliance.component';
import { InvoiceCollectionDetailsComponent } from './views/finance/invoice-collection-details/invoice-collection-details.component';
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
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { ReportHomeComponent } from './views/report-home/report-home.component';
import { CollectionsAgeingReportComponent } from './views/billing-reports/collections-ageing-report/collections-ageing-report.component';
import { RemittanceExceptionReportComponent } from './views/finance/remittance-exception-report/remittance-exception-report.component';
import { BankStatementReportComponent } from './views/finance/bank-statement-report/bank-statement-report.component';
import { TribunalPaymentReportComponent } from './views/finance/tribunal-payment-report/tribunal-payment-report.component';
import { MemberPortalAuditTrailReportComponent } from './views/billing-reports/member-portal-audit-trail-report/member-portal-audit-trail-report.component';
import { WriteOffReportComponent } from './views/billing-reports/write-off-report/write-off-report.component';
import { BillingForecastReportComponent } from './views/billing-reports/billing-forecast-report/billing-forecast-report.component';
import { TabbedReportMenuLayoutComponent } from './views/reports-manager-layout/tabbed-report-menu-layout/tabbed-report-menu-layout.component';
import { BankstatementGlReconReportComponent } from './views/billing-reports/bankstatement-gl-recon-report/bankstatement-gl-recon-report.component';
import { DebtorReconReportComponent } from './views/billing-reports/debtor-recon-report/debtor-recon-report.component';
import { InterestReportComponent } from './views/billing-reports/interest-report/interest-report.component';
import { ClaimRemittancesReportComponent } from './views/finance/claim-remittances-report/claim-remittances-report/claim-remittances-report.component';
import { ClaimRemittancesReportDatasource } from './views/finance/claim-remittances-report/claim-remittances-report/claim-remittances-report.datasource';
import { ClaimRemittancesTransactionsReportComponent } from './views/finance/claim-remittances-report/claim-remittances-transactions-report/claim-remittances-transactions-report.component';
import { ClaimRemittancesTransactionsReportDatasource } from './views/finance/claim-remittances-report/claim-remittances-transactions-report/claim-remittances-transactions-report.datasource';
import { ViewRemittanceReportComponent } from './views/finance/claim-remittances-report/view-remittance-report/view-remittance-report.component';
import { HandedOverReportComponent } from './Views/billing-reports/handed-over-report/handed-over-report.component';
import { PaymentExceptionsComponent } from './Views/billing-reports/payment-exceptions/payment-exceptions.component';
import { ReinstatementReportComponent } from './Views/billing-reports/reinstatement-report/reinstatement-report.component';
import { ChildPolicyAllocationComponentV2 } from './Views/billing-reports/child-policy-allocation/child-policy-allocation.component'; 

@NgModule({
    imports: [
        FrameworkModule,
        ReportsManagerRoutingModule,
        SharedComponentsLibModule,
        MaterialsModule,
    ],
    declarations: [
        FinanceReportComponent,
        ReportsManagerLayoutComponent,
        CommissionReportComponent,
        ReportHomeComponent,
        CreditNoteReportComponent,
        RefundsReportComponent,
        BankStatementAnalysisReportComponent,
        CancellationsReportComponent,
        CollectionsComparisonReportComponent,
        CircularReportComponent,
        ClawbackReportComponent,
        CashCollectionsReportComponent,
        ReconReportComponent,
        PaymentAuditTrailReportComponent,
        PaymentsReportComponent,
        RejectionReportComponent,
        RecoveryReportComponent,
        InvoiceCollectionsReportComponent,
        WithheldCommissionComponent,
        RejectedCommissionComponent,
        PremiumVsCommisssionComponent,
        BrokerCommissionAccountsComponent,
        CommissionAbilityPostingComponent,
        PaidCommissionComponent,
        RecoveryAgeAnalysisReportComponent,
        RecoveryAgeAnalysisNotesComponent,
        ConsolidatedPostingsComponent,
        GeneralLedgerReportComponent,
        YearAbilityPostingsReportComponent,
        AbilityPostingsReportComponent,
        GeneralLedgerExceptionsComponent,
        CollectionsAgeingReportComponent,
        DebtorsReportComponent,
        TrialBalanceReportComponent,
        PremiumDebtorsReportComponent,
        TrialBalanceReconComponent,
        CommissionComplianceComponent,
        InvoiceCollectionDetailsComponent,
        UnmetTransactionReportComponent,
        AuditTrailComponent,
        EuropPremiumComponent,
        TransactionsAuditTrailComponent,
        BouncedInvoiceComponent,
        InvoiceExceptionReportComponent,
        PremiumReconComponent,
        TermsArrangementReportComponent,
        TermsArrangementArrearsReportComponent,
        InterestCalculationReportComponent,
        InterestPaidSummaryReportComponent,
        InterestAlreadyProvisionedReportComponent,
        InterestProvisionedSummaryReportComponent,
        CommissionSummaryComponent,
        PremiumExceptionReportComponent,
        ClaimDebtorReconReportComponent,
        ClaimsRejectionReportComponent,
        PensionsRejectionReportComponent,
        ClaimDebtorReconReportComponent,
        FinanceReportsComponent,
        RemittanceExceptionReportComponent,
        BankStatementReportComponent,
        TribunalPaymentReportComponent,
        MemberPortalAuditTrailReportComponent,
        WriteOffReportComponent,
        BillingForecastReportComponent,
        TabbedReportMenuLayoutComponent,
        BankstatementGlReconReportComponent,
        DebtorReconReportComponent,
        InterestReportComponent,
        ClaimRemittancesReportComponent,
        ClaimRemittancesTransactionsReportComponent,
        ViewRemittanceReportComponent,
        HandedOverReportComponent,
        PaymentExceptionsComponent,
        ReinstatementReportComponent,
        ChildPolicyAllocationComponentV2
    ],
    exports: [],
    entryComponents: [
        RecoveryAgeAnalysisNotesComponent
    ],
    providers: [
        DatePipe,
        BankAccountService,
        RecoveryAgeAnalysisReportDatasource,
        AgeAnalysisService,
        LookupService,
        AlertService,
        UserService,
        ClaimRemittancesReportDatasource,
        ClaimRemittancesTransactionsReportDatasource
    ]
})
export class ReportsManagerModule { }
