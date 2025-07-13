import { Component, OnInit, ViewChild } from '@angular/core';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PaymentOverviewComponent } from './fincare-dashboard-widgets/payment-overview/payment-overview.component';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
  selector: 'fincare-dashboard',
  templateUrl: './fincare-dashboard.component.html',
  styleUrls: ['./fincare-dashboard.component.css']
})

export class FincareDashboardComponent implements OnInit {

  @ViewChild(PaymentOverviewComponent, { static: true }) refundPayments: PaymentOverviewComponent;
  disable_coid_vaps_e2e_fincare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_FinCare');
  isShowNewFinanceDashboard = FeatureflagUtility.isFeatureFlagEnabled('IsShowNewFinanceDashboard');

  refund = PaymentTypeEnum.Refund;
  commission = PaymentTypeEnum.Commission;
  commission1 = PaymentTypeEnum.Commission;
  products = ['Corporate', 'Goldwage', 'Group', 'Individual'];
  prmaProducts = ['PRMA'];
  constructor() { }

  ngOnInit() {
  }
}
