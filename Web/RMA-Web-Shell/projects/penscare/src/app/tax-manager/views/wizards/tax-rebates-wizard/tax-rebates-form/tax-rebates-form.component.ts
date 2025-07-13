import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { FormUtil } from 'projects/shared-utilities-lib/src/lib/form-utility/form-utility';
import { TaxRebatesNotification } from '../../../../models/tax-rebates-notification.model';

@Component({
  selector: 'app-tax-rebates-form',
  templateUrl: './tax-rebates-form.component.html'
})
export class TaxRebatesFormComponent extends WizardDetailBaseComponent<TaxRebatesNotification> implements OnInit {
  formUtil = new FormUtil();
  disabledFieldsData = {};

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.createForm();
  }


  createForm(): void {
    if (this.form) {
      return
    }
    this.form = this.formBuilder.group({
      year: new UntypedFormControl(''),
      primary: new UntypedFormControl('', [Validators.required, this.validateAmount]),
      secondary: new UntypedFormControl('', [Validators.required, this.validateAmount]),
      tertiary: new UntypedFormControl('', [Validators.required, this.validateAmount]),
      primaryMinimumTax: new UntypedFormControl('', [Validators.required, this.validateAmount]),
      secondaryMinimumTax: new UntypedFormControl('', [Validators.required, this.validateAmount]),
      tertiaryMinimumTax: new UntypedFormControl('', [Validators.required, this.validateAmount]),
      action: new UntypedFormControl('')
    });
  }

  onLoadLookups(): void {}

  validateAmount(control: AbstractControl) {
    if (!control || !control.parent || control.value === null) { return null; }
    if (Number(control.value) <= 0) return { zeroOrLessAmount: true };
    return null;
  }

  populateModel(): void {
    this.form.patchValue(this.disabledFieldsData);
    const formModel = this.form.getRawValue();
    this.model.primary = formModel.primary;
    this.model.secondary = formModel.secondary;
    this.model.tertiary = formModel.tertiary;
    this.model.primaryMinimumTax = formModel.primaryMinimumTax;
    this.model.secondaryMinimumTax = formModel.secondaryMinimumTax;
    this.model.tertiaryMinimumTax = formModel.tertiaryMinimumTax;
    this.model.year = formModel.year;
  }

  populateForm(): void {
    if (this.model) this.form.patchValue(this.model);
    if (this.model.action === 'Edit') {
      this.form.controls['year'].disable
    }
    this.disabledFieldsData = this.formUtil.getDisabledFieldsData(this.form);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult
  }
}
