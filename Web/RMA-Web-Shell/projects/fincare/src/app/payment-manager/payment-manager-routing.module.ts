
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { PaymentCommissionListComponent } from './views/payment-commission-list/payment-commission-list.component';
import { PaymentClaimListComponent } from './views/payment-claim-list/payment-claim-list.component';
import { PaymentListComponent } from './views/payment-list/payment-list.component';
import { PaymentLayoutComponent } from './views/payment-layout/payment-layout.component';
import { BrokerAccountSummaryComponent } from './views/broker-account-summary/broker-account-summary.component';
import { BrokerCommissionDetailsViewComponent } from './views/broker-commission-details-view/broker-commission-details-view.component';
import { BrokerAccountsViewComponent } from './views/broker-accounts-view/broker-accounts-view.component';
import { CommissionReleaseComponent } from './views/commission-release/commission-release.component';
import { CommissionProductReleaseComponent } from './views/commission-product-release/commission-product-release.component';
import { CommissionStatementComponent } from './views/commission-statement/commission-statement.component';
import { HomeComponent } from './views/home/home.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { CommissionAuditTrailComponent } from './views/commission-audit-trail/commission-audit-trail.component';
import { BrokerAccountClawBackSummaryComponent } from './views/broker-account-clawback-summary/broker-account-clawback-summary.component';
import { PaymentAuditComponent } from './views/payment-audit/payment-audit.component';
import { PaymentPensionListComponent } from './views/payment-pension-list/payment-pension-list.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { PaymentRecallComponent } from './views/payment-recall/payment-recall.component';
import { PaymentReversalComponent } from './views/payment-reversal/payment-reversal.component';
import { PaymentWorkPoolContainerComponent } from './views/payment-work-pool/payment-work-pool-container/payment-work-pool-container.component';
import { CommissionWorkPoolContainerComponent } from './views/commission-work-pool/commission-work-pool-container/commission-work-pool-container.component';


import { ManualAlloactionUnallocatedPaymentsComponent } from './views/manual-allocation/manual-alloaction-unallocated-payments/manual-alloaction-unallocated-payments.component';
import { ManualAllocationAllocatePaymentComponent } from './views/manual-allocation/manual-allocation-allocate-payment/manual-allocation-allocate-payment.component';
import { UnallocatedPaymentsComponent } from 'projects/shared-components-lib/src/lib/unallocated-payments/unallocated-payments.component';
import { AllocatedPaymentsComponent } from 'projects/shared-components-lib/src/lib/allocated-payments/allocated-payments.component';
import { BankStatementReportComponent } from './views/bank-statement-report/bank-statement-report.component';
import { UploadHcpDiscountsComponent } from './views/upload-hcp-discounts/upload-hcp-discounts.component';
import { ManageCommissionPeriodsComponent } from './views/manage-commission-periods/manage-commission-periods.component';



const routes: Routes = [
  {
    path: '',
    component: PaymentLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'Payment Manager', permissions: ['Payment manager view'] },
    children: [
      { path: '', component: HomeComponent, data: { title: 'Payment Manager' } },
      { path: 'home', component: HomeComponent, data: { title: 'Payment Manager' } },
      { path: 'payment-commision-list', component: PaymentCommissionListComponent },
      { path: 'payment-claim-list', component: PaymentClaimListComponent },
      { path: 'payment-pension-list', component: PaymentPensionListComponent },
      { path: 'payment-list', component: PaymentWorkPoolContainerComponent },
      { path: 'broker-accounts-view', component: BrokerAccountsViewComponent },
      { path: 'broker-account-summary/:accountTypeId/:accountId/:headerStatusId', component: BrokerAccountSummaryComponent },
      { path: 'broker-commission-details-view/:headerId/:headerStatusId', component: BrokerCommissionDetailsViewComponent },
      { path: 'commission-release', component: CommissionWorkPoolContainerComponent },
      //{ path: 'commission-release', component: CommissionReleaseComponent }
      { path: 'commission-product-release/:headerId', component: CommissionProductReleaseComponent },
      { path: 'broker-account-clawback-summary/:accountTypeId/:accountId', component: BrokerAccountClawBackSummaryComponent },
      { path: 'commission-statement/:accountTypeId/:accountId', component: CommissionStatementComponent },
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'commission-audit-trail', component: CommissionAuditTrailComponent },
      { path: 'payment-audit/:paymentId', component: PaymentAuditComponent },
      { path: 'payment-recall', component: PaymentRecallComponent },      
      { path: 'payment-reversal', component: PaymentReversalComponent },     
      { path: 'payment-workpool', component: PaymentWorkPoolContainerComponent },
      { path: 'upload-discounts', component: UploadHcpDiscountsComponent },
      { path: 'commission-period/:periodId', component: ManageCommissionPeriodsComponent },


      { path: 'manual-allocation-unallocated-payments', component: ManualAlloactionUnallocatedPaymentsComponent, data: { title: 'Unallocated Payments' } },
      { path: 'manual-allocation-unallocated-payments/:receiverDebtorNumber', component: ManualAlloactionUnallocatedPaymentsComponent, data: { title: 'Unallocated Payments' } },
      { path: 'manual-allocation-allocate-payment/:allocationType/:paymentId', component: ManualAllocationAllocatePaymentComponent, data: { title: 'Allocated Payment' } },
      { path: 'manual-allocation-allocate-payment/:roleplayerId/:allocationType/:paymentId', component: ManualAllocationAllocatePaymentComponent, data: { title: 'Allocated Payment' } },
      { path: 'unallocated-payments', component: UnallocatedPaymentsComponent, data: { title: 'View Unallocated Payments', group: 1 } },
      { path: 'allocated-payments', component: AllocatedPaymentsComponent, data: { title: 'View Allocated Payments', group: 1 } },
      { path: 'bank-statement-report', component: BankStatementReportComponent, data: { title: 'Bank Statement', group: 1 } },
      { path: 'manual-payments', component: ManualPaymentsComponent, data: { title: 'Manual Payments' } },
    

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentManagerRoutingModule { }
