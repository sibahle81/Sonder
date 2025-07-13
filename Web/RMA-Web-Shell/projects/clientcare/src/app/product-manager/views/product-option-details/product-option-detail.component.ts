import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ProductStatusEnum } from 'projects/shared-models-lib/src/lib/enums/product-status-enum';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Constants } from 'projects/clientcare/src/app/constants';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { CommissionScale } from 'projects/clientcare/src/app/product-manager/models/commission-scale.enum';

import 'src/app/shared/extensions/date.extensions';

@Component({
  selector: 'product-option-details',
  styleUrls: ['./product-option-detail.component.css'],
  templateUrl: './product-option-detail.component.html',
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]

})
export class ProductOptionDetailComponent extends WizardDetailBaseComponent<ProductOption> {
  products: Product[];
  productStatuses: Lookup[];
  productTypes: Lookup[];
  coverOptionTypes: Lookup[];
  existingProducts: Lookup[];
  productStatusId: number;
  coverTypes: Lookup[];
  maxCommissionFeePercentage = 0;
  maxAdminFeePercentage = 0;
  maxBinderFeePercentage = 0;
  isStatutory = false;
  canEditOptionDetails = false;
  isOther = false;
  scale: string;
  selectedOptionName: string;
  filteredData: Product[] = [];
  groupCoverAmountOptions: Lookup[] = [];

