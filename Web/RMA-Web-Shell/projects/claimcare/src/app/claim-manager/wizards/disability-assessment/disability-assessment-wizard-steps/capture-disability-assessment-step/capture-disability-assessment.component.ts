import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { BehaviorSubject } from 'rxjs';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { ClaimDisabilityAssessment } from '../../../../shared/claim-care-shared/claim-disability-container/claim-disability-assessment/claimDisabilityAssessment';

@Component({
  templateUrl: './capture-disability-assessment.component.html'
})
export class CaptureDisibilityAssessment extends WizardDetailBaseComponent<ClaimDisabilityAssessment> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  personEvent: PersonEventModel;

  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly claimService: ClaimCareService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() { }

  populateModel() { }

  populateForm() {
    this.getPersonEvent();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    // if (!this.earnings || this.earnings.length <= 0) {
    //   validationResult.errors++;
    //   validationResult.errorMessages.push('earnings must be captured');
    // }

    return validationResult;
  }

  getPersonEvent() {
    this.claimService.getPersonEvent(this.model.personEventId).subscribe(result => {
      this.personEvent = result;
      this.isLoading$.next(false);
    });
  }
}