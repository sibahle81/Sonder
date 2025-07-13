import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Policy } from '../../shared/entities/policy';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { policyUtility } from 'projects/shared-utilities-lib/src/lib/policy-utility/policy-utility';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { ClientTypeEnum } from '../../shared/enums/client-type-enum';

@Component({
  templateUrl: './policy-search.component.html',
  styleUrls: ['./policy-search.component.css'],
})

export class PolicySearchComponent {

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');

  constructor(
    private readonly router: Router) {
  }

  policySelected(policy: Policy) {
    if (policyUtility.isFuneral(policy)) {
      if (policy?.policyOwner?.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person) {
        this.router.navigate([`/clientcare/policy-manager/view-policy/${policy.policyId}`]);
      } else {
        this.router.navigate([`/clientcare/policy-manager/view-policy-group/${policy.policyId}`]);
      }
    } else {
      this.router.navigate([`/clientcare/policy-manager/member-wholistic-view/${policy.policyOwnerId}/1/${policy.policyId}`]);
    }
  }

  memberSelected($event: RolePlayer) {
    this.router.navigate([`/clientcare/policy-manager/member-wholistic-view/${$event.rolePlayerId}`]);
  }

  rolePlayerSelected($event: RolePlayer) {
    if ($event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person) {
      this.router.navigate([`/clientcare/policy-manager/holistic-role-player-view/${$event.rolePlayerId}`]);
    }

    if ($event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Company
      || $event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.SundryServiceProvider
      || $event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.HealthCareProvider
      || $event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.LegalPractitioner) {
      this.router.navigate([`/clientcare/policy-manager/holistic-role-player-view/${$event.rolePlayerId}`]);
    }
  }
}


