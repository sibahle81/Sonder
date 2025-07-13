import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ProductOption } from '../../models/product-option';

@Component({
  templateUrl: './product-option-settings-wizard.component.html',
  styleUrls: ['./product-option-settings-wizard.component.css']
})
export class ProductOptionSettingsWizardComponent extends WizardDetailBaseComponent<ProductOption> {

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  trigger: boolean;
  createForm(id: number): void {
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
  }

  populateForm(): void {
    // this was added to force the ngOnChange to fire as the details component does not fire the ngOnChanges
    this.trigger = !this.trigger;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.baseRate) {
      if (this.model.baseRate <= 0 || this.model.baseRate > 100) {
        validationResult.errorMessages.push('Base Rate % is invalid');
        validationResult.errors += 1;
      }
    }

    return validationResult;
  }
}
