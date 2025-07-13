import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { Case } from '../../shared/entities/case';
import { PolicyBankingDetailsComponent } from '../policy-banking-details/policy-banking-details.component';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { ProductOption } from '../../../product-manager/models/product-option';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { CaseTypeEnum } from '../../shared/enums/case-type.enum';

@Component({
  selector: 'policy-collection-details',
  templateUrl: './policy-collection-details.component.html',
  styleUrls: ['./policy-collection-details.component.css'],
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})

export class PolicyCollectionDetailsComponent extends WizardDetailBaseComponent<Case> implements AfterViewInit {

  @ViewChild(PolicyBankingDetailsComponent, { static: true }) policyBankingDetailComponent: PolicyBankingDetailsComponent;

  paymentMethods: Lookup[];
  paymentFrequencies: Lookup[];
  loadingPaymentMethods = false;
  loadingPaymentFrequencies = false;
  showDebitOrderMessage: boolean;
  productOption: ProductOption;
  maxCommissionPercentage: number;
  maxAdminPercentage: number;
  maxBinderFeePercentage: number;

  get isIndividualPolicy(): boolean {
    if (!this.model) { return false; }
    if (!this.model.caseTypeId) { return false; }
    return this.model.caseTypeId === 1;
  }

  get markPercentageInputFieldReadOnly(): boolean {
    if (userUtility.hasPermission('Edit Maximum Scheme Commission')) { return false; };
    return this.model && this.model?.caseTypeId === CaseTypeEnum.MaintainPolicyChanges;
  }

  get hasPremiumAdjustmentPermission(): boolean {
    return userUtility.hasPermission('Apply Premium Adjustment');
  }

  payDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  ngAfterViewInit() {
    this.policyBankingDetailComponent.createForm(0);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      paymentMethod: ['', [Validators.min(1)]],
      paymentFrequency: ['', [Validators.required, Validators.min(1)]],
      payDate: ['', [Validators.min(1)]],
      decemberPayDate: ['', [Validators.min(1)]],
      adminPercentage: [''],
      commissionPercentage: [''],
      binderFeePercentage: [''],
      premiumAdjustmentPercentage: ['']
    });
  }

  onLoadLookups(): void {
    this.getPaymentMethods();
    this.getPaymentFrequencies();
  }

  populateModel(): void {
    if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      const form = this.form.getRawValue();
      this.model.mainMember.policies[0].paymentMethod = form.paymentMethod;
      this.model.mainMember.policies[0].regularInstallmentDayOfMonth = form.payDate;
      this.model.mainMember.policies[0].decemberInstallmentDayOfMonth = form.decemberPayDate;
      this.model.mainMember.policies[0].firstInstallmentDate = this.getFirstInstallmentDate(form.payDate, form.decemberPayDate);
      this.model.mainMember.policies[0].paymentFrequency = form.paymentFrequency;
      this.model.mainMember.policies[0].adminPercentage = this.convertToPercentage(form.adminPercentage);
      this.model.mainMember.policies[0].commissionPercentage = this.convertToPercentage(form.commissionPercentage);
      this.model.mainMember.policies[0].binderFeePercentage = this.convertToPercentage(form.binderFeePercentage);
      this.model.mainMember.policies[0].premiumAdjustmentPercentage = this.convertToPercentage(form.premiumAdjustmentPercentage);

      if (this.model.newMainMember && this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
        this.model.newMainMember.policies[0].paymentFrequency = form.paymentFrequency;
      }
      this.policyBankingDetailComponent.wizardReadFormData(this.context);
    }
  }

  convertToPercentage(value: any): number {
    if (!value || value === undefined) { return 0.00; }
    return Number(value) / 100.0;
  }

  getFirstInstallmentDate(regularInstallmentDay: number, decemberInstallmentday: number): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let installmentDate: Date;
    // Get this month's regular installment date.
    if (today.getMonth() === 11) {
      installmentDate = new Date(today.getFullYear(), today.getMonth(), decemberInstallmentday);
    } else {
      installmentDate = new Date(today.getFullYear(), today.getMonth(), regularInstallmentDay);
    }
    // The first payment cannot be within the next 3 days.
    const cutoffDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
    if (installmentDate.getTime() < cutoffDate.getTime()) {
      installmentDate = cutoffDate;
    }
    return installmentDate;
  }

  roundNumber(value: number): string {
    return value.toFixed(2);
  }

  populateForm(): void {
    if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {

      const policy = this.model.mainMember.policies[0];

      this.form.patchValue({
        paymentMethod: policy.paymentMethod,
        paymentFrequency: policy.paymentFrequency,
        payDate: policy.regularInstallmentDayOfMonth,
        decemberPayDate: policy.decemberInstallmentDayOfMonth,
        adminPercentage: this.getPercentage(policy.adminPercentage),
        commissionPercentage: this.getPercentage(policy.commissionPercentage),
        binderFeePercentage: this.getPercentage(policy.binderFeePercentage),
        premiumAdjustmentPercentage: this.getPercentage(policy.premiumAdjustmentPercentage)
      });
    }

    if (this.context === undefined) {
      this.policyBankingDetailComponent.setViewData(this.model.mainMember.rolePlayerBankingDetails);
      this.policyBankingDetailComponent.setCalculatedStatus();
    } else {
      this.policyBankingDetailComponent.wizardPopulateForm(this.context);
      this.policyBankingDetailComponent.setCalculatedStatus();
    }

    if (this.isReadonly) {
      this.policyBankingDetailComponent.disable();
    }

    const canEditMaxCommission = userUtility.hasPermission('Edit Maximum Scheme Commission');
    const maxCommision = canEditMaxCommission ? 100.0 : this.productOption ? this.productOption.maxCommissionFeePercentage * 100.0 : 100.0;

    this.productOption = this.model.mainMember.policies[0].productOption;
    this.maxAdminPercentage = this.productOption ? this.productOption.maxAdminFeePercentage * 100.0 : 100.0;
    this.maxCommissionPercentage = maxCommision;
    this.maxBinderFeePercentage = this.productOption ? this.productOption.maxBinderFeePercentage * 100.0 : 100.0;

    if (this.maxAdminPercentage > 100.0 || this.maxAdminPercentage === 0.0) {
      this.maxAdminPercentage = 100.0;
    }
    if (this.maxCommissionPercentage > 100.0 || this.maxCommissionPercentage === 0.0) {
      this.maxCommissionPercentage = 100.0;
    }
    if (this.maxBinderFeePercentage > 100.0 || this.maxBinderFeePercentage === 0.0) {
      this.maxBinderFeePercentage = 100.0;
    }

    if (this.model.caseTypeId === 2) {
      this.form.get('adminPercentage').setValidators([Validators.required, Validators.max(this.maxAdminPercentage)]);
      this.form.get('commissionPercentage').setValidators([Validators.required, Validators.max(this.maxCommissionPercentage)]);
      this.form.get('binderFeePercentage').setValidators([Validators.required, Validators.max(this.maxBinderFeePercentage)]);
    }

    if (!this.hasPremiumAdjustmentPermission) {
      this.form.get('premiumAdjustmentPercentage').disable();
    }
  }

  getPercentage(value: number): number {
    if (!value || value === undefined) { return 0.00; }
    return Number(this.roundNumber(value * 100.0));
  }

  getPaymentMethods(): void {
    this.loadingPaymentMethods = true;
    this.lookupService.getPaymentMethods().subscribe(
      data => {
        this.paymentMethods = data;
        this.loadingPaymentMethods = false;
      }
    );
  }

  getPaymentFrequencies(): void {
    this.loadingPaymentFrequencies = true;
    this.lookupService.getPaymentFrequencies().subscribe(
      data => {
        this.paymentFrequencies = data;
        this.loadingPaymentFrequencies = false;
      }
    );
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    const bankingDetailsValidationResult = this.policyBankingDetailComponent.wizardValidateForm(this.context);
    if (bankingDetailsValidationResult.errors > 0) {
      validationResult.errors++;
      validationResult.errorMessages.push(bankingDetailsValidationResult.errorMessages[0]);
    }

    return validationResult;
  }

  showDebitOrderValidation(): boolean {
    if (this.form.value.paymentMethod === PaymentMethodEnum.DebitOrder) {
      return !(this.policyBankingDetailComponent.hasBankAccounts);
    }
  }
}
