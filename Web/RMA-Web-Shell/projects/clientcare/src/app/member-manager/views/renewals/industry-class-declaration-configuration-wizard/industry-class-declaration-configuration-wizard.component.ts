import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { IndustryClassDeclarationConfiguration } from '../../../models/industry-class-declaration-configuration';

@Component({
  templateUrl: './industry-class-declaration-configuration-wizard.component.html',
  styleUrls: ['./industry-class-declaration-configuration-wizard.component.css']
})

export class IndustryClassDeclarationConfigurationWizardComponent extends WizardDetailBaseComponent<IndustryClassDeclarationConfiguration[]> implements OnInit {

  isValid = true;

  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
  }

  createForm(id: number): void {
    return;
  }

  onLoadLookups(): void {
    return;
  }

  populateModel(): void { return; }

  populateForm(): void { }

  getIndustryClassString(industryClass: IndustryClassEnum): string {
    return IndustryClassEnum[industryClass];
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model || (this.model && this.model.length <= 0)) {
      validationResult.errorMessages.push('At least one configuration is required');
      validationResult.errors += 1;
    }

    if (this.model && this.model.length > 0) {
      this.model.forEach(s => {
        if (!s.maxAverageEarnings || (s.maxAverageEarnings && s.maxAverageEarnings.length <= 0)) {
          validationResult.errorMessages.push('At least one maximum average earnings is required for ' + this.getIndustryClassString(s.industryClass));
          validationResult.errors += 1;
        }
      });
    }

    if (!this.isValid) {
      validationResult.errorMessages.push('Invalid form, please close or complete the form');
      validationResult.errors += 1;
    }
    return validationResult;
  }

  setValidity($event: boolean) {
    this.isValid = $event;
  }
}
