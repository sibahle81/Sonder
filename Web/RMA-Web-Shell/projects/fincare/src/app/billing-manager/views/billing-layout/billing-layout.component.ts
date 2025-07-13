import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { monthEndItems } from './billing-layout-menu-items/month-end-report-items';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { Constants } from '../../constants';

@Component({
  styleUrls: ['../../../../../../../assets/css/site.css'],
  templateUrl: './billing-layout.component.html'
})
export class BillingLayoutComponent extends ModuleMenuComponent implements OnInit {
  loadingMessage: string;
  error: Error;
  canRefund: boolean;
  menu2Selected: boolean;
  menu3Selected: boolean;
  menu4Selected: boolean;
  menu5Selected: boolean;
  menu6Selected: boolean;
  menu7Selected: boolean;
  menu8Selected: boolean;
  menu9Selected: boolean;
  allocationMenuSelected: boolean;
  refundsMenuSelected: boolean;
  reversalsMenuSelected: boolean;
  documentsMenuSelected: boolean;
  statementsMenuSelected: boolean;
  termsArrangementMenuSelected: boolean;
  interestMenuSelected: boolean;
  writeoffMenuSelected: boolean;
  hasCaptureAdhocPremiumCollectionPermission = userUtility.hasPermission('Capture Ad hoc Premium Collection');
  hasCreateCreditNotePermission = userUtility.hasPermission('Create Credit Note');
  hasCreditReallocationPermission = userUtility.hasPermission('Start Credit Reallocations') || userUtility.hasPermission('Approve Credit Reallocations');
  hasCreateInterBankTransferPermission = userUtility.hasPermission('Create inter-bank-transfer');
  hasCreateInterDebtorTransferPermission = userUtility.hasPermission('Create Inter Debtor Transfer');
  hasConfirmPremiumReceivedPermission = userUtility.hasPermission('Confirm Premium Received');
  hasUploadAgentPermission = userUtility.hasPermission('Upload Agent');
  hasCaptureTermsArrangementApplicationPermission = userUtility.hasPermission('Capture Terms Arrangement Application');
  hasViewTermsArrangementPermission = userUtility.hasPermission('View Terms Arrangement');
  monthMenuEndItems = monthEndItems;
  coidFeaturesDisabled = FeatureflagUtility.isFeatureFlagEnabled(Constants.billingDisableCoidFeatureFlag);
  top50PlusMunicipalitiesFeatureFlag = FeatureflagUtility.isFeatureFlagEnabled(Constants.top50PlusMunicipalitiesFeatureFlag);
  
  constructor(
    readonly router: Router,
    readonly authService: AuthService) {
    super(router);
  }

  ngOnInit() {
    this.setMenuPermissions();
    this.sortItems(this.monthMenuEndItems);
  }

  setMenuPermissions(): void {
    this.canRefund = userUtility.hasPermission('Authorise Refunds') || userUtility.hasPermission('Add Refunds') || userUtility.hasPermission('View Refunds') || userUtility.hasPermission('Approve Refunds');
  }

  createAdhocCollection(): void {
    this.router.navigate(['/fincare/billing-manager/adhoc-collection/new/-1']);
  }

  createTermsArrangement(): void {
    this.router.navigate(['/fincare/billing-manager/terms-arrangement/new/-1']);
  }

  createAdhocInterest(): void {
    this.router.navigate(['/fincare/billing-manager/adhoc-interest/new/-1']);
  }

  onMenuClicked(menuName: string) {
    switch (menuName) {
      case 'menu2': {
        this.menu2Selected = true;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.menu9Selected = false;
        break;
      }
      case 'menu3': {
        this.menu2Selected = false;
        this.menu3Selected = true;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.menu9Selected = false;
        break;
      }
      case 'menu4': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = true;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.menu9Selected = false;
        break;
      }
      case 'menu5': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = true;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.menu9Selected = false;
        break;
      }
      case 'menu6': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = true;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.menu9Selected = false;
        break;
      }
      case 'menu7': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = true;
        this.menu8Selected = false;
        this.menu9Selected = false;
        break;
      }
      case 'menu8': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = true;
        this.menu9Selected = false;
        break;
      }
      case 'allocation': {
        this.menu2Selected = false;
        this.menu3Selected = true;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.allocationMenuSelected = true;
        this.refundsMenuSelected = false;
        this.reversalsMenuSelected = false;
        this.documentsMenuSelected = false;
        this.statementsMenuSelected = false;
        this.interestMenuSelected = false;
        this.menu9Selected = false;
        break;
      }
      case 'refunds': {
        this.menu2Selected = false;
        this.menu3Selected = true;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.allocationMenuSelected = false;
        this.refundsMenuSelected = true;
        this.reversalsMenuSelected = false;
        this.documentsMenuSelected = false;
        this.statementsMenuSelected = false;
        this.interestMenuSelected = false;
        this.menu9Selected = false;
        break;
      }
      case 'reversals': {
        this.menu2Selected = false;
        this.menu3Selected = true;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.allocationMenuSelected = false;
        this.refundsMenuSelected = false;
        this.reversalsMenuSelected = true;
        this.documentsMenuSelected = false;
        this.statementsMenuSelected = false;
        this.interestMenuSelected = false;
        this.menu9Selected = false;
        break;
      }
      case 'documents': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = true;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.allocationMenuSelected = false;
        this.refundsMenuSelected = false;
        this.reversalsMenuSelected = false;
        this.documentsMenuSelected = true;
        this.statementsMenuSelected = false;
        this.interestMenuSelected = false;
        this.menu9Selected = false;
        break;
      }
      case 'statements': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = true;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.allocationMenuSelected = false;
        this.refundsMenuSelected = false;
        this.reversalsMenuSelected = false;
        this.documentsMenuSelected = true;
        this.statementsMenuSelected = true;
        this.interestMenuSelected = false;
        this.menu9Selected = false;
        break;
      }
      case 'terms-arrangement': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = true;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.termsArrangementMenuSelected = true;
        this.menu9Selected = false;
        break;
      }
      case 'interest': {
        this.menu2Selected = false;
        this.menu3Selected = true;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.allocationMenuSelected = false;
        this.refundsMenuSelected = false;
        this.interestMenuSelected = true;
        this.reversalsMenuSelected = false;
        this.documentsMenuSelected = false;
        this.statementsMenuSelected = false;
        this.menu9Selected = false;
        break;
      }
      case 'groupriskbilling': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.menu9Selected = true;
        break;
      }
      case 'writeoff': {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.menu9Selected = true;
        break;
      }
      default: {
        this.menu2Selected = false;
        this.menu3Selected = false;
        this.menu4Selected = false;
        this.menu5Selected = false;
        this.menu6Selected = false;
        this.menu7Selected = false;
        this.menu8Selected = false;
        this.allocationMenuSelected = false;
        this.refundsMenuSelected = false;
        this.reversalsMenuSelected = false;
        this.documentsMenuSelected = false;
        this.statementsMenuSelected = false;
        this.termsArrangementMenuSelected = false;
        this.menu9Selected = false;
      }
    }
  }

  sortItems(items) {
    items.sort((a, b) => {
      if (a.text < b.text) { return -1; }
      if (a.text > b.text) { return 1; }
      return 0;
    });
  }
}
