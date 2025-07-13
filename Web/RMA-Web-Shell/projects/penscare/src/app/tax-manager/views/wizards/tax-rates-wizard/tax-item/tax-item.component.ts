import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { TaxRate } from '../../../../models/tax-rate.model';

@Component({
  selector: 'app-tax-item',
  templateUrl: './tax-item.component.html',
  styleUrls: ['./tax-item.component.css']
})
export class TaxItemComponent implements OnInit {
  form: UntypedFormGroup;
  @Input() taxRatesDataSource: TaxRate[];
  @Input() modifiedData: TaxRate;
  @Output() cancelButtonClicked = new EventEmitter<any>();
  @Output() saveButtonClicked = new EventEmitter<any>();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      fromIncome: [this.modifiedData ? this.modifiedData.fromIncome : '', [Validators.required, this.validateIncome]],
      toIncome: [this.modifiedData ? this.modifiedData.toIncome : '', [this.validateIncome]],
      standardTaxRate: [this.modifiedData ? this.modifiedData.standardTaxRate : '', [this.validateIncome]],
      taxPercentageRate: [this.modifiedData ? this.modifiedData.taxPercentageRate : '', [Validators.required, this.validateIncome]],
    });
  }

  validateIncome(control: AbstractControl) {
    if (!control || !control.parent || !control.value) { return null; }
    if (control.parent.controls['toIncome'].value == '') return null;

    const fromIncome = Number(control.parent.controls['fromIncome'].value);
    const toIncome = Number(control.parent.controls['toIncome'].value);

    if (Number(control.value) < 0) return { negativeAmount: true}
    if (toIncome <= fromIncome) return { fromIncomeGreaterThanToIncome: true };
    if (toIncome <= fromIncome) return { fromIncomeGreaterThanToIncome: true };

    return null;
  }

  save() {
    this.validateAllFormFields(this.form);
    if (this.form.valid) {
      const _modifiedData: TaxRate = this.modifiedData ? this.modifiedData : this.form.value;
      _modifiedData.fromIncome = this.form.controls['fromIncome'].value;
      _modifiedData.toIncome = this.form.controls['toIncome'].value;
      _modifiedData.standardTaxRate = this.form.controls['standardTaxRate'].value;
      _modifiedData.taxPercentageRate = this.form.controls['taxPercentageRate'].value;
      _modifiedData.index = this.modifiedData ? this.modifiedData.index : this.taxRatesDataSource.length;
      this.saveButtonClicked.emit({
        taxRatesDataSource: this.taxRatesDataSource,
        modifiedData: _modifiedData
      });
    } else {
      this.validateAllFormFields(this.form);
      this.alertService.error("Please make sure that all form fields are entered correctly")
    }
  }

  cancel() {
    this.cancelButtonClicked.emit();
  }

  validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
        control.updateValueAndValidity();
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}
