import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FrameworkModule } from 'src/app/framework.module';
import { PaymentManagerRoutingModule } from './payment-manager-routing.module';
import { PaymentListComponent } from './views/payment-list/payment-list.component';
import { PaymentClaimListComponent } from './views/payment-claim-list/payment-claim-list.component';
import { PaymentCommissionListComponent } from './views/payment-commission-list/payment-commission-list.component';
import { PaymentDialogComponent } from './views/payment-dialog/payment-dialog.component';
import { PaymentService } from './services/payment.service';
import { PaymentLayoutComponent } from './views/payment-layout/payment-layout.component';
import { ReplacePipe } from 'projects/shared-utilities-lib/src/lib/pipes/replace-pipe';
import { PaymentAuditLogsModalComponent } from './views/payment-audit-logs-modal/payment-audit-logs-modal.component';
import { BrokerAccountSummaryComponent } from './views/broker-account-summary/broker-account-summary.component';
import { BrokerAccountsViewComponent } from './views/broker-accounts-view/broker-accounts-view.component';
import { BrokerCommissionDetailsViewComponent } from './views/broker-commission-details-view/broker-commission-details-view.component';
import { CommissionReleaseComponent } from './views/commission-release/commission-release.component';
import { CommissionReleaseConfirmationComponent } from './views/commission-release-confirmation/commission-release-confirmation.component';
import { CommissionProductReleaseComponent } from './views/commission-product-release/commission-product-release.component';
import { CommissionStatementComponent } from './views/commission-statement/commission-statement.component';
import { NotificationAuditLogsModalComponent } from './views/notification-audit-logs-modal/notification-audit-logs-modal.component'
import { PaymentSmsAuditComponent } from './views/payment-sms-audit/payment-sms-audit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './views/home/home.component';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { CommissionPaymentBankingUpdatedNotificationWizard } from './wizards/commission-payment-banking-updated-notification-wizard';
import { CommissionAuditTrailComponent } from './views/commission-audit-trail/commission-audit-trail.component';
import { CommissionEmailAuditDialogComponent } from './views/commission-email-audit-dialog/commission-email-audit-dialog.component';
import { ResendEmailDialogComponent } from './views/resend-email-dialog/resend-email-dialog.component'
import { BrokerAccountClawBackSummaryComponent } from './views/broker-account-clawback-summary/broker-account-clawback-summary.component';
import { PaymentAuditComponent } from './views/payment-audit/payment-audit.component';
import { PaymentPensionListComponent } from './views/payment-pension-list/payment-pension-list.component';
import { PaymentRecallComponent } from './views/payment-recall/payment-recall.component';
import { PaymentReversalWizard } from './wizards/payment-reversals/payment-reversal-wizard';
import { PaymentDetailsComponent } from './views/payment-details/payment-details.component';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { PaymentPoolComponent } from './views/payment-pool/payment-pool.component';
import { PaymentReversalComponent } from './views/payment-reversal/payment-reversal.component';
import { PaymentsWorkPoolComponent } from './views/payment-work-pool/payments-work-pool/payments-work-pool.component';
import { PaymentWorkPoolFilterComponent } from './views/payment-work-pool/payment-work-pool-filter/payment-work-pool-filter.component';
import { PaymentWorkPoolContainerComponent } from './views/payment-work-pool/payment-work-pool-container/payment-work-pool-container.component';
import { PaymentWorkPoolInfoComponent } from './views/payment-work-pool/payments-work-pool/payment-work-pool-info/payment-work-pool-info.component';
import { ManageWorkPoolUsersComponent } from './views/manage-work-pool-users/manage-work-pool-users.component';
import { AllocateWorkPoolItemComponent } from './views/allocate-work-pool-item/allocate-work-pool-item.component';
import { AllocateWorkPoolItemDialogComponent } from './views/allocate-work-pool-item/allocate-work-pool-item-dialog/allocate-work-pool-item-dialog.component';
import { UserPagedPaymentsComponent } from './views/manage-work-pool-users/user-paged-payments/user-paged-payments.component';
import {ManualPaymentDialogComponent} from './views/manual-payment-dialogue/manual-payment-dialog.component';
import { CommissionWorkPoolContainerComponent } from './views/commission-work-pool/commission-work-pool-container/commission-work-pool-container.component';
import { CommissionWorkPoolFilterComponent } from './views/commission-work-pool/commission-work-pool-filter/commission-work-pool-filter.component';
import { CommissionsWorkPoolComponent } from './views/commission-work-pool/commissions-work-pool/commissions-work-pool.component';
import { ManualAlloactionUnallocatedPaymentsComponent } from './views/manual-allocation/manual-alloaction-unallocated-payments/manual-alloaction-unallocated-payments.component';
import { ManualAllocationAllocatePaymentComponent } from './views/manual-allocation/manual-allocation-allocate-payment/manual-allocation-allocate-payment.component';
import { UnallocatedPaymentsComponent } from 'projects/shared-components-lib/src/lib/unallocated-payments/unallocated-payments.component';
import { AllocatedPaymentsComponent } from 'projects/shared-components-lib/src/lib/allocated-payments/allocated-payments.component';
import { AllocatedPaymentsDatasource } from 'projects/shared-components-lib/src/lib/allocated-payments/allocated-payments.datasource';
import { BankStatementReportComponent } from './views/bank-statement-report/bank-statement-report.component';
import { UploadHcpDiscountsComponent } from './views/upload-hcp-discounts/upload-hcp-discounts.component';
import { AllocateCommissionsPoolItemComponent } from './views/allocate-commissions-pool-item/allocate-commissions-pool-item.component';
import { AllocateCommissionsPoolItemDialogComponent } from './views/allocate-commissions-pool-item/allocate-commissions-pool-item-dialog/allocate-commissions-pool-item-dialog.component';
import { ManageCommissionPeriodsComponent } from './views/manage-commission-periods/manage-commission-periods.component';
import { AddCommissionPeriodComponent } from './views/manage-commission-periods/add-commission-period/add-commission-period.component';
import { EditCommissionPeriodComponent } from './views/manage-commission-periods/edit-commission-period/edit-commission-period.component';
import { CommissionEmailBrokerComponent } from './views/commission-email-broker/commission-email-broker.component';
import { ConfigureBusinessUsersComponent } from './views/configure-business-users/configure-business-users.component';

