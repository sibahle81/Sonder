import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, NativeDateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Benefit } from 'projects/clientcare/src/app/product-manager/models/benefit';
import { BenefitService } from 'projects/clientcare/src/app/product-manager/services/benefit.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { BenefitRate } from 'projects/clientcare/src/app/product-manager/models/benefit-benefitRate';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ProductStatusEnum } from 'projects/shared-models-lib/src/lib/enums/product-status-enum';
import * as moment from 'moment';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { EarningsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/earnings-type-enum';
import { Constants } from 'projects/clientcare/src/app/constants';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import 'src/app/shared/extensions/date.extensions';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { BehaviorSubject } from 'rxjs';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { DisabilityBenefitTermEnum } from '../../models/disability-benefit-term.enum';

@Component({
  selector: 'benefit-details',
  templateUrl: './benefit-details.component.html',
  styleUrls: ['./benefit-details.component.css'],
  providers: [
    [DatePipe],
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class BenefitDetailsComponent extends WizardDetailBaseComponent<Benefit> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  benefitTypes: Lookup[];
  earningTypes: Lookup[];
  coverMemberTypes: Lookup[];
  coverMemberTypesFullResult: Lookup[];
  benefitRates: BenefitRate[] = [];
  benefitStatusId: number;
  showRateForm: boolean;
  productStatuses: Lookup[];
  addRateError: string;
  showStatutoryClassFields: boolean;
  minDate: Date;
  products: Product[];
  productId: number;
  isStatutory: boolean = false;
  hideAddPremium: boolean = false;
  isNewBenefitCapture: boolean = false;
  coverMemberTypeEnum = CoverMemberTypeEnum;
  earningsTypeEnum = EarningsTypeEnum;
  earningIds: number[] = [];
  disabilityBenefitTerms: Lookup[] = [];

  get showDisabilityTerms(): boolean {
    const values = this.form.getRawValue();
    return values.benefitType == BenefitTypeEnum.Disability;
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly benefitsService: BenefitService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly productService: ProductService,
    private readonly lookupService: LookupService,
    private readonly confirmservice: ConfirmationDialogsService) {

    super(appEventsManager, authService, activatedRoute);
    dateAdapter.setLocale('en-za');
    this.minDate = new Date();
  }

  onLoadLookups(): void {
    this.getProductStatuses();
    this.getBenefitTypes();
    this.getDisabilityBenefitTypes();
    this.getCoverMemberTypes();
    this.getProducts();
  }

  populateModel(): void {
    this.validateDates();
    const formModel = this.form.getRawValue();
    this.model.id = formModel.id as number;
    if (userUtility.hasPermission('Override Benefit Code')) {
      this.model.name = formModel.name;
    }
    else {
      this.model.name = formModel.name;
    }
    this.model.code = formModel.code;
    this.model.startDate = formModel.startDate;
    this.model.endDate = formModel.endDate !== null ? new Date(formModel.endDate).getCorrectUCTDate() : formModel.endDate;
    this.model.productId = formModel.product as number;
    this.model.benefitType = formModel.benefitType as number;
    this.model.excessAmount = formModel.excessAmount;
    this.model.benefitRates = this.benefitRates;
    this.model.coverMemberType = this.hideAddPremium ? this.coverMemberTypeEnum.NotApplicable : formModel.coverMemberType as number;
    this.model.disabilityBenefitTerm = formModel.disabilityBenefitTerm as number;
    this.model.maxCompensationAmount = formModel.maxCompensationAmount;
    this.model.minCompensationAmount = formModel.minCompensationAmount;

    if (this.hideAddPremium) {
      const earningsLookup = this.getLookupControl('EarningsType');
      this.model.earningTypeIds = earningsLookup.getSelectedItems();
    } else {
      this.model.earningTypeIds = [];
      this.model.earningTypeIds.push(this.earningsTypeEnum.NotApplicable as number);
    }

    if (this.showStatutoryClassFields) {
      const beneficiaryLookup = this.getLookupControl('BeneficiaryType');
      this.model.beneficiaryTypeIds = beneficiaryLookup.getSelectedItems();
      const medicalLookup = this.getLookupControl('MedicalReportType');
      this.model.medicalReportTypeIds = medicalLookup.getSelectedItems();
    }

    this.showRateForm = false;
    this.form.get('baseRate').disable();
    this.form.get('benefitAmount').disable();
    this.addRateError = '';
  }

  populateForm(): void {
    if (this.model) {
      if (this.model.endDate >= new Date() || this.model.endDate === null) {
        this.benefitStatusId = 1;
      } else {
        this.benefitStatusId = 2;
      }

      if (!FeatureflagUtility.isFeatureFlagEnabled('CoidMenuOptions')) {
        this.model.earningTypeIds = [4];
      }

      this.form.patchValue({
        earningTypes: this.model.earningTypeIds,
        beneficiaryTypes: this.model.beneficiaryTypeIds,
        medicalReportTypes: this.model.medicalReportTypeIds,
        id: this.model.id,
        code: this.model.code,
        name: this.model.name,
        benefitNames: this.model.name,
        startDate: this.model.startDate,
        endDate: this.model.endDate,
        product: this.model.productId,
        benefitType: this.model.benefitType,
        coverMemberType: this.model.coverMemberType,
        disabilityBenefitTerm: this.model.disabilityBenefitTerm,
        benefitStatus: this.benefitStatusId,
        excessAmount: this.model.excessAmount,
        maxCompensationAmount: this.model.maxCompensationAmount,
        minCompensationAmount: this.model.minCompensationAmount
      });

      if (this.model.benefitRates) {
        this.benefitRates = this.model.benefitRates;
      } else {
        this.benefitRates = [];
      }

      this.form.get('code').disable();

      if (this.model.id > 0) {
        this.form.get('name').disable();
        this.form.get(Constants.startDate).disable();
      }

      if (this.model.productId > 0) {
        this.form.get('product').disable();
      }

      this.form.get('baseRate').disable();
      this.form.get('benefitAmount').disable();
      this.form.get('effectiveDate').disable();


      if (userUtility.hasPermission('Override Benefit Code') && (this.model.name == null || this.model.name == "")) {
        this.form.get('code').enable();
      }
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (validationResult.valid) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(this.form.get(Constants.startDate).value);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(this.form.get(Constants.endDate).value);
      endDate.setHours(0, 0, 0, 0);

      const values = this.form.getRawValue();

      if (this.form.get(Constants.startDate).value && this.form.get(Constants.endDate).value && endDate < startDate) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Benefit start date cannot be after the end date');
      }

      if (startDate < today && this.model.id === 0) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Please select a start date in the future');
      }

      if (values.benefitType === BenefitTypeEnum.Disability && !values.disabilityBenefitTerm) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Disability Benefit Terms is required');
      }

      if (this.isStatutory = false) {
        if (this.model.benefitRates === undefined || this.model.benefitRates.length === 0) {
          validationResult.errorMessages = ['No benefit rate/s added'];
          validationResult.errors = 1;
        }

        if (this.benefitRates.filter(rate => rate.benefitRateStatusText === 'Current').length === 0) {
          validationResult.errorMessages = ['A benefit must have at least one current rate'];
          validationResult.errors = 1;
        }
      }
    }
    return validationResult;
  }

  createForm(id: any): void {
    this.form = this.formBuilder.group({
      id: [id],
      code: new UntypedFormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]),
      name: new UntypedFormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      startDate: new UntypedFormControl(new Date(), [Validators.required]),
      endDate: new UntypedFormControl(null),
      earningTypes: new UntypedFormControl(''),
      beneficiaryTypes: new UntypedFormControl(''),
      medicalReportTypes: new UntypedFormControl(''),
      product: new UntypedFormControl(''),
      benefitType: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
      earningType: new UntypedFormControl(''),
      coverMemberType: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
      disabilityBenefitTerm: new UntypedFormControl(''),
      benefitAmount: new UntypedFormControl('0', [Validators.required]),
      baseRate: new UntypedFormControl('0'),
      effectiveDate: new UntypedFormControl(new Date(), [Validators.required]),
      maxCompensationAmount: new UntypedFormControl('0', [Validators.required]),
      minCompensationAmount: new UntypedFormControl('0', [Validators.required]),
      benefitStatus: [null],
      benefitNames: new UntypedFormControl('', [Validators.required]),
      excessAmount: new UntypedFormControl('')
    });

    this.form.get('code').disable();
    this.form.get('baseRate').disable();
    this.form.get('benefitAmount').disable();
    this.form.get('benefitStatus').disable();

    this.benefitStatusId = ProductStatusEnum.OpenForBusiness;
    this.form.patchValue({ benefitStatus: this.benefitStatusId });
  }

  toggleRateForm() {
    this.showRateForm = !this.showRateForm;

    if (this.showRateForm) {
      this.form.get('baseRate').enable();
      this.form.get('benefitAmount').enable();
      this.form.get('effectiveDate').enable();

      this.form.get('baseRate').setValidators(Validators.required);
      this.form.get('benefitAmount').setValidators(Validators.required);
      this.form.patchValue({
        benefitAmount: 0,
        baseRate: 0,
        effectiveDate: new Date()
      });
    } else {
      this.form.get('baseRate').disable();
      this.form.get('benefitAmount').disable();
      this.form.get('effectiveDate').disable();
    }

    this.addRateError = '';
  }

  readRateForm() {
    const formModel = this.form.getRawValue();
    let effectiveDate = new Date((this.form.get('effectiveDate').value as Date));
    const benefitRate = new BenefitRate();
    benefitRate.baseRate = formModel.baseRate;
    benefitRate.effectiveDate = effectiveDate.getCorrectUCTDate();
    benefitRate.benefitAmount = formModel.benefitAmount;
    return benefitRate;
  }

  addRate() {
    const benefitRate = this.readRateForm();
    if (benefitRate.benefitAmount <= 0) {
      this.form.get('benefitAmount').setErrors({ 'min-benefit-amount': true });
      this.addRateError = 'Benefit amount should be greater than zero';
      return;
    }

    if (benefitRate.baseRate < 0) {
      this.form.get('baseRate').setErrors({ 'min-base-rate': true });
      this.addRateError = 'Base rate should be greater than or equal to zero';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newBenefitRateEffectiveDate = moment(benefitRate.effectiveDate).toDate();
    newBenefitRateEffectiveDate.setHours(0, 0, 0, 0);

    if (newBenefitRateEffectiveDate < today) {
      this.form.get('effectiveDate').setErrors({ 'min-today': true });
      this.addRateError = 'Please select an effective date in the future';
      return;
    }

    if (newBenefitRateEffectiveDate > today && this.benefitRates.length === 0) {
      this.form.get('effectiveDate').setErrors({ 'equal-to-start-date': true });
      return;
    }

    if (newBenefitRateEffectiveDate.getTime() === today.getTime() && this.benefitRates.filter(rate => rate.benefitRateStatusText === 'Current').length > 0) {
      this.form.get('effectiveDate').setErrors({ 'single-current-rate': true });
      this.addRateError = 'There must only be a single rate for any effective date';
      return;
    }

    let multipleCurrentRatesFound = false;

    this.benefitRates.forEach(benefitRateItem => {
      if (moment(benefitRateItem.effectiveDate).toDate().getTime() === newBenefitRateEffectiveDate.getTime()) {
        this.form.get('effectiveDate').setErrors({ 'single-current-rate': true });
        multipleCurrentRatesFound = true;
      }
    });

    if (multipleCurrentRatesFound) {
      this.addRateError = 'There must only be a single rate for any effective date';
      return;
    }

    if (this.benefitRates.length === 0 || newBenefitRateEffectiveDate.getTime() === today.getTime()) {
      benefitRate.benefitRateStatusText = 'Current';
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.benefitRates.length; ++i) {
        if (this.benefitRates[i].benefitRateStatusText === 'Current') {
          this.benefitRates[i].benefitRateStatusText = 'Historic';
        }
      }
    } else {
      benefitRate.benefitRateStatusText = 'Future';
    }

    this.benefitRates.push(benefitRate);
    this.toggleRateForm();
  }

  deleteRow(benefitRate: BenefitRate) {
    this.confirmservice.confirmWithoutContainer('Remove Premium', ' Are you sure you want to remove the Premium?',
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            if (benefitRate.id === undefined &&
              (this.benefitRates.filter(rate => (moment(rate.effectiveDate).toDate().getTime() === moment(benefitRate.effectiveDate).toDate().getTime())).length > 0)) {
              for (let i = 0; i < this.benefitRates.length; ++i) {
                if (moment(this.benefitRates[i].effectiveDate).toDate().getTime() === moment(benefitRate.effectiveDate).toDate().getTime()) {
                  this.benefitRates.splice(i, 1);
                }
              }
            }
          }
        });
  }

  validateDates(): void {
    if (!this.form.get(Constants.startDate).value) {
      this.form.get(Constants.startDate).setErrors({ required: true });
      this.benefitStatusId = ProductStatusEnum.ClosedForBusiness;
      this.form.patchValue({ benefitStatus: this.benefitStatusId });
      return;
    }

    const startDate = new Date(this.form.get(Constants.startDate).value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get(Constants.endDate).value);
    endDate.setHours(0, 0, 0, 0);

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

    if (startDate < today) {
      this.form.get(Constants.startDate).setErrors({ 'min-today': true });
      return;
    } else {
      this.form.get(Constants.startDate).setErrors(null);
      this.form.get(Constants.startDate).updateValueAndValidity();
    }

    if (this.form.get(Constants.startDate).value && startDate > today) {
      this.benefitStatusId = ProductStatusEnum.ClosedForBusiness;
      this.form.patchValue({ benefitStatus: this.benefitStatusId });
      return;
    }

    if (!this.form.get(Constants.endDate).value) {
      this.benefitStatusId = ProductStatusEnum.OpenForBusiness;
      this.form.patchValue({ benefitStatus: this.benefitStatusId });
      return;
    }

    if (endDate >= today) {
      this.benefitStatusId = ProductStatusEnum.OpenForBusiness;
      this.form.patchValue({ benefitStatus: this.benefitStatusId });
    } else {
      this.benefitStatusId = ProductStatusEnum.ClosedForBusiness;
      this.form.patchValue({ benefitStatus: this.benefitStatusId });
    }
  }

  validateRateEffectiveDate(): void {
    const startDate = new Date(this.form.get(Constants.startDate).value);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const benefitRate = this.readRateForm();

    const newBenefitRateEffectiveDate = moment(benefitRate.effectiveDate).toDate();
    newBenefitRateEffectiveDate.setHours(0, 0, 0, 0);

    let multipleCurrentRatesFound = false;

    this.benefitRates.forEach(benefitRateItem => {
      if (moment(benefitRateItem.effectiveDate).toDate().getTime() === newBenefitRateEffectiveDate.getTime()) {
        this.form.get('effectiveDate').setErrors({ 'single-current-rate': true });
        multipleCurrentRatesFound = true;
      }
    });

    if (!multipleCurrentRatesFound) {
      if (this.benefitRates.length === 0 && newBenefitRateEffectiveDate.getTime() !== startDate.getTime()) {
        this.form.get('effectiveDate').setErrors({ 'equal-to-start-date': true });
      } else if (benefitRate.effectiveDate < startDate) {
        this.form.get('effectiveDate').setErrors({ min: true });
      } else if (benefitRate.effectiveDate < today) {
        this.form.get('effectiveDate').setErrors({ 'min-today': true });
      } else {
        this.form.get('effectiveDate').setErrors(null);
        this.form.get('effectiveDate').updateValueAndValidity();
      }
    }
  }

  private getProductStatuses(): void {
    this.lookupService.getProductStatuses().subscribe(
      data => { this.productStatuses = data; }
    );
  }

  private getBenefitTypes() {
    this.benefitsService.getBenefitTypes().subscribe(result => {
      this.benefitTypes = result;
    });
  }

  private getDisabilityBenefitTypes() {
    this.benefitsService.getDisabilityBenefitTypes().subscribe(result => {
      this.disabilityBenefitTerms = result.sort((a, b) => a.id - b.id);
    })
  }

  private getCoverMemberTypes() {
    this.benefitsService.getCoverMemberTypes().subscribe(result => {
      this.coverMemberTypes = result;
      this.coverMemberTypesFullResult = result;
    });
  }

  private getProducts(): void {
    this.productService.getProducts().subscribe(results => {
      this.products = results;
      this.isLoading$.next(false);
    });
  }

  populateEarningsTypeBasedOnProduct(earningId: number) {
    this.earningIds = [];
    this.earningIds.push(earningId);
    this.form.patchValue({
      earningTypes: this.earningIds
    });
  }

  populateCoverMemberTypeBasedOnProduct(productName: string) {
    this.form.patchValue({
      coverMemberType: this.model.coverMemberType ? this.model.coverMemberType : 0
    });
    this.coverMemberTypes = this.coverMemberTypesFullResult;
  }

  productChanged($event: any) {
    const target = $event.source.selected._element.nativeElement;
    const selectedData = {
      value: $event.value,
      text: target.innerText.trim()
    };
  }

  benefitTypeChanged($event: any) {
    if ($event.value === BenefitTypeEnum.Disability) {
      // Add validators for disability benefit terms
      this.form.get('disabilityBenefitTerm').setValidators([Validators.required, Validators.min(1)]);
    }
    else {
      // Remove validations and clear value
      this.form.get('disabilityBenefitTerm').clearValidators();
      this.form.patchValue({ disabilityBenefitTerm: null });
    }
    this.form.get('disabilityBenefitTerm').updateValueAndValidity();
  }
}
