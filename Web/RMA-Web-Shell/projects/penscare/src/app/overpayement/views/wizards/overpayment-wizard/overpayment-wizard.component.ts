import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { OutstandingOverpayment, OverPayment } from '../../../models/overpayment';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PensIncreaseLookups } from 'projects/penscare/src/app/annual-increase/models/annual-increase-lookups';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { OverPaymentForm } from '../../../models/overpayment-form.interface';

@Component({
  selector: 'app-overpayment-wizard',
  templateUrl: './overpayment-wizard.component.html',
  styleUrls: ['./overpayment-wizard.component.css']
})
export class OverpaymentWizardComponent extends WizardDetailBaseComponent<OutstandingOverpayment> {

  form: FormGroup;
  lookups: PensIncreaseLookups;

  constructor(private readonly _fb: FormBuilder,
              appEventsManager: AppEventsManager,
              authService: AuthService,
              activatedRoute: ActivatedRoute,) {
              super(appEventsManager, authService, activatedRoute);
  }

  createForm(): void {
    this.form = this._fb.group<OverPaymentForm>({
      ledgerId: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      deceasedNames: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      dateOfDeath: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      lastPaymentDate: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      normalMonthlyPension: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      overpaymentAmount: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
    });
  }

  onLoadLookups(): void {}

  populateModel(): void {
    const value = this.form.getRawValue();
    if (!this.model) {
      this["model"] = new OutstandingOverpayment();
    }

    this.model.ledgerId =  value.ledgerId;
    this.model.deceasedNames =  value.deceasedNames;
    this.model.dateOfDeath =  value.dateOfDeath;
    this.model.lastPaymentDate = value.lastPaymentDate ;
    this.model.normalMonthlyPension =  value.normalMonthlyPension;
    this.model.overpaymentAmount =  value.overpaymentAmount;

  }

  populateForm(): void {
    if (this.model) {
      this.form.patchValue({
        ledgerId: this.model.ledgerId,
        deceasedNames: this.model.deceasedNames,
        dateOfDeath: this.model.dateOfDeath,
        lastPaymentDate: this.model.lastPaymentDate,
        normalMonthlyPension: this.model.normalMonthlyPension,
        overpaymentAmount: this.model.overpaymentAmount,
      });
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model) {}
    return validationResult;
  }

}
