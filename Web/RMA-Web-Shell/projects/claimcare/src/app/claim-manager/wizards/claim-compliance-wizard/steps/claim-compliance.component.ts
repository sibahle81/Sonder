import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { EventTypeEnum } from '../../../shared/enums/event-type-enum';
import { BehaviorSubject } from 'rxjs';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';

@Component({
  templateUrl: './claim-compliance.component.html',
  styleUrls: ['./claim-compliance.component.css']
})
export class ClaimComplianceComponent extends WizardDetailBaseComponent<PersonEventModel> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  
  defaultTab = 4;
  eventTypeLabel: string;

  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;

  complianceReviewNoteCaptured = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly claimService: ClaimCareService) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void { }

  createForm(id: number): void { }

  populateModel(): void { }

  populateForm(): void { 
    this.getEvent();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.complianceReviewNoteCaptured) {
      validationResult.errors++;
      validationResult.errorMessages.push('Compliance review note is required.');
    }
    return validationResult;
  }

  noteCaptured(noteCaptured: boolean) {
    this.complianceReviewNoteCaptured = noteCaptured;
  }

  getEvent() {
    this.claimService.getEvent(this.model.eventId).subscribe(result => {
      this.model.event = result;
      this.eventTypeLabel = result.eventType === EventTypeEnum.Disease ? 'Disease' : 'Injury';
      this.isLoading$.next(false);
    });
  }
}
