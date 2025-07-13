import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';

@Component({
  templateUrl: './declaration-assistance-wizard.component.html'
})

export class DeclarationAssistanceWizardComponent extends WizardDetailBaseComponent<Policy[]> implements OnInit {

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
    this.model.forEach(policy => {
      policy.rolePlayerPolicyDeclarations.forEach(rolePlayerPolicyDeclaration => {
        if (rolePlayerPolicyDeclaration.variancePercentage && rolePlayerPolicyDeclaration.variancePercentage != 0) {

          if (!rolePlayerPolicyDeclaration.varianceReason || rolePlayerPolicyDeclaration.varianceReason == '') {
            validationResult.errors++;
            validationResult.errorMessages.push('A reason for variance is required');
          }

          if (!rolePlayerPolicyDeclaration.allRequiredDocumentsUploaded) {
            validationResult.errors++;
            validationResult.errorMessages.push('All required documentation must be uploaded');
          }
        }
      })
    });

    return validationResult;
  }
}
