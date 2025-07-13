import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { InterestIndicator } from '../../../../models/InterestIndicator';

@Component({
  templateUrl: './interest-indicator-wizard-step.component.html',
  styleUrls: ['./interest-indicator-wizard-step.component.css']
})
export class InterestIndicatorWizardStepComponent extends WizardDetailBaseComponent<InterestIndicator> {
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
  ) 
  {
    super(appEventsManager, authService, activatedRoute);
  }
  createForm(id: number): void {
    
  }
  onLoadLookups(): void {
    
  }
  populateModel(): void {
    
  }
  populateForm(): void {
    
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
     return validationResult;
  }
}
