import { Component, OnInit, EventEmitter, Output, Input, OnChanges } from '@angular/core';
import { ProductOption } from '../../../product-manager/models/product-option';
import { Case } from '../../shared/entities/case';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Product } from '../../../product-manager/models/product';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductService } from '../../../product-manager/services/product.service';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

@Component({
  selector: 'policy-product-options',
  templateUrl: './policy-product-options.component.html',
  styleUrls: ['./policy-product-options.component.css']
})

export class PolicyProductOptionsComponent implements OnInit, OnChanges {

  @Output() productOptionSelected: EventEmitter<ProductOption> = new EventEmitter();
  @Input() caseCausesProductsDisabling = false;
  @Input() parentModel: Case;
  @Input() isDisabled: boolean;

  model: RolePlayerPolicy[];
  formProducts: UntypedFormGroup;
  productOptions: ProductOption[] = [];
  products: Product[];
  product: Product;
  selectedProductOption: ProductOption;
  formPopulatedWithModel = false;
  coverTypes: Lookup[] = [];
  productsLoading = false;
  productOptionsLoading = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
    private readonly lookupService: LookupService) { }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
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
    this.productOptionService.getProductOptionNamesByProductId(productId).subscribe(
      result => {
        let applicableCoverTypes: Lookup[] = [];
        if (this.parentModel.mainMember.rolePlayerIdentificationType !== RolePlayerIdentificationTypeEnum.Person && this.parentModel.mainMember.company) {// COMPANY OR GROUP
          const companyType = this.parentModel.mainMember.company.companyIdType;
          if (companyType === CompanyIdTypeEnum.RegistrationNo) { // COMPANY
            applicableCoverTypes = this.coverTypes.filter(c => c.name.includes('Company') || c.name.includes('Corporate'));
          }
          if (companyType === CompanyIdTypeEnum.Group) { // GROUP
            applicableCoverTypes = this.coverTypes.filter(c => c.name.includes('Group'));
          }
          const coverTypeIds = applicableCoverTypes.map(ct => ct.id);
          if (applicableCoverTypes.length > 0) {
            this.productOptions = result.filter(po => coverTypeIds.includes(po.coverType));
          } else {
            this.productOptions = [];
          }
        } else { // ISNATURAL
          // Cannot filter, because a member of a group or corporate policy will also be on their product option
          this.productOptions = result;
        }
        this.productOptionsLoading = false;
      }
    );
  }

  getProduct(productId: number) {
    if (!this.formProducts) {
      this.createForm();
    }
    this.productsLoading = true;
    this.products = [];
    if (this.parentModel.caseTypeId === CaseType.MaintainPolicyChanges as number) {
      this.productService.getActiveProductsForRepresentative(this.parentModel.representativeId).subscribe(
        data => {
          this.products = data;
          const currentProductId = this.parentModel.productId;
          this.formProducts.patchValue({ product: currentProductId });
          this.loadProducts(productId, this.products, true);
        }
      );
    } else {      
      this.formProducts.patchValue({ product: productId });
      this.loadProducts(productId, this.products, false);
    }
  }

  private loadProducts(productId: number, products: any[], checkRepProducts: boolean) {
    this.productService.getProduct(productId).subscribe({
      next: (product: Product) => {
        this.product = product;
        if (checkRepProducts) {
          if (this.products.findIndex(p => p.id === productId) < 0) {
            this.products.push(this.product);
            this.formProducts.patchValue({ product: product.id });
          }
        } else {
          this.products.push(this.product);
          this.formProducts.patchValue({ product: product.id });
        }
      },
      complete: () => {
        this.productsLoading = false;
      }
    });
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
      productOption: [Validators.required],
      product: ['', []],
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

  setSelectedProduct(event: any) {
    this.getProductOptions(event.value);
  }
}
