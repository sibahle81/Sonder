import { Component } from '@angular/core';
import { RolePlayer } from '../../../policy-manager/shared/entities/roleplayer';
import { Router } from '@angular/router';
import { Policy } from '../../../policy-manager/shared/entities/policy';
import { policyUtility } from 'projects/shared-utilities-lib/src/lib/policy-utility/policy-utility';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { RolePlayerService } from '../../../policy-manager/shared/Services/roleplayer.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './member-search.component.html',
  styleUrls: ['./member-search.component.css']
})
export class MemberSearchComponent extends PermissionHelper {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');

  constructor(
    private readonly router: Router,
    private readonly rolePlayerService: RolePlayerService
  ) {
    super();
  }

  memberSelected($event: RolePlayer) {
    this.router.navigate([`/clientcare/member-manager/member-wholistic-view/${$event.rolePlayerId}`]);
  }

  policySelected(policy: Policy) {
    if (policyUtility.isFuneral(policy)) {
      // KEEP FOR FUTURE
      // if (policy?.policyOwner?.clientType == ClientTypeEnum.Individual) {
      //   this.router.navigate([`/clientcare/policy-manager/view-policy/${policy.policyId}`]);
      // } else {
      //   this.router.navigate([`/clientcare/policy-manager/view-policy-group/${policy.policyId}`]);
      // }
      this.getRolePlayer(policy);
    } else {
      this.router.navigate([`/clientcare/member-manager/member-wholistic-view/${policy.policyOwnerId}/1/${policy.policyId}`]);
    }
  }

  rolePlayerSelected($event: RolePlayer) {
    if ($event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person) {
      this.router.navigate([`/clientcare/member-manager/holistic-role-player-view/${$event.rolePlayerId}`]);
    }

    if ($event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Company
      || $event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.SundryServiceProvider
      || $event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.HealthCareProvider
      || $event.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.LegalPractitioner) {
      this.router.navigate([`/clientcare/member-manager/holistic-role-player-view/${$event.rolePlayerId}`]);
    }
  }

  getRolePlayer(policy: Policy) {
    this.isLoading$.next(true);
    this.rolePlayerService.getRolePlayer(policy.policyOwnerId).subscribe(result => {
      if (result.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person) {
        this.router.navigate([`/clientcare/member-manager/holistic-role-player-view/${policy.policyOwnerId}/1/${policy.policyId}`]);
      }
  
      if (result.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Company
        || result.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.SundryServiceProvider
        || result.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.HealthCareProvider
        || result.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.LegalPractitioner) {
        this.router.navigate([`/clientcare/member-manager/holistic-role-player-view/${policy.policyOwnerId}/1/${policy.policyId}`]);
      }
    });
  }
}
