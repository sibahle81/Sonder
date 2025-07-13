import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';
import { BehaviorSubject } from 'rxjs';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { Claim } from '../../../../shared/entities/funeral/claim.model';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimDisabilityTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-disabiity-type-enum';

@Component({
  templateUrl: './disability-assessment-approval.component.html'
})
export class ClaimDisabilityAssessmentApproval extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    selectedPersonEvent: PersonEventModel;
    selectedClaim: Claim;
    currentUser: User;
    
    defaultPEVTabIndex = 9;
    isReadOnly = false;
    defaultDisabilityType = ClaimDisabilityTypeEnum[ClaimDisabilityTypeEnum.DisabilityAssessment];

    constructor(
      private readonly appEventsManager: AppEventsManager,
      readonly activatedRoute: ActivatedRoute,
      readonly authService: AuthService,
      private readonly wizardService: WizardService,
      private readonly claimService: ClaimCareService) {
      super(appEventsManager, authService, activatedRoute);
    }

    ngOnInit() { 
      this.currentUser = this.authService.getCurrentUser();
    }

    onLoadLookups() { }

    createForm() { }

    populateModel() { }

    populateForm() { 
      this.getEvent();
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
      return validationResult;
    }

    getEvent() {
      this.claimService.getEvent(this.model.eventId).subscribe(result => {
        this.model.event = result;
        this.selectedPersonEvent = result.personEvents.find(p => p.personEventId == this.model.personEventId);
        this.isLoading$.next(false);
      });
    }

    setSelectedClaim($event: Claim) {
      this.selectedClaim = $event;
    }

    resetClaim() {
      this.selectedClaim = null;
    }
  
    saveWizardData() {
      const saveWizardRequest = this.context.createSaveWizardRequest();
      saveWizardRequest.updateLockedUser = true;
      saveWizardRequest.lockedToUser = this.authService.getUserEmail();
      saveWizardRequest.currentStep = this.context.wizard.currentStepIndex;
      this.wizardService.saveWizard(saveWizardRequest).subscribe();
    }
}