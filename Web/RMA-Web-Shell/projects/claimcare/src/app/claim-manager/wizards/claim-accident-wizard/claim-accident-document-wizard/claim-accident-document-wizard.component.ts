import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

@Component({
  selector: 'app-claim-accident-document-wizard',
  templateUrl: './claim-accident-document-wizard.component.html',
  styleUrls: ['./claim-accident-document-wizard.component.css']
})
export class ClaimAccidentDocumentWizardComponent extends WizardDetailBaseComponent<EventModel> implements OnInit {

  triggerRefresh = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    return;
  }

  createForm(id: number): void {
    return;
  }

  onLoadLookups(): void {
    return;
  }

  populateModel(): void {
    return;
  }

  populateForm(): void {
    if (this.context) {
      this.triggerRefresh = !this.triggerRefresh;
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if(this.model.personEvents.some(s => !s.personEventClaimRequirements || s.personEventClaimRequirements?.length <= 0)) {
      validationResult.errorMessages.push('Please verify that all employees have the minimum claim requirements');
      validationResult.errors = validationResult.errors + 1;
    }

    return validationResult;
  }
}
