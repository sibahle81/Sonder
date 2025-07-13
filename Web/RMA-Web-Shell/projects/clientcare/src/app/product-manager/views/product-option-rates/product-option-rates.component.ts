import { Component, Input, OnChanges,  SimpleChanges } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ProductOption } from '../../models/product-option';

@Component({
  selector: 'product-option-rates',
  templateUrl: './product-option-rates.component.html',
  styleUrls: ['./product-option-rates.component.css']
})
export class ProductOptionRatesComponent implements OnChanges {

  @Input() productOption = new ProductOption();
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  form: UntypedFormGroup;
  hideForm = true;

  constructor(
    private readonly formBuilder: UntypedFormBuilder ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.productOption) {
    this.createForm();
    this.setForm();
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      baseRate: [{ value: null, disabled: this.isReadOnly }, [(control: AbstractControl) => Validators.max(100)(control), Validators.min(0), Validators.required]],
      industryRate: [{ value: null, disabled: this.isReadOnly }]
    });

    this.isLoading$.next(false);
  }

  industryRateChanged($event: any) {
    if ($event.checked) {
      this.form.controls.baseRate.reset();
      this.disableFormControl('baseRate');
    } else {
      this.form.controls.baseRate.patchValue(this.productOption.baseRate);
      this.enableFormControl('baseRate');
    }
    this.readForm();
  }

  baseRateChanged() {
    this.readForm();
   }

  setForm() {
    if (!this.productOption.baseRate) {
      this.form.controls.baseRate.reset();
      this.disableFormControl('baseRate');
      this.form.patchValue({
        baseRate: null,
        industryRate: true
      });
    } else {
      this.form.patchValue({
          baseRate: +this.productOption.baseRate,
          industryRate: false
        });
    }
  }

  readForm() {
    this.productOption.baseRate = this.form.controls.baseRate.value;
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }
}
