import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { Payment } from '../../../models/payment.model';

@Component({
  templateUrl: './payment-reversal.component.html'
})
export class PaymentReversalComponent extends WizardDetailBaseComponent<Payment> implements OnInit {
  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

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
    return;
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
