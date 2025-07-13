import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'src/app/shared-utilities/datepicker/dateformat';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PaymentMethodEnum } from 'src/app/shared/enums/payment-method-enum';
import { Case } from 'src/app/shared/models/case';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { ProductOption } from 'src/app/shared/models/product-option';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { PolicyBankingDetailsComponent } from '../policy-banking-details/policy-banking-details.component';

@Component({
  selector: 'policy-collection-details',
  templateUrl: './policy-collection-details.component.html',
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})

export class PolicyCollectionDetailsComponent extends WizardDetailBaseComponent<Case> implements AfterViewInit {

  @ViewChild(PolicyBankingDetailsComponent) policyBankingDetailComponent: PolicyBankingDetailsComponent;

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

  payDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  ngAfterViewInit() {
    this.populatePolicyBankingDetailComponent();
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      paymentMethod: ['', [Validators.min(1)]],
      paymentFrequency: ['', [Validators.required, Validators.min(1)]],
      payDate: ['', [Validators.min(1)]],
      decemberPayDate: ['', [Validators.min(1)]],
      adminPercentage: [''],
      commissionPercentage: [''],
      binderFeePercentage: ['']
    });
  }

  onLoadLookups(): void {
    this.getPaymentMethods();
    this.getPaymentFrequencies();

  }

  populateModel(): void {
    if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      const form = this.form.value;
      this.model.mainMember.policies[0].paymentMethod = form.paymentMethod;
      this.model.mainMember.policies[0].regularInstallmentDayOfMonth = form.payDate;
      this.model.mainMember.policies[0].decemberInstallmentDayOfMonth = form.decemberPayDate;
      this.model.mainMember.policies[0].firstInstallmentDate = this.getFirstInstallmentDate(form.payDate, form.decemberPayDate);
      this.model.mainMember.policies[0].paymentFrequency = form.paymentFrequency;
      this.model.mainMember.policies[0].adminPercentage = form.adminPercentage / 100.0;
      this.model.mainMember.policies[0].commissionPercentage = form.commissionPercentage / 100.0;
      this.model.mainMember.policies[0].binderFeePercentage = form.binderFeePercentage / 100.0;
      this.policyBankingDetailComponent.wizardReadFormData(this.context);
    }
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
      this.form.patchValue({
        paymentMethod: this.model.mainMember.policies[0].paymentMethod,
        paymentFrequency: this.model.mainMember.policies[0].paymentFrequency,
        payDate: this.model.mainMember.policies[0].regularInstallmentDayOfMonth,
        decemberPayDate: this.model.mainMember.policies[0].decemberInstallmentDayOfMonth,
        adminPercentage: this.roundNumber(this.model.mainMember.policies[0].adminPercentage ? this.model.mainMember.policies[0].adminPercentage * 100.0 : 0),
        commissionPercentage: this.roundNumber(this.model.mainMember.policies[0].commissionPercentage ? this.model.mainMember.policies[0].commissionPercentage * 100.0 : 0),
        binderFeePercentage: this.roundNumber(this.model.mainMember.policies[0].binderFeePercentage ? this.model.mainMember.policies[0].binderFeePercentage * 100.0 : 0)
      });
    }

    this.populatePolicyBankingDetailComponent();

    this.productOption = this.model.mainMember.policies[0].productOption;
    this.maxAdminPercentage = this.productOption ? this.productOption.maxAdminFeePercentage * 100.0 : 100.0;
    this.maxCommissionPercentage = this.productOption ? this.productOption.maxCommissionFeePercentage * 100.0 : 100.0;
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

  }

  populatePolicyBankingDetailComponent() {
    if (this.policyBankingDetailComponent && this.model) {
      if (this.context === undefined) {
        this.policyBankingDetailComponent.setViewData(this.model.mainMember.rolePlayerBankingDetails);
        this.policyBankingDetailComponent.setCalculatedStatus();
      } else {
        this.policyBankingDetailComponent.wizardPopulateForm(this.context);
        this.policyBankingDetailComponent.setCalculatedStatus();
      }

      this.policyBankingDetailComponent.createForm(0);

      if (this.isReadonly) {
        this.policyBankingDetailComponent.disable();
      }
    }
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
    if (this.policyBankingDetailComponent) {
      const bankingDetailsValidationResult = this.policyBankingDetailComponent.wizardValidateForm(this.context);
      if (bankingDetailsValidationResult.errors > 0) {
        validationResult.errors++;
        validationResult.errorMessages.push(bankingDetailsValidationResult.errorMessages[0]);
      }
    }
    return validationResult;
  }

  showDebitOrderValidation(): boolean {
    if (this.form.value.paymentMethod === PaymentMethodEnum.DebitOrder) {
      return !(this.policyBankingDetailComponent.hasBankAccounts);
    }
  }

}
