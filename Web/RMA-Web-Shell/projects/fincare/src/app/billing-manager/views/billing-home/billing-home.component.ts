import { Component } from '@angular/core';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
  templateUrl: './billing-home.component.html'
})
export class BillingHomeComponent {
  disable_coid_vaps_e2e_billing = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_Billing');
  targetModuleType = ModuleTypeEnum.FinCare;
  referralItemType = ReferralItemTypeEnum.Debtor;

  constructor() {}
}


