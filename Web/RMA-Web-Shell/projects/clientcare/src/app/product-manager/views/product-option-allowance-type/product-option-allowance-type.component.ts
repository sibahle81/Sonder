import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AllowanceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/allowance-type-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { BehaviorSubject } from 'rxjs';
import { ProductOption } from '../../models/product-option';
import { ProductOptionAllowanceType } from '../../models/product-option-allowance-type';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'product-option-allowance-type',
  templateUrl: './product-option-allowance-type.component.html',
  styleUrls: ['./product-option-allowance-type.component.css']
})
export class ProductOptionAllowanceTypeComponent implements OnInit, OnChanges {
  @Input() productOption: ProductOption;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() trigger;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  form: UntypedFormGroup;
  hideForm = true;

  allowanceTypes: AllowanceTypeEnum[] = [];
  filteredAllowanceTypes: AllowanceTypeEnum[] = [];
  industryClasses: IndustryClassEnum[] = [];

  isExpenseBased: boolean;
  isLifeBased: any;

  selectedIndustryClass: IndustryClassEnum;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly productService: ProductService
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
    this.setProductOptionType();
  }

  getLookups() {
    this.allowanceTypes = this.ToArray(AllowanceTypeEnum);
    this.industryClasses = this.ToArray(IndustryClassEnum);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      allowanceTypes: [{ value: null, disabled: this.isReadOnly }, Validators.required],
    });
  }

  showForm() {
    this.toggleForm();
  }

  add() {
    const selectedAllowanceTypeIds = this.form.controls.allowanceTypes.value;

    selectedAllowanceTypeIds.forEach(allowanceType => {
      const productOptionAllowanceType = new ProductOptionAllowanceType();
      productOptionAllowanceType.productOptionId = this.productOption.id;
      productOptionAllowanceType.allowanceType = +AllowanceTypeEnum[allowanceType];
      productOptionAllowanceType.industryClass = +(this.getIndustryClass(this.form.controls.industryClass.value));

      if (!this.productOption.productOptionAllowanceTypes) {
        this.productOption.productOptionAllowanceTypes = [];
      }

      this.productOption.productOptionAllowanceTypes.push(productOptionAllowanceType);
    });

    this.reset(true);
  }

  delete(productOptionAllowanceType: ProductOptionAllowanceType) {
    this.hideForm = true;
    const index = this.productOption.productOptionAllowanceTypes.findIndex(s => s === productOptionAllowanceType);
    this.productOption.productOptionAllowanceTypes.splice(index, 1);

    this.reset(false);
  }

  industryClassSelected($event: any) {
    this.selectedIndustryClass = $event.value;
    this.filterAllowanceTypes();
  }

  cancel() {
    this.reset(true);
  }

  reset(toggleForm: boolean) {
    if (toggleForm) {
      this.toggleForm();
    }

    this.selectedIndustryClass = null;

    this.form.controls.industryClass.reset();
    this.form.controls.allowanceTypes.reset();
  }

  setProductOptionType() {
    if (this.isReadOnly) {
      this.isLifeBased = false;
      this.isExpenseBased = true;
      this.isLoading$.next(false);
    }

    if (this.productOption) {
      if (this.productOption.productId) {
        this.productService.getProduct(this.productOption.productId).subscribe(result => {
          const productClass = result.productClassId;

          if (productClass) {
            this.isLifeBased = productClass === ProductClassEnum.Life;
            this.isExpenseBased = productClass === ProductClassEnum.Assistance || productClass === ProductClassEnum.Statutory || productClass === ProductClassEnum.NonStatutory;
          }
        });
      }
    }
    this.createForm();
    this.isLoading$.next(false);
  }

  filterAllowanceTypes() {
    this.allowanceTypes = this.ToArray(AllowanceTypeEnum);
    this.filteredAllowanceTypes = this.allowanceTypes;

    this.productOption.productOptionAllowanceTypes = !this.productOption.productOptionAllowanceTypes ? [] : this.productOption.productOptionAllowanceTypes;
    this.productOption.productOptionAllowanceTypes.forEach(productOptionAllowanceType => {
      if (IndustryClassEnum[productOptionAllowanceType.industryClass] === this.selectedIndustryClass.toString()) {
        this.filteredAllowanceTypes = this.filteredAllowanceTypes.filter(s => s.toString() !== AllowanceTypeEnum[productOptionAllowanceType.allowanceType]);
      }
    });
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
  }

  getAllowanceType(id: number): string {
    return AllowanceTypeEnum[id];
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
}
