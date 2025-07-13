import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';

@Component({
  templateUrl: './cad-request-invoice-payment.component.html'
})
export class CADRequestInvoicePayment extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

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
    return validationResult;
  }
}