import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { ProductStatusEnum } from 'projects/shared-models-lib/src/lib/enums/product-status-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Underwriter } from 'projects/clientcare/src/app/product-manager/models/underwriter';
import { UnderwriterService } from 'projects/clientcare/src/app/product-manager/services/underwriter.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './product-details.component.html',
  selector: 'product-details',
  providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})

export class ProductDetailsComponent extends WizardDetailBaseComponent<Product> {
  productClasses: Lookup[];
  productClassesOriginal: Lookup[];
  productStatuses: Lookup[];
  underwriters: Underwriter[];
  productStatusId: number;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly underwriterService: UnderwriterService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.getProductStatuses();
    this.getProductClasses();
    this.getUnderwriters();
  }

  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.model.id = formModel.id as number;
    this.model.name = formModel.name;
    this.model.code = formModel.code;
    this.model.description = formModel.description;
    this.model.productClassId = formModel.productClass as number;
    this.model.productStatus = this.productStatusId;
    this.model.underwriterId = formModel.underwriter as number;
    this.model.startDate = formModel.startDate as Date;
    this.model.endDate = formModel.endDate as Date;
  }

  populateForm(): void {
    if (this.model.ruleItems == null) {
      this.model.ruleItems = [];
    }

    this.form.patchValue({
      id: this.model.id,
      code: this.model.code,
      name: this.model.name,
      description: this.model.description ? this.model.description : '',
      productClass: this.model.productClassId,
      productStatus: this.model.productStatus,
      underwriter: this.model.underwriterId,
      startDate: this.model.startDate ? this.model.startDate : new Date(),
      endDate: this.model.endDate
    });

    this.form.get('productStatus').disable();

    if (this.model.id > 0) {
      this.form.get('code').disable();
      this.form.get('name').disable();
      this.form.get('productClass').disable();
      this.form.get('underwriter').disable();
      this.form.get('startDate').disable();
    } else {
      this.form.patchValue({ productStatus: 1 });
    }

    this.validateDates();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(this.form.get('startDate').value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get('endDate').value);
    endDate.setHours(0, 0, 0, 0);

    if (this.form.get('startDate').value && this.form.get('endDate').value && endDate < startDate) {
      this.form.get('endDate').setErrors({ min: true });
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Product start date cannot be after the end date');
    }

    if (startDate < today && this.model.id === 0) {
      this.form.get('startDate').setErrors({ 'min-today': true });
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Please select a start date in the future');
    }
    return validationResult;
  }

  createForm(id: any): void {
    this.form = this.formBuilder.group({
      id: [id],
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(50)],
      productClass: [null, [Validators.required, Validators.min(1)]],
      productStatus: [null],
      underwriter: [null, [Validators.required, Validators.min(1)]],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      ruleConfigurations: this.formBuilder.array([]),
      ruleIds: new UntypedFormControl()
    });
    if (!userUtility.hasPermission('Override Product Code')) {
      this.form.get('code').disable();
    }

    this.productStatusId = ProductStatusEnum.OpenForBusiness;
    this.form.patchValue({ productStatus: this.productStatusId });
  }

  validateDates(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.form.get('startDate').value) {
      this.form.get('startDate').patchValue(today);
      return;
    }

    const startDate = new Date(this.form.get('startDate').value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get('endDate').value);
    endDate.setHours(0, 0, 0, 0);

    if (this.form.get('startDate').value && this.form.get('endDate').value && endDate < startDate) {
      this.form.get('endDate').setErrors({ min: true });
      this.form.get('startDate').setErrors({ min: true });
    } else {
      this.form.get('endDate').setErrors(null);
      this.form.get('endDate').updateValueAndValidity();
      this.form.get('startDate').setErrors(null);
      this.form.get('startDate').updateValueAndValidity();
    }

    if (startDate < today) {
      if (endDate >= startDate) { // if editing a product and end date is set to today
        if (endDate >= today) { // then it should be open
          this.productStatusId = ProductStatusEnum.OpenForBusiness;
          this.form.patchValue({ productStatus: this.productStatusId });
        } else {
          this.productStatusId = ProductStatusEnum.ClosedForBusiness;
          this.form.patchValue({ productStatus: this.productStatusId });
        }
      }
      this.form.get('startDate').setErrors({ 'min-today': true });
      return;
    } else {
      this.form.get('startDate').setErrors(null);
      this.form.get('startDate').updateValueAndValidity();
    }

    if (this.form.get('startDate').value && startDate > today) {
      this.productStatusId = ProductStatusEnum.ClosedForBusiness;
      this.form.patchValue({ productStatus: this.productStatusId });
      return;
    }

    if (!this.form.get('endDate').value) {
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

  private getProductStatuses(): void {
    this.lookupService.getProductStatuses().subscribe(
      data => { this.productStatuses = data; });
  }

  private getUnderwriters(): void {
    this.underwriterService.getUnderwriters().subscribe(
      data => { this.underwriters = data; });
  }

  private getProductClasses(): void {
    this.lookupService.getProductClasses().subscribe(productClasses => {
      this.productClasses = productClasses;
      this.productClassesOriginal = productClasses;
    });
  }

  setProductClass(): void {
    const underwriter = this.form.get('underwriter').value;
    this.productClasses = Array.from(this.productClassesOriginal);

    switch (underwriter) {
      case 1: //RMA MA --Statutory
        this.getItemsAccordingToUnderwriter(false);
        break;
      case 2: //RMA LA --ASS, LIFE, FSCA
        this.getItemsAccordingToUnderwriter(false);
    }
  }

  getItemsAccordingToUnderwriter(showjuststatutory): void {
    for (let i = this.productClasses.length - 1; i >= 0; i--) {
      const item = this.productClasses[i];
      if (showjuststatutory === true) {
        if (item.name.toLowerCase() !== 'statutory') {
          const idx = this.productClasses.indexOf(item);
          this.productClasses.splice(idx, 1);
        }
      } else {
        if (item.name.toLowerCase() === 'statutory') {
          const idx = this.productClasses.indexOf(item);
          // this.productClasses.splice(idx, 1);
        }
      }
    }
  }
}
