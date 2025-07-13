import { Component, OnInit } from '@angular/core';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { billingItems } from './reports-manager-menu-items/billing-menu-items';
import { commissionItems } from './reports-manager-menu-items/commission-manager';
import { financeItems } from './reports-manager-menu-items/finance-manager-items';
import { ReportTypeMenuEnum } from '../../../shared/enum/report-type-menu.enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { Constants } from '../../../billing-manager/constants';
@Component({
  selector: 'app-reports-manager-layout',
  templateUrl: './reports-manager-layout.component.html',
  styleUrls: ['../../../../../../../assets/css/site.css']
})
export class ReportsManagerLayoutComponent extends ModuleMenuComponent implements OnInit {

  billingMenuItems = billingItems;
  financeMenuItems = financeItems;
  commissionMenuItems = commissionItems;
  isBilling = false;
  isCommission = false;
  isFinance = false;
  isMenuVisible = false;
  commissionReportType = ReportTypeMenuEnum.Commission;
  billingReportType = ReportTypeMenuEnum.Billing;
  financeReportType = ReportTypeMenuEnum.Finance;
  selectectedReportTypeMenu: ReportTypeMenuEnum;
  billingCoidFeaturesDisabled = FeatureflagUtility.isFeatureFlagEnabled(Constants.billingDisableCoidFeatureFlag);
  constructor(
    readonly router: Router,
    readonly authService: AuthService) {
    super(router);
  }

  ngOnInit() {
    if (this.billingCoidFeaturesDisabled) {
      const coidBillingReports = ['Premium Reconciliation'.toLocaleLowerCase(), 'Terms Arrangement Report'.toLocaleLowerCase(), 'Interest Calculation Report'.toLocaleLowerCase()
        , 'Interest Already Provisioned Report'.toLocaleLowerCase(), 'Provision Summary Report'.toLocaleLowerCase(), 'Member Portal Audit Trail Report'.toLocaleLowerCase()
        , 'Write Off Report'.toLocaleLowerCase(), 'Debtor Recon Report'.toLocaleLowerCase(), 'Bankstatement Recon Report'.toLocaleLowerCase()
        , 'Interest Report'.toLocaleLowerCase(), 'Interest Paid Summary Report'.toLocaleLowerCase()]
      this.billingMenuItems = [...this.billingMenuItems].filter(c => !coidBillingReports.includes(c.text.toLocaleLowerCase()))
    }
    this.sortItems(this.billingMenuItems);
    this.sortItems(this.financeMenuItems);
    this.sortItems(this.commissionMenuItems);
  }

  sortItems(items) {
    items.sort((a, b) => {
      if (a.text < b.text) { return -1; }
      if (a.text > b.text) { return 1; }
      return 0;
    });
  }

  setReportSelection(reportype: ReportTypeMenuEnum) {
    this.isMenuVisible = true;
    switch (reportype) {
      case ReportTypeMenuEnum.Billing:
        this.isBilling = true;
        this.isCommission = false;
        this.isFinance = false;
        this.selectectedReportTypeMenu = ReportTypeMenuEnum.Billing;
        break;
      case ReportTypeMenuEnum.Commission:
        this.isCommission = true;
        this.isBilling = false;
        this.isFinance = false;
        this.selectectedReportTypeMenu = ReportTypeMenuEnum.Commission;
        break;
      case ReportTypeMenuEnum.Finance:
        this.isFinance = true;
        this.isCommission = false;
        this.isBilling = false;
        this.selectectedReportTypeMenu = ReportTypeMenuEnum.Finance;
        break;
    }
  }

  childMenuClicked($event: boolean) {
    if ($event) {
      this.isFinance = false;
      this.isCommission = false;
      this.isBilling = false;
      this.isMenuVisible = false;
    }
  }
}