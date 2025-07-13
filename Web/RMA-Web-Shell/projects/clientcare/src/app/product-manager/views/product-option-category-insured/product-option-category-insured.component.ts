import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { BehaviorSubject } from 'rxjs';
import { CategoryInsuredEnum } from '../../../policy-manager/shared/enums/categoryInsuredEnum';
import { ProductOptionCategoryInsured } from '../../models/product-option-category-insured';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'product-option-category-insured',
  templateUrl: './product-option-category-insured.component.html',
  styleUrls: ['./product-option-category-insured.component.css']
})
export class ProductOptionCategoryInsuredComponent implements OnInit, OnChanges {
  @Input() productOption;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() trigger;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  form: FormGroup;
  hideForm = true;

  categoryInsureds: CategoryInsuredEnum[] = [];
  filteredCategoryInsureds: CategoryInsuredEnum[] = [];

  isExpenseBased: boolean;
  isLifeBased: any;

  constructor(
    private readonly formBuilder: FormBuilder,
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
    this.categoryInsureds = this.ToArray(CategoryInsuredEnum);
    this.filteredCategoryInsureds = this.categoryInsureds;

    if (this.productOption && this.productOption.productOptionCategoryInsureds) {
      this.filterCategoryInsureds(this.productOption.productOptionCategoryInsureds);
    }

    this.createForm();
    this.isLoading$.next(false);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      categoryInsured: [{ value: null, disabled: this.isReadOnly }, Validators.required],
    });
  }

  showForm() {
    this.toggleForm();
  }

  add() {
    const productOptionCategoryInsured = new ProductOptionCategoryInsured();
    productOptionCategoryInsured.productOptionId = this.productOption.id;
    productOptionCategoryInsured.categoryInsured = +(this.getCategoryInsured(this.form.controls.categoryInsured.value));

    if (!this.productOption.productOptionCategoryInsureds) {
      this.productOption.productOptionCategoryInsureds = [];
    }

    if (this.productOption.productOptionCategoryInsureds.length === 0) {
      this.productOption.productOptionCategoryInsureds.push(productOptionCategoryInsured);
    } else {
      this.productOption.productOptionCategoryInsureds = [];
      this.productOption.productOptionCategoryInsureds.push(productOptionCategoryInsured);
    }
    this.reset(true);
  }

  delete(productOptionCategoryInsured: ProductOptionCategoryInsured) {
    this.hideForm = true;
    const index = this.productOption.productOptionCategoryInsureds.findIndex(s => s === productOptionCategoryInsured);
    this.productOption.productOptionCategoryInsureds.splice(index, 1);
    this.reset(false);
  }

  cancel() {
    this.reset(true);
  }

  reset(toggleForm: boolean) {
    if (toggleForm) {
      this.toggleForm();
    }

    this.form.controls.categoryInsured.reset();
    this.filterCategoryInsureds(this.productOption.productOptionCategoryInsureds);
  }

  filterCategoryInsureds(productOptionCategoryInsureds: ProductOptionCategoryInsured[]) {
    this.categoryInsureds = this.ToArray(CategoryInsuredEnum);
    this.filteredCategoryInsureds = this.categoryInsureds;

    productOptionCategoryInsureds.forEach(productOptionCategoryInsured => {
      const industryClassString = this.getCategoryInsuredString(productOptionCategoryInsured.categoryInsured);
      const index = this.filteredCategoryInsureds.findIndex(s => s.toString() === industryClassString);
      if (index > -1) {
        this.filteredCategoryInsureds.splice(index, 1);
      }
    });
  }

  setProductOptionType() {
    if (this.isReadOnly) {
      this.isLifeBased = false;
      this.isExpenseBased = true;
      return;
    }

    if (this.productOption) {
      this.isLoading$.next(true);
      if (this.productOption.productId) {
        this.productService.getProduct(this.productOption.productId).subscribe(result => {
          const productClass = result.productClassId;

          if (productClass) {
            this.isLifeBased = productClass === ProductClassEnum.Life;
            this.isExpenseBased = productClass === ProductClassEnum.Assistance || productClass === ProductClassEnum.Statutory || productClass === ProductClassEnum.NonStatutory;
          }
          this.isLoading$.next(false);
        });
      } else {
        this.isLoading$.next(false);
      }
    }
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
  }

  getCategoryInsured(id: number): string {
    return CategoryInsuredEnum[id];
  }

  getCategoryInsuredString(productOptionCategoryInsured: CategoryInsuredEnum): string {
    return CategoryInsuredEnum[productOptionCategoryInsured];
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
