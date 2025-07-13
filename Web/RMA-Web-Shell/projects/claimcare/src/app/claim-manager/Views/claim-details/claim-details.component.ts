import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Claim } from '../../shared/entities/funeral/claim.model';
import { ClaimCareService } from '../../Services/claimcare.service';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ClaimNotesComponent } from '../claim-notes/claim-notes.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';

@Component({
  selector: 'claim-details',
  templateUrl: './claim-details.component.html',
  styleUrls: ['./claim-details.component.css']
})
export class ClaimDetailsComponent extends WizardDetailBaseComponent<PersonEventModel> {

  @ViewChild(ClaimNotesComponent, { static: true }) claimNotesComponent: ClaimNotesComponent;

  claim: Claim;
  assessor: string = '';
  claimStatus: string;
  policyNumber: string;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private policyService: PolicyService,
    private readonly claimService: ClaimCareService) {

    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {
  }

  onLoadLookups(): void { }

  populateModel(): void {
  }

  populateForm(): void {
    if (this.model) {
      // triple-equals will not work with find and brings back undefined
      // tslint:disable-next-line: triple-equals
      this.claim = this.model.claims.find(a => a.policyId == this.model.claimPolicyId && a.personEventId == this.model.personEventId);
      this.policyService.getPolicy(this.claim.policyId).subscribe(result => {
        this.policyNumber = result.policyNumber;
      });
      this.getAssessor();
      this.getType();
      this.claimNotesComponent.getNotes(this.claim.claimId, ServiceTypeEnum.ClaimManager, 'Claim');
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  getAssessor() {
    if (this.claim.assignedToUserId != null || this.claim.assignedToUserId != undefined) {
      this.claimService.getClaimAssessor(this.claim.assignedToUserId).subscribe(result => {
        this.assessor = result.name;
      }
      );
    } else {
      this.assessor = '';
    }
  }


  // Getting the display name from the enum to show in Grid
  getType() {
    this.claimStatus = ClaimStatusEnum[ClaimStatusEnum[ClaimStatusEnum[this.claim.claimStatus]]];
  }
}

