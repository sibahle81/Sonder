import { Component, OnInit } from '@angular/core';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
  selector: 'app-quote-home',
  templateUrl: './quote-home.component.html',
  styleUrls: ['./quote-home.component.css']
})
export class QuoteHomeComponent implements OnInit {

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');
  targetModuleType = ModuleTypeEnum.ClientCare;
  referralItemType = ReferralItemTypeEnum.Quote;

  constructor() { }

  ngOnInit() {
  }
}
