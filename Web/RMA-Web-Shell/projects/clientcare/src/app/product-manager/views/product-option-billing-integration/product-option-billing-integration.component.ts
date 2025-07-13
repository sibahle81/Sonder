import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { BehaviorSubject } from 'rxjs';
import { ProductOption } from '../../models/product-option';
import { ProductOptionBillingIntegration } from '../../models/product-option-billing-Integration';

@Component({
  selector: 'product-option-billing-integration',
  templateUrl: './product-option-billing-integration.component.html',
  styleUrls: ['./product-option-billing-integration.component.css']
})
export class ProductOptionBillingIntegrationComponent implements OnChanges {

  @Input() productOption = new ProductOption();
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  industryClasses: IndustryClassEnum[] = []; // any[] because of enum
  productOptionBillingIntegrations: ProductOptionBillingIntegration[] = []; // any[] because of enum

  filteredIndustryClasses: IndustryClassEnum[] = []; // any[] because of enum

  form: UntypedFormGroup;
  hideForm = true;

  constructor(
    private readonly formBuilder: UntypedFormBuilder) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.filteredIndustryClasses = this.industryClasses;

    if (this.productOption && this.productOption.productOptionBillingIntegrations) {
      this.filterIndustryClasses(this.productOption.productOptionBillingIntegrations);
    }

    this.createForm();
    this.isLoading$.next(false);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      allowTermsArrangement: [{ value: null, disabled: this.isReadOnly }],
      accumulatesInterest: [{ value: null, disabled: this.isReadOnly }],
    });
  }

  showForm() {
    this.toggleForm();
  }

  add() {
    const productOptionBillingIntegration = new ProductOptionBillingIntegration();
    productOptionBillingIntegration.productOptionId = this.productOption.id;
    productOptionBillingIntegration.industryClass = +(this.getIndustryClass(this.form.controls.industryClass.value));
    productOptionBillingIntegration.allowTermsArrangement = this.form.controls.allowTermsArrangement.value ? this.form.controls.allowTermsArrangement.value : false;
    productOptionBillingIntegration.accumulatesInterest = this.form.controls.accumulatesInterest.value ? this.form.controls.accumulatesInterest.value : false;

    if (!this.productOption.productOptionBillingIntegrations) {
      this.productOption.productOptionBillingIntegrations = [];
    }

    this.productOption.productOptionBillingIntegrations.push(productOptionBillingIntegration);
    this.reset(true);
  }

  delete(productOptionBillingIntegration: ProductOptionBillingIntegration) {
    this.hideForm = true;
    const index = this.productOption.productOptionBillingIntegrations.findIndex(s => s === productOptionBillingIntegration);
    this.productOption.productOptionBillingIntegrations.splice(index, 1);
    this.reset(false);
  }

  cancel() {
    this.reset(true);
  }

  reset(toggleForm: boolean) {
    if (toggleForm) {
      this.toggleForm();
    }

    this.form.controls.industryClass.reset();
    this.form.controls.allowTermsArrangement.reset();
    this.form.controls.accumulatesInterest.reset();
    this.filterIndustryClasses(this.productOption.productOptionBillingIntegrations);
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
  }

  getIndustryClass(id: number): string {
    return IndustryClassEnum[id];
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

  filterIndustryClasses(productOptionBillingIntegrations: ProductOptionBillingIntegration[]) {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.filteredIndustryClasses = this.industryClasses;

    if (productOptionBillingIntegrations) {
      productOptionBillingIntegrations.forEach(productOptionBillingIntegration => {
        const industryClassString = this.getIndustryClassString(productOptionBillingIntegration.industryClass);
        const index = this.filteredIndustryClasses.findIndex(s => s.toString() === industryClassString);
        if (index > -1) {
          this.filteredIndustryClasses.splice(index, 1);
        }
      });
    }
  }

  getIndustryClassString(industryClass: IndustryClassEnum): string {
    return IndustryClassEnum[industryClass];
  }
}
