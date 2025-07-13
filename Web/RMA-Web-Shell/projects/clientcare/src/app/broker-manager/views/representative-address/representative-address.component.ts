import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { Representative } from '../../models/representative';

@Component({
  selector: 'representative-address',
  templateUrl: './representative-address.component.html',
  styleUrls: ['./representative-address.component.css']
})
export class RepresentativeAddressComponent extends WizardDetailBaseComponent<Representative> {

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id],
      physicalAddress1: [''],
      physicalAddress2: [''],
      physicalAddressCity: [''],
      physicalAddressCode: [''],
    });
  }

  populateForm(): void {
    this.form.patchValue({
      id: this.model.id,
      physicalAddress1: this.model.physicalAddress ? this.model.physicalAddress.line1 : '',
      physicalAddress2: this.model.physicalAddress ? this.model.physicalAddress.line2 : '',
      physicalAddressCity: this.model.physicalAddress ? this.model.physicalAddress.city : '',
      physicalAddressCode: this.model.physicalAddress ? this.model.physicalAddress.code : ''
    });
    this.form.disable();
  }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
