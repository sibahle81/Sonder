import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { PremiumListing } from '../../shared/entities/premium-listing';

@Component({
  selector: 'app-premium-listing-document-selection',
  templateUrl: './premium-listing-document-selection.component.html',
  styleUrls: ['./premium-listing-document-selection.component.css']
})
export class PremiumListingDocumentSelectionComponent extends WizardDetailBaseComponent<PremiumListing> {

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      groupWelcomeLetter: [],
      groupPolicySchedule: [],
      groupTermsAndConditions: [],
      memberWelcomeLetter: [],
      memberPolicySchedule: [],
      memberTermsAndConditions: []
    });
  }

  populateForm(): void {
    if (!this.model) { return; }
    this.form.patchValue({
      groupWelcomeLetter: this.model.groupWelcomeLetter,
      groupPolicySchedule: this.model.groupPolicySchedule,
      groupTermsAndConditions: this.model.groupTermsAndConditions,
      memberWelcomeLetter: this.model.memberWelcomeLetter,
      memberPolicySchedule: this.model.memberPolicySchedule,
      memberTermsAndConditions: this.model.memberTermsAndConditions
    });
  }

  populateModel(): void {
    const values = this.form.getRawValue();
    this.model.groupWelcomeLetter = values.groupWelcomeLetter;
    this.model.groupPolicySchedule = values.groupPolicySchedule;
    this.model.groupTermsAndConditions = values.groupTermsAndConditions;
    this.model.memberWelcomeLetter = values.memberWelcomeLetter;
    this.model.memberPolicySchedule = values.memberPolicySchedule;
    this.model.memberTermsAndConditions = values.memberTermsAndConditions;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
