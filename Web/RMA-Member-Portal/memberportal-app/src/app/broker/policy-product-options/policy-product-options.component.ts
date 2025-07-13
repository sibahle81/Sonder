import { Component, OnInit, OnChanges, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { CompanyIdTypeEnum } from 'src/app/shared/enums/company-id-type-enum';
import { Case } from 'src/app/shared/models/case';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { Product } from 'src/app/shared/models/product';
import { ProductOption } from 'src/app/shared/models/product-option';
import { RolePlayerPolicy } from 'src/app/shared/models/role-player-policy';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { ProductOptionService } from 'src/app/shared/services/product-option.service';
import { ProductService } from 'src/app/shared/services/product.service';


@Component({
  selector: 'policy-product-options',
  templateUrl: './policy-product-options.component.html',
  styleUrls: ['./policy-product-options.component.css']
})

export class PolicyProductOptionsComponent implements OnInit, OnChanges {
  @Output() productOptionSelected: EventEmitter<ProductOption> = new EventEmitter();
  @Input() parentModel: Case;
  @Input() isDisabled: boolean;

  model: RolePlayerPolicy[];
  formProducts: FormGroup;
  productOptions: ProductOption[] = [];
  products: Product[];
  product: Product;
  selectedProductOption: ProductOption;
  formPopulatedWithModel = false;
  coverTypes: Lookup[] = [];
  productOptionsLoading = false;
  @Input() caseCausesProductsDisabling = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
    private readonly lookupService: LookupService) { }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    this.productOptionsLoading = true;
    if (this.parentModel) {
      this.lookupService.getCoverTypes().subscribe(data => {
        this.coverTypes = data;
      });

      this.getProduct(this.parentModel.productId);
      this.getProductOptions(this.parentModel.productId);

      if (this.parentModel.mainMember && this.parentModel.mainMember.policies) {
        this.model = this.parentModel.mainMember.policies;
        if (this.formProducts && !this.formPopulatedWithModel) {
          this.populateForm();
          this.formPopulatedWithModel = true;
        }
      }
    }
  }

  onCompanyTypeChanged(parentModel: Case) {
    this.parentModel = parentModel;
    this.getProductOptions(this.parentModel.productId);
  }

  getProductOptions(productId: number) {
    this.productOptions = [];

    this.productOptionsLoading = true;
    this.productOptionService.getProductOptionByProductId(productId).subscribe(
      result => {
        let applicableCoverTypes: Lookup[] = [];
        if (!this.parentModel.mainMember.person && this.parentModel.mainMember.company) {// COMPANY OR GROUP
          const companyType = this.parentModel.mainMember.company.companyIdType;
          if (companyType === CompanyIdTypeEnum.RegistrationNo) { // COMPANY
            applicableCoverTypes = this.coverTypes.filter(c => c.name.includes('Company') || c.name.includes('Corporate'));
          }
          if (companyType === CompanyIdTypeEnum.Group) { // GROUP
            applicableCoverTypes = this.coverTypes.filter(c => c.name.includes('Group'));
          }
          this.productOptions = result.filter(o1 => applicableCoverTypes.some(o2 => o1.coverTypeIds.includes(o2.id)));
        } else { // ISNATURAL
          // Cannot filter, because a member of a group or corporate policy will also be on their product option
          this.productOptions = result;
        }
        this.productOptionsLoading = false;
      }
    );
  }

  getProduct(productId: number) {
    this.productOptionsLoading = true;
    this.products = [];
    this.productService.getProduct(productId).subscribe(
      (c: Product) => {
        this.product = c;
        this.products.push(this.product);
        this.formProducts.patchValue({ product: c.id });
      }
    );
  }

  setSelectedOption(event: any) {
    this.selectedProductOption = this.productOptions.find(c => c.id === event.value);
    this.selectedProductOption.product = this.product;
    this.productOptionSelected.emit(this.selectedProductOption);
  }

  ngOnInit() {
    this.createForm();
    this.populateForm();
  }

  createForm(): void {
    this.formProducts = this.formBuilder.group({
      productOption: [{ value: '', disabled: this.isDisabled || this.caseCausesProductsDisabling }, Validators.required],
      product: [{ value: '', disabled: this.isDisabled || this.caseCausesProductsDisabling }],
    });
  }

  populateForm(): void {
    this.formPopulatedWithModel = false;
    if (this.model && this.model[0]) {
      this.selectedProductOption = this.model[0].productOption;

      if (this.productOptions.length === 0 && this.selectedProductOption) {
        this.productOptions.push(this.selectedProductOption);
      }

      if (this.selectedProductOption) {
        this.formProducts.patchValue({
          product: this.selectedProductOption.product ? this.selectedProductOption.product : null,
          productOption: this.selectedProductOption.id
        });
      }
      this.formPopulatedWithModel = true;
    }
  }

  populateModel(): void {
    if (this.model && this.model.length > 0) {
      const value = this.formProducts.value;
      if (!this.model[0].productOption) {
        this.model[0].productOption = new ProductOption();
      }
      if (!this.model[0].productOption.product) {
        this.model[0].productOption.product = new Product();
      }
      if (this.selectedProductOption) {
        this.model[0].productOption = this.selectedProductOption;
        this.model[0].productOptionId = this.selectedProductOption.id;
        this.model[0].productOption.product = this.selectedProductOption.product;
      }
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.formProducts) {
      if (!this.formProducts.get('productOption').value) {
        validationResult.errorMessages.push('Product Option is required');
        validationResult.errors += 1;
      }
    }
    return validationResult;
  }

  getProductsRepCanSell() {
    const currentProductId = this.parentModel.productId;
    this.productService.getActiveProductsForRepresentative(this.parentModel.representativeId).subscribe(
      data => {
        this.products = data;
        this.formProducts.patchValue({ product: currentProductId });
      }
    );
  }

  setSelectedProduct(event: any) {
    this.getProductOptions(event.value);
  }
}
