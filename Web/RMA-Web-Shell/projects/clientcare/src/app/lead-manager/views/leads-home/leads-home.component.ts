import { Component, OnInit } from '@angular/core';
import { Lead } from '../../models/lead';
import { Router } from '@angular/router';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';

@Component({
  templateUrl: './leads-home.component.html',
  styleUrls: ['./leads-home.component.css']
})
export class LeadsHomeComponent extends PermissionHelper implements OnInit {

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');
  targetModuleType = ModuleTypeEnum.ClientCare;
  referralItemType = ReferralItemTypeEnum.Lead;

  constructor(
    public router: Router,
  ) {
    super();
  }

  ngOnInit() {
  }

  navigate($event: Lead) {
    this.router.navigate([`/clientcare/lead-manager/lead-view/${$event.leadId}`]);
  }
}
