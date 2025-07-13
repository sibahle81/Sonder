import { Component, OnInit } from '@angular/core';
import { BreadcrumbPolicyService } from '../../../policy-manager/services/breadcrumb-policy.service';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';

@Component({
  templateUrl: './policy-manager-home.component.html',
})
export class PolicyManagerHomeComponent implements OnInit {

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');
  targetModuleType = ModuleTypeEnum.ClientCare;
  referralItemType = ReferralItemTypeEnum.Policy;

  constructor(private readonly breadcrumbService: BreadcrumbPolicyService) {
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumb('Policy Home');
  }
}
