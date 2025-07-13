import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';

@Component({
  templateUrl: './claim-pension-pmca.component.html'
})
export class ClaimPensionPMCA extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() { }

  populateModel() { }

  populateForm() {
   }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    // if(!this.model.claims || this.model.claims.length <= 0) {
    //   validationResult.errors++;
    //   validationResult.errorMessages.push('There are no claims to be investigated');
    // }
    return validationResult;
  }
}