import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  templateUrl: './role-player-details-step.component.html'
})

export class RolePlayerDetailsStepComponent extends WizardDetailBaseComponent<RolePlayer> implements OnInit {

  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  createForm(id: number): void { return; }

  onLoadLookups(): void { return; }

  populateModel(): void { return; }

  populateForm(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.rolePlayerAddresses?.length <= 0) {
      validationResult.errors++;
      validationResult.errorMessages.push('At least one addess is required');
    }

    return validationResult;
  }
}