@NgModule({
  imports: [
    FrameworkModule,
    PaymentManagerRoutingModule,
    SharedModule,
    WizardModule,
  ],
  declarations: [
    PaymentClaimListComponent,
    PaymentCommissionListComponent,
    PaymentDialogComponent,
    PaymentLayoutComponent,
    PaymentListComponent,
    PaymentAuditLogsModalComponent,
    BrokerAccountSummaryComponent,
    BrokerAccountsViewComponent,
    BrokerCommissionDetailsViewComponent,
    CommissionReleaseComponent,
    CommissionReleaseConfirmationComponent,
    CommissionProductReleaseComponent,
    NotificationAuditLogsModalComponent,
    CommissionStatementComponent,
    PaymentSmsAuditComponent,
    HomeComponent,
    CommissionAuditTrailComponent,
    CommissionEmailAuditDialogComponent,
    ResendEmailDialogComponent,
    BrokerAccountClawBackSummaryComponent,
    PaymentAuditComponent,
    PaymentPensionListComponent,
    PaymentRecallComponent,
    PaymentDetailsComponent,
    PaymentPoolComponent,
    PaymentReversalComponent,
    PaymentsWorkPoolComponent,
    PaymentWorkPoolFilterComponent,
    PaymentWorkPoolContainerComponent,
    PaymentWorkPoolInfoComponent,
    ManageWorkPoolUsersComponent,
    AllocateWorkPoolItemComponent,
    AllocateWorkPoolItemDialogComponent,
    UserPagedPaymentsComponent,
    ManualPaymentDialogComponent,
    CommissionWorkPoolContainerComponent,
    CommissionWorkPoolFilterComponent,
    CommissionsWorkPoolComponent,
    ManualAlloactionUnallocatedPaymentsComponent,
    ManualAllocationAllocatePaymentComponent,
    UnallocatedPaymentsComponent,
    AllocatedPaymentsComponent,
    BankStatementReportComponent,
    UploadHcpDiscountsComponent,
    AllocateCommissionsPoolItemComponent,
    AllocateCommissionsPoolItemDialogComponent,
    ManageCommissionPeriodsComponent,
    AddCommissionPeriodComponent,
    EditCommissionPeriodComponent,
    CommissionEmailBrokerComponent,
    ConfigureBusinessUsersComponent,

  ],
  exports: [],
  entryComponents: [
    PaymentListComponent,
    PaymentDialogComponent,
    PaymentAuditLogsModalComponent,
    CommissionReleaseComponent,
    BrokerAccountsViewComponent,
    BrokerAccountSummaryComponent,
    BrokerCommissionDetailsViewComponent,
    CommissionReleaseConfirmationComponent,
    CommissionProductReleaseComponent,
    NotificationAuditLogsModalComponent,
    CommissionStatementComponent,
    PaymentSmsAuditComponent,
    CommissionAuditTrailComponent,
    CommissionEmailAuditDialogComponent,
    ResendEmailDialogComponent,
    BrokerAccountClawBackSummaryComponent,
    PaymentPoolComponent,
    AllocateWorkPoolItemComponent,
    AllocateWorkPoolItemDialogComponent,
    AllocateCommissionsPoolItemComponent,
    AllocateCommissionsPoolItemDialogComponent,
    ManageWorkPoolUsersComponent,
    UserPagedPaymentsComponent,
    AddCommissionPeriodComponent,
    EditCommissionPeriodComponent,
  ],
  providers: [
    PaymentService,
    NotesService,
    DatePipe,
    ReplacePipe,
    AllocatedPaymentsDatasource,
  ]
})
export class PaymentManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    wizardContextFactory: WizardContextFactory
  ) {
    wizardContextFactory.addWizardContext(new CommissionPaymentBankingUpdatedNotificationWizard(componentFactoryResolver), 'commission-payment-banking-updated-notification');
    wizardContextFactory.addWizardContext(new PaymentReversalWizard(componentFactoryResolver), 'payment-reversal-wizard');
  }
}
