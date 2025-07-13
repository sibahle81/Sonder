import { NgModule } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { HomeComponent } from './billing-manager/views/home/home.component';
import { FincareAppRoutingModule } from './app-routing.module';
import { FincareDashboardComponent } from './dashboard/fincare-dashboard/fincare-dashboard.component';
import { PaymentDailyEstimatesComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-daily-estimates/payment-daily-estimates.component';
import { PaymentDailyEstimatesChartComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-daily-estimates-chart/payment-daily-estimates-chart.component';
import { ChartsModule } from 'ng2-charts';
import { PaymentEstimatesDatasource } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-daily-estimates/payment-estimates.datasource';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { ReportsManagerModule } from './reports-manager/reports-manager.module';
import { PaymentTableRefundDataSource } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-table-refund/payment-table-refund.datasource';
import { PaymentTableCommsionDataSource } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-table-commission/payment-table-commission.datasource';
import { PaymentTableRefundComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-table-refund/payment-table-refund.component';
import { PaymentTableCommissionComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-table-commission/payment-table-commission.component';
import { PaymentOverviewComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-overview/payment-overview.component';
import { PaymentTableClaimsComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-table-claims/payment-table-claims.component';
import { PaymentTableClaimsDataSource } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-table-claims/payment-table-claims.datasource';
import { RefundDashboardWidgetComponent } from './dashboard/collection-dashboard/collections-dashboard-widgets/refund-dashboard-widget/refund-dashboard-widget.component';
import { CollectionsDashboardComponent } from './dashboard/collection-dashboard/collections-dashboard.component';
import { RefundService } from './shared/services/refund.service';
import { RefundDashboardReasonWidgetComponent } from './dashboard/collection-dashboard/collections-dashboard-widgets/refund-dashboard-reason-widget/refund-dashboard-reason-widget.component';
import { RefundDashboardDetailsWidgetComponent } from './dashboard/collection-dashboard/collections-dashboard-widgets/refund-dashboard-details-widget/refund-dashboard-details-widget.component';
import { PolicyService } from './shared/services/policy.service';
import { CancellationsByMonthDashboardWidgetComponent } from './dashboard/collection-dashboard/collections-dashboard-widgets/cancellations-by-month-dashboard-widget/cancellations-by-month-dashboard-widget.component';
import { ClaimPaymentOverviewComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/claim-payment-overview/claim-payment-overview.component';
import { CancellationsByYearDashboardWidgetComponent } from './dashboard/collection-dashboard/collections-dashboard-widgets/cancellations-by-year-dashboard-widget/cancellations-by-year-dashboard-widget.component';
import { CancellationsByReasonDashboardWidgetComponent } from './dashboard/collection-dashboard/collections-dashboard-widgets/cancellations-by-reason-dashboard-widget/cancellations-by-reason-dashboard-widget.component';
import { CancellationsByResolvedDashboardWidgetComponent } from './dashboard/collection-dashboard/collections-dashboard-widgets/cancellations-by-resolved-dashboard-widget/cancellations-by-resolved-dashboard-widget.component';
import { BankAccountBalancesComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/bank-account-balances/bank-account-balances.component';
import { CommissionTableComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/commission-table/commission-table.component';
import { EstimationDashboardComponent } from './dashboard/estimation-dashboard/estimation-dashboard.component';
import { PaymentPendingComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/payment-pending/payment-pending.component';
import { DailyPaymentsEstimatesComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/daily-payments-estimates/daily-payments-estimates.component';
import { DailyPaymentEstimatesDatasource } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/daily-payments-estimates/daily-payments-estimates.datasource';
import { PrmaPaymentOverviewComponent } from './dashboard/fincare-dashboard/fincare-dashboard-widgets/prma-payment-overview/prma-payment-overview.component';

@NgModule({
  declarations: [
    HomeComponent,
    ClaimPaymentOverviewComponent,
    FincareDashboardComponent,
    PaymentDailyEstimatesComponent,
    PaymentDailyEstimatesChartComponent,
    PaymentTableClaimsComponent,
    PaymentTableRefundComponent,
    PaymentTableCommissionComponent,
    PaymentOverviewComponent,
    RefundDashboardWidgetComponent,
    CollectionsDashboardComponent,
    RefundDashboardReasonWidgetComponent,
    RefundDashboardDetailsWidgetComponent,
    CancellationsByMonthDashboardWidgetComponent,
    CancellationsByYearDashboardWidgetComponent,
    CancellationsByResolvedDashboardWidgetComponent,
    CancellationsByReasonDashboardWidgetComponent,
    BankAccountBalancesComponent,
    CommissionTableComponent,
    EstimationDashboardComponent,
    PaymentPendingComponent,
    DailyPaymentsEstimatesComponent,
    PrmaPaymentOverviewComponent
  ],
  imports: [
    FrameworkModule,
    ChartsModule,
    FincareAppRoutingModule,
    ReportsManagerModule,
  ],
  exports: [
    HomeComponent
  ],
  providers: [
    PaymentEstimatesDatasource,
    PaymentTableRefundDataSource,
    PaymentTableClaimsDataSource,
    PaymentTableCommsionDataSource,
    BrokerageService,
    RefundService,
    PolicyService,
    DailyPaymentEstimatesDatasource
  ],
  bootstrap: [
  ]
})
export class FinCareAppModule { }
