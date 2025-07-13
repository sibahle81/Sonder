import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-claim-information-list',
  templateUrl: './claim-information-list.component.html',
  styleUrls: ['./claim-information-list.component.css']
})
export class ClaimInformationListComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit {
  showTable: boolean;
  dataSource: PensionClaim[];
  selectedClaim: PensionClaim;
  viewFormMode: boolean;

  displayedColumns = ['claimNumber', 'dateOfAccident', 'dateOfStabilisation', 'earnings', 'pensionLumpSum', 'estimatedCV', 'actions'];

  menus = [
    { title: 'View', action: 'view', disable: false }
  ];


  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
  }

  createForm(): void {}
  onLoadLookups(): void {}
  populateModel(): void {
    this.model.pensionClaims = this.dataSource;
  }

  populateForm(): void {
    if (this.model.pensionClaims) {
      this.dataSource = this.model.pensionClaims;
      this.showTable = true;
      this.viewFormMode = false;
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult
  }


  onViewClaims() {
    this.showTable = true;
    this.viewFormMode = false;
  }

  onMenuItemClick(claim: PensionClaim, menu: any): void {
    switch (menu.action) {
      case 'view':
        this.viewClaim(claim);
        break;
    }
  }

  viewClaim(claim: PensionClaim) {
    this.selectedClaim =  claim;
    this.showTable = false;
    this.viewFormMode = true;
  }
}
