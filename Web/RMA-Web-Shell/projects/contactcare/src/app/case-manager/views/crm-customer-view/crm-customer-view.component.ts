import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { PersonEvent } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/person-event';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClaimSearchResult } from 'projects/shared-components-lib/src/lib/searches/claim-search/claim-search-result.model';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

@Component({
  templateUrl: './crm-customer-view.component.html',
  styleUrls: ['./crm-customer-view.component.css']
})
export class CRMCustomerViewComponent extends UnSubscribe {

  advancedFiltersExpanded = true;

  selectedRolePlayer: RolePlayer;
  selectedPolicy: Policy;
  selectedClaim: Claim;

  supportedPersonTypes: RolePlayerIdentificationTypeEnum[] = [RolePlayerIdentificationTypeEnum.Person];
  supportedCompanyTypes: RolePlayerIdentificationTypeEnum[] = [RolePlayerIdentificationTypeEnum.Company, RolePlayerIdentificationTypeEnum.SundryServiceProvider, RolePlayerIdentificationTypeEnum.HealthCareProvider, RolePlayerIdentificationTypeEnum.LegalPractitioner];

  constructor(
    public router: Router,
  ) {
    super();
  }

  rolePlayerSelected(rolePlayer: RolePlayer) {
    this.selectedRolePlayer = rolePlayer;
    this.selectedPolicy = null;

    this.advancedFiltersExpanded = false;
  }

  policySelected(policy: Policy) {
    this.selectedRolePlayer = policy.policyOwner;
    this.selectedPolicy = policy;

    this.advancedFiltersExpanded = false;
  }

  reset() {
    this.selectedRolePlayer = null;
    this.selectedPolicy = null;
    this.advancedFiltersExpanded = true;
  }
}
