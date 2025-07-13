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

@Component({
  templateUrl: './medical-report-mismatch.component.html'
})
export class MedicalReportMismatch extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedPersonEvent: PersonEventModel;
  
  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly wizardService: WizardService,
    private readonly claimService: ClaimCareService,) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

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
}