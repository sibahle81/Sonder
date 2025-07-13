import { Component, OnInit } from '@angular/core';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  disable_coid_vaps_e2e_fincare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_FinCare');
  targetModuleType = ModuleTypeEnum.FinCare;
  referralItemType = ReferralItemTypeEnum.Payment;
  constructor() { }

  ngOnInit() {
  }

}
