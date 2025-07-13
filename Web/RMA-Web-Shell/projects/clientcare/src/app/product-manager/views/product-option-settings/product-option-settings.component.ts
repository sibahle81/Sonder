import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { BehaviorSubject } from 'rxjs';
import { ProductOption } from '../../models/product-option';
import { ProductOptionSetting } from '../../models/product-option-setting';

@Component({
  selector: 'product-option-settings',
  templateUrl: './product-option-settings.component.html',
  styleUrls: ['./product-option-settings.component.css']
})
export class ProductOptionSettingsComponent implements OnInit, OnChanges {

  @Input() productOption = new ProductOption();
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  industryClasses: IndustryClassEnum[] = []; // any[] because of enum
  paymentFrequencies: PaymentFrequencyEnum[] = []; // any[] because of enum

  filteredIndustryClasses: IndustryClassEnum[] = []; // any[] because of enum

  form: FormGroup;
  hideForm = true;

  constructor(
    private readonly formBuilder: FormBuilder ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.filteredIndustryClasses = this.industryClasses;
    this.paymentFrequencies = this.ToArray(PaymentFrequencyEnum);

    if (this.productOption && this.productOption.productOptionSettings){
      this.filterIndustryClasses(this.productOption.productOptionSettings);
    }

    this.createForm();
    this.isLoading$.next(false);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      paymentFrequency: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });
  }

  showForm(){
    this.toggleForm();
  }

  add(){
    const productOptionSetting = new ProductOptionSetting();
    productOptionSetting.productOptionId = this.productOption.id;
    productOptionSetting.industryClass = +(this.getIndustryClass(this.form.controls.industryClass.value));
    productOptionSetting.paymentFrequency = +(this.getPaymentFrequency(this.form.controls.paymentFrequency.value));

    if (!this.productOption.productOptionSettings){
      this.productOption.productOptionSettings = [];
    }

    this.productOption.productOptionSettings.push(productOptionSetting);
    this.reset(true);
  }

  delete(productOptionSetting: ProductOptionSetting) {
    this.hideForm = true;
    const index = this.productOption.productOptionSettings.findIndex(s => s === productOptionSetting);
    this.productOption.productOptionSettings.splice(index, 1);
    this.reset(false);
  }

  cancel() {
    this.reset(true);
  }

  reset(toggleForm: boolean){
    if (toggleForm){
      this.toggleForm();
    }

    this.form.controls.industryClass.reset();
    this.form.controls.paymentFrequency.reset();
    this.filterIndustryClasses(this.productOption.productOptionSettings);
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
  }

  getIndustryClass(id: number): string {
    return IndustryClassEnum[id];
  }

  getPaymentFrequency(id: number): string {
    return PaymentFrequencyEnum[id];
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  filterIndustryClasses(productOptionSettings: ProductOptionSetting[]){
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.filteredIndustryClasses = this.industryClasses;

    if (productOptionSettings) {
      productOptionSettings.forEach(productOptionSetting => {
        const industryClassString = this.getIndustryClassString(productOptionSetting.industryClass);
        const index = this.filteredIndustryClasses.findIndex(s => s.toString() === industryClassString);
        if (index > -1){
          this.filteredIndustryClasses.splice(index, 1);
        }
      });
    }
  }

  getIndustryClassString(industryClass: IndustryClassEnum): string {
    return IndustryClassEnum[industryClass];
  }
}
