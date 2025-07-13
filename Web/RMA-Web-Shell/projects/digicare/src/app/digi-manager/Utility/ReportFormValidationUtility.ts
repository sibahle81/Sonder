
import { Validators, UntypedFormGroup } from '@angular/forms';
import { ValidationResult } from './../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { TrimUtil } from './trim.util';

export default class ReportFormValidationUtility {

  static SetRequiredValidatorsWhenIsUnfitForWork(form: UntypedFormGroup): void {
    const unfitStartDateControl = form.get('unfitStartDate');
    const unfitEndDateControl = form.get('unfitEndDate');
    form.get('isUnfitForWork').valueChanges.subscribe(value => {
      if (value == 'Yes') {
        unfitStartDateControl.setValidators(Validators.required);
        unfitEndDateControl.setValidators(Validators.required);
      } else {
        unfitStartDateControl.clearValidators();
        unfitEndDateControl.clearValidators();
      }
    }
    );
    unfitStartDateControl.updateValueAndValidity();
    unfitEndDateControl.updateValueAndValidity();
  }


  static ValidateUnfitForWorkDates(model: any, form: UntypedFormGroup, validationResult: ValidationResult) {
    if (!model) return;

    const formControls = form.controls;

    let startDate = new Date(formControls.unfitStartDate.value);
    let endDate = new Date(formControls.unfitEndDate.value);

    if (startDate > endDate) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`The start date, '${startDate.toDateString().slice(4)}', is greater than the end date, '${endDate.toDateString().slice(4)}'.`);
    }
  }

  static FieldRequired(textControlName: string, message:string, form: UntypedFormGroup, validationResult: ValidationResult) {

    TrimUtil.trimField(form.get(textControlName));

    if (this.IsEmpty(form.get(textControlName).value)) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`${message} is required`);

    }
  }

  static DetailsRequiredWhen(option: string, radiobuttonControlName: string, textControlName: string, message: string, form: UntypedFormGroup, validationResult: ValidationResult) {

    TrimUtil.trimField(form.get(textControlName));

    if (form.get(radiobuttonControlName).value === option && this.IsEmpty(form.get(textControlName).value)) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`${message} details missing`);
    }
  }

  static SelectionRequired(radiobuttonControlName: string, message: string, form: UntypedFormGroup, validationResult: ValidationResult) {
    if (this.IsEmpty(form.get(radiobuttonControlName).value)) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`${message} Not completed`);
    }
  }

  static IsEmpty(str): boolean {
    return (!str || 0 === str.length || str === undefined);
  }
}