  selectedProductClassId: number;
  selectedProductTypeId: number;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly productService: ProductService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.loadProducts();
    this.getProductStatuses();
    this.getProductTypes();
    this.getCoverOptionTypes();
    this.getCoverTypes();
    this.getGroupCoverAmountOptions();
    this.canEditOptionDetails = userUtility.hasPermission(Constants.productOptionPermissionName);
  }

  populateModel(): void {
    this.validateDates();
    this.populateOption();
  }

  populateForm(): void {
    if (this.model) {
      this.maxAdminFeePercentage = this.model.maxAdminFeePercentage;
      this.maxCommissionFeePercentage = this.model.maxCommissionFeePercentage;
      this.maxBinderFeePercentage = this.model.maxBinderFeePercentage;

      this.form.patchValue({
        id: this.model.id,
        product: this.model.productId,
        selectedOptionName: this.model.name,
        optionName: this.model.name,
        name: this.model.name,
        code: this.model.code,
        description: this.model.description,
        startDate: this.model.startDate,
        endDate: this.model.endDate,
        coverType: (this.model.coverTypeIds === null) ? null : this.model.coverTypeIds[0],
        paymentFrequencies: this.model.paymentFrequencyIds,
        maxCommissionFee: (this.maxCommissionFeePercentage * 100).toFixed(1),
        maxAdminFee: (this.maxAdminFeePercentage * 100).toFixed(1),
        maxBinderFee: (this.maxBinderFeePercentage * 100).toFixed(1),
        productType: this.model.productTypeId ? this.model.productTypeId : userUtility.hasPermission(Constants.productOptionPermissionName) ? Constants.defaultProducTypeId : this.model.productTypeId,
        coverOptionTypeId: this.model.coverOptionTypeId ? this.model.coverOptionTypeId : userUtility.hasPermission(Constants.productOptionPermissionName) ? Constants.defaultCoverMemberType : this.model.productTypeId,
        groupCoverAmountOption: this.model.groupCoverAmountOption,
        taxabled: this.model.isTaxabled,
        scale: this.model.commissionScale === Constants.scaleA ? 1 : 0
      });
      if (this.model.commissionScale === Constants.scaleA) {
        this.scale = Constants.scaleA;
      }

      if (!userUtility.hasPermission(Constants.productOptionPermissionName)) {
        this.form.get(Constants.code).disable();
        this.form.get(Constants.taxabled).disable();
      }
      if (this.model.productClassId && this.model.productClassId === ProductClassEnum.Statutory) {
        this.isStatutory = true;
      } else if (this.model.product) {
        this.isStatutory = this.model.product.productClassId === ProductClassEnum.Statutory;
      }
      if (this.model.productId > 0) {
        this.productService.getProduct(this.model.productId).subscribe(product => {
        });
      }

      this.form.get(Constants.productType).disable();
      this.form.get(Constants.productStatus).disable();
      this.form.get(Constants.coverOptionTypeId).disable();

      if (this.model.id > 0) {
        this.form.get(Constants.startDate).disable();
        this.form.get(Constants.optionName).disable();
        this.form.get(Constants.product).disable();
      }
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(this.form.get(Constants.startDate).value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get(Constants.endDate).value);
    endDate.setHours(0, 0, 0, 0);

    if (this.form.get(Constants.startDate).value && this.form.get(Constants.endDate).value && endDate < startDate) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Product option start date cannot be after the end date');
    }

    if (startDate < today && this.model.id === 0) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Please select a start date in the future');
    }
    return validationResult;
  }

  createForm(id: any): void {
    this.form = this.formBuilder.group({
      id: [id],
      product: [null, [Validators.required, Validators.min(1)]],
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      optionName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(50)],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      coverType: [null, [Validators.required, Validators.min(1)]],
      paymentFrequencies: new UntypedFormControl('', Validators.required),
      maxCommissionFee: [null],
      maxAdminFee: [null],
      maxBinderFee: [null],
      productStatus: [null],
      productType: [null],
      coverOptionTypeId: [null],
      groupCoverAmountOption: [null],
      scale: [null],
      taxabled: [null]
    });

    this.productStatusId = ProductStatusEnum.OpenForBusiness;
    this.form.patchValue({ productStatus: this.productStatusId });

    if (userUtility.hasPermission(Constants.productOptionPermissionName)) {
      this.form.patchValue({ productType: Constants.defaultProducTypeId });
      this.form.get(Constants.paymentFrequencies).clearValidators();
    }

    if (!userUtility.hasPermission(Constants.productOptionPermissionName)) {
      this.form.get(Constants.code).disable();
      this.form.get(Constants.taxabled).disable();
    }

    this.form.get(Constants.coverOptionTypeId).disable();
    this.form.get(Constants.productType).disable();
  }

  private populateOption() {
    const formModel = this.form.getRawValue();
    const endDate = new Date(formModel.endDate);
    this.selectedOptionName = formModel.name;

    this.model.id = formModel.id as number;
    this.model.productId = formModel.product;
    this.model.name = formModel.optionName;
    this.model.description = formModel.description;
    this.model.startDate = formModel.startDate as Date;
    this.model.endDate = formModel.endDate as Date;
    this.model.maxAdminFeePercentage = this.maxAdminFeePercentage;
    this.model.maxCommissionFeePercentage = this.maxCommissionFeePercentage;
    this.model.maxBinderFeePercentage = this.maxBinderFeePercentage;
    this.model.code = formModel.code;
    this.model.productTypeId = formModel.productType;
    this.model.coverOptionTypeId = formModel.coverOptionTypeId;
    this.model.isTaxabled = formModel.taxabled;
    this.model.commissionScale = this.scale;
    this.model.productClassId = this.selectedProductClassId;
    this.model.productTypeId = this.selectedProductTypeId;
    this.model.groupCoverAmountOption = formModel.groupCoverAmountOption == 0 ? null : formModel.groupCoverAmountOption;

    this.form.patchValue({ productoptionstatus: 1 });

    this.model.coverType = (this.model.coverTypeIds === null) ? null : this.model.coverTypeIds[0];

    if (!this.isStatutory) {
      const paymentFrequencies = this.getLookupControl(Constants.paymentFrequencyLookUpName);
      this.model.paymentFrequencyIds = paymentFrequencies.getSelectedItems();
    }
  }
  coverTypeChanged($event: any) {
    this.model.coverTypeIds = [$event.value];
  }

  validateDates(): void {
    if (!this.form.get(Constants.startDate).value) {
      this.form.get(Constants.startDate).setErrors({ required: true });
      this.productStatusId = ProductStatusEnum.ClosedForBusiness;
      this.form.patchValue({ productStatus: this.productStatusId });
      return;
    }

    const startDate = new Date(this.form.get(Constants.startDate).value);
    const endDate = new Date(this.form.get(Constants.endDate).value);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.form.get(Constants.startDate).value && this.form.get(Constants.endDate).value && endDate < startDate) {
      this.form.get(Constants.endDate).setErrors({ min: true });
      this.form.get(Constants.startDate).setErrors({ min: true });
    } else {
      this.form.get(Constants.endDate).setErrors(null);
      this.form.get(Constants.endDate).updateValueAndValidity();
      this.form.get(Constants.startDate).setErrors(null);
      this.form.get(Constants.startDate).updateValueAndValidity();
    }

    if (this.form.get(Constants.startDate).value && startDate > today) {
      this.productStatusId = ProductStatusEnum.ClosedForBusiness;
      this.form.patchValue({ productStatus: this.productStatusId });
      return;
    }

    if (!this.form.get(Constants.endDate).value) {
      this.productStatusId = ProductStatusEnum.OpenForBusiness;
      this.form.patchValue({ productStatus: this.productStatusId });
      return;
    }

    if (endDate >= today) {
      this.productStatusId = ProductStatusEnum.OpenForBusiness;
      this.form.patchValue({ productStatus: this.productStatusId });
    } else {
      this.productStatusId = ProductStatusEnum.ClosedForBusiness;
      this.form.patchValue({ productStatus: this.productStatusId });
    }
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(
      data => {
        this.products = data;
      });
  }

  private getProductStatuses(): void {
    this.lookupService.getProductStatuses().subscribe(
      data => { this.productStatuses = data; });
  }

  private getProductTypes(): void {
    this.lookupService.getProductTypes().subscribe(
      data => { this.productTypes = data; });
  }

  private getCoverOptionTypes(): void {
    this.lookupService.getCoverOptionTypes().subscribe(
      data => { this.coverOptionTypes = data; });
  }

  private getCoverTypes(): void {
    this.lookupService.getCoverTypes().subscribe(
      data => { this.coverTypes = data; });
  }

  private getGroupCoverAmountOptions(): void {
    this.lookupService.getGroupCoverAmountOptions().subscribe(
      data => {
        this.groupCoverAmountOptions = data.sort((a, b) => a.id - b.id);
        if (this.groupCoverAmountOptions[0].id !== 0) {
          this.groupCoverAmountOptions.unshift({ id: 0, name: 'Not Applicable' } as Lookup);
        }
      }
    );
  }

  productChanged($event: any) {

    const target = $event.source.selected._element.nativeElement;
    this.setScaleAsRequiredField(true);

    const selectedData = {
      value: $event.value,
      text: target.innerText.trim()
    };

    for (const product of this.products) {
      if (product.id === selectedData.value) {
        this.selectedProductClassId = product.productClassId;
        this.isStatutory = product.productClassId === ProductClassEnum.Statutory || product.productClassId === ProductClassEnum.Assistance;
        if (this.isStatutory) {
          this.form.get(Constants.paymentFrequencies).clearValidators();
          this.form.patchValue({ productType: Constants.defaultProducTypeId });
          this.form.patchValue({ coverOptionTypeId: Constants.defaultCoverMemberType });
        }
      }
    }
  }

  setScaleAsRequiredField(isStatutory: boolean) {
    if (!isStatutory) {
      this.form.get(Constants.scale).setValidators(Validators.required);
      this.form.get(Constants.scale).updateValueAndValidity();

    } else {
      this.scale = String.Empty;
      this.form.get(Constants.scale).setValidators(null);
      this.form.get(Constants.scale).updateValueAndValidity();
    }
  }

  productTypechanged($event: any) {
    const target = $event.source.selected._element.nativeElement;

    const selectedData = {
      value: $event.value,
      text: target.innerText.trim()
    };

    for (const productType of this.productTypes) {
      if (productType.id === selectedData.value) {
        this.selectedProductTypeId = productType.id;
      }
    }
  }

  selectedScaleChanged(event: any) {
    switch (event.value) {
      case CommissionScale.ScaleA:
        this.scale = Constants.scaleA;
    }
  }

  updateMaxAdminFee($event) {
    const cleanEvent = Number($event);
    this.maxAdminFeePercentage = (cleanEvent / 100);
  }

  updateMaxCommissionFee($event) {
    const cleanEvent = Number($event);
    this.maxCommissionFeePercentage = (cleanEvent / 100);
  }

  updateMaxBinderFee($event) {
    const cleanEvent = Number($event);
    this.maxBinderFeePercentage = (cleanEvent / 100);
  }
}

