import { AfterViewInit } from "@angular/core";
import { Component, Input, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { AppEventsManager } from "src/app/shared-utilities/app-events-manager/app-events-manager";
import { MatDatePickerDateFormat, DatePickerDateFormat } from "src/app/shared-utilities/datepicker/dateformat";
import { ValidatePhoneNumber } from "src/app/shared-utilities/validators/phone-number.validator";
import { ValidateRegistrationNumber } from "src/app/shared-utilities/validators/registration-number.validator";
import { ValidationResult } from "src/app/shared/components/wizard/shared/models/validation-result";
import { WizardDetailBaseComponent } from "src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component";
import { PolicyStatus } from "src/app/shared/enums/policy-status.enum";
import { RefundTypeEnum } from "src/app/shared/enums/refund-type.enum";
import { Benefit } from "src/app/shared/models/benefit";
import { Case } from "src/app/shared/models/case";
import { Company } from "src/app/shared/models/company";
import { Lookup } from "src/app/shared/models/lookup.model";
import { PolicyManageReason } from "src/app/shared/models/policy-manage-reason";
import { ProductOption } from "src/app/shared/models/product-option";
import { RolePlayerPolicy } from "src/app/shared/models/role-player-policy";
import { LookupService } from "src/app/shared/services/lookup.service";
import { RequiredDocumentService } from "src/app/shared/services/required-document.service";
import { CancelPolicyReasonDialogComponent } from "../cancel-policy-reason-dialog/cancel-policy-reason-dialog.component";
import { GroupPolicyBenefitsComponent } from "../group-policy-benefits/group-policy-benefits.component";
import { PolicyProductOptionsComponent } from "../policy-product-options/policy-product-options.component";
import { BrokerPolicyService } from "../services/broker-policy-service";

@Component({
  selector: 'group-member-detail',
  templateUrl: './group-member-details.component.html',
  styleUrls: ['./group-member-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class GroupMemberDetailsComponent extends WizardDetailBaseComponent<Case> implements AfterViewInit {
  @Input() parentModel: Case = new Case();
  @ViewChild(PolicyProductOptionsComponent) policyProductOptionsComponent: PolicyProductOptionsComponent;
  @ViewChild(GroupPolicyBenefitsComponent) mainMemberBenefitsComponent: GroupPolicyBenefitsComponent;

  selectedProductOption: ProductOption;
  generatingCode = false;
  groupReferenceNo = '';
  minDate: Date;
  canBackDate: boolean;
  productOptions: ProductOption[] = [];
  industries: Lookup[] = [];
  industryClasses: Lookup[] = [];
  filteredIndustryClasses: Lookup[] = [];
  filters: number[] = [1, 2, 3, 5];
  selectedIndustryClass: number;
  industryClassesLoading = false;
  policySavedInceptionDate: string;
  canChangeStartDate = false;
  isCancelCase = false;
  displayedColumns = ['cancellationReason', 'cancellationDate', 'action'];
  datasource: any = [];
  isWithinCoolingOfPeriod = false;
  isReadOnly: boolean;
  cancellationReasons: Lookup[] = [];
  clientReferenceDuplicated = false;
  searchingClientReferenceDuplicates = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly lookupService: LookupService,
    private cancellationDialog: MatDialog,
    private policyService: BrokerPolicyService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.setPolicyInceptionDateParameters();
  }

  ngAfterViewInit() {
    this.populateMainMember();;
  }

  onLoadLookups(): void {
    this.getIndustryClasses();
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      rolePlayerId: [id],
      code: new FormControl(''),
      companyName: new FormControl('', [Validators.required]),
      companyRegNo: new FormControl('', [Validators.required, ValidateRegistrationNumber]),
      referenceNumber: new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
      contactPersonName: new FormControl('', [Validators.required]),
      contactTelephone: new FormControl('', [Validators.required, ValidatePhoneNumber]),
      contactMobile: new FormControl('', [Validators.required, ValidatePhoneNumber]),
      contactEmail: new FormControl('', [Validators.required, Validators.email]),
      policyInceptionDate: new FormControl(null, [Validators.required]),
      companyIdType: ['', [Validators.min(1), Validators.required]],
      industryClass: [null, [Validators.required]],
      changeInceptionDate: new FormControl(''),
      oldPolicyNumber: new FormControl('')
    });

  }

  populateForm(): void {
    if (this.isDisabled) {
      this.form.get('oldPolicyNumber').disable();
      if (this.policyProductOptionsComponent) {
        if (this.policyProductOptionsComponent.formProducts) {
          this.policyProductOptionsComponent.formProducts.disable();
        }
      }
    }

    this.populateMainMember();

    if (!this.isDisabled) {
      this.canChangeStartDate = this.checkChangeStartDate();
    }
  }

  populateMainMember() {
    if (this.model.mainMember && this.model.mainMember.policies && this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      if (this.model.mainMember.policies[0].policyId === 0) {
        this.form.get('policyInceptionDate').enable();
      } else {
        this.form.get('policyInceptionDate').disable();
      }
    } else {
      this.form.get('policyInceptionDate').disable();
    }

    if (this.model.mainMember && this.model.mainMember.company) {
      this.form.patchValue({
        rolePlayerId: this.model.mainMember.rolePlayerId,
        companyName: this.model.mainMember.company.name ? this.model.mainMember.company.name : '',
        companyRegNo: this.model.mainMember.company.companyRegNo ? this.model.mainMember.company.companyRegNo : '',
        referenceNumber: this.model.mainMember.company.vatRegistrationNo ? this.model.mainMember.company.vatRegistrationNo : '',
        companyIdType: this.model.mainMember.company.companyIdType ? this.model.mainMember.company.companyIdType : '',
        contactPersonName: this.model.mainMember.company.contactPersonName ? this.model.mainMember.company.contactPersonName : '',
        contactTelephone: this.model.mainMember.company.contactTelephone ? this.model.mainMember.company.contactTelephone : '',
        contactMobile: this.model.mainMember.company.contactMobile ? this.model.mainMember.company.contactMobile : '',
        contactEmail: this.model.mainMember.company.contactEmail ? this.model.mainMember.company.contactEmail : '',
        policyInceptionDate: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].policyInceptionDate : '',
        industryClass: this.model.mainMember.company.industryClass ? this.model.mainMember.company.industryClass : null
      });

      const companyIdType = this.model.mainMember.company.companyIdType ? this.model.mainMember.company.companyIdType : 0;
      const referenceNumber = this.model.mainMember.company.companyRegNo ? this.model.mainMember.company.companyRegNo.trim() : '';

      if (companyIdType === 4 && referenceNumber !== '') {
        this.groupReferenceNo = referenceNumber;
      }

      this.populateMainMemberBenefitsComponent();

      if (this.isCancelCase) {
        this.getCancellationReasons();
      }
    }

  }

  populateMainMemberBenefitsComponent() {
    if (this.mainMemberBenefitsComponent) {
      this.mainMemberBenefitsComponent.populateForm(this.model);
      this.companyIdTypeChange({ value: this.model.mainMember.company.companyIdType });
      if (!this.isDisabled) {
        this.isPolicyInceptionDateInThePast();
      }
      this.patchValues();
    }
  }

  enableStartDate(box: any): void {
    if (box.checked) {
      this.minDate = this.model.mainMember.policies[0].policyInceptionDate;
      this.form.get('policyInceptionDate').enable();
    } else {
      this.form.patchValue({
        policyInceptionDate: this.policySavedInceptionDate
      });
      this.form.get('policyInceptionDate').disable();
    }
  }

  checkChangeStartDate(): boolean {
    if (!this.model.mainMember) { return false; }
    if (!this.model.mainMember.policies) { return false; }
    if (this.model.mainMember.policies.length === 0) { return false; }
    if (!this.model.mainMember.policies[0]) { return false; }

    const policy = this.model.mainMember.policies[0];
    if (policy.policyId === 0) { return false; }
    if (policy.policyStatus === PolicyStatus.PendingFirstPremium) { return true; }
    if (policy.policyStatus === PolicyStatus.Active) {
      const startDate = new Date(policy.policyInceptionDate);
      const cutoffDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today.getTime() < cutoffDate.getTime()) {
        return true;
      }
    }

    return false;
  }

  populateModel(): void {
    const value = this.form.getRawValue();
    this.model.mainMember.rolePlayerId = (value.rolePlayerId > 0) ? value.rolePlayerId : this.model.mainMember.rolePlayerId;

    if (!this.model.mainMember.company) {
      this.model.mainMember.company = new Company();
    }

    this.model.mainMember.company.name = value.companyName;
    this.model.mainMember.company.companyRegNo = value.companyRegNo;
    this.model.mainMember.company.referenceNumber = value.companyRegNo;
    this.model.mainMember.company.vatRegistrationNo = value.referenceNumber;
    this.model.mainMember.company.contactPersonName = value.contactPersonName;
    this.model.mainMember.company.contactTelephone = value.contactTelephone;
    this.model.mainMember.company.contactMobile = value.contactMobile;
    this.model.mainMember.company.contactEmail = value.contactEmail;
    this.model.mainMember.policies[0].clientReference = value.oldPolicyNumber;

    if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      this.model.mainMember.policies[0].policyInceptionDate = value.policyInceptionDate;
      this.model.mainMember.company.effectiveDate = value.policyInceptionDate;
    }

    this.model.mainMember.company.companyIdType = value.companyIdType;
    this.model.mainMember.company.industryClass = value.industryClass;
    this.policyProductOptionsComponent.populateModel();
    this.mainMemberBenefitsComponent.populateModel();

    if (this.canChangeStartDate) {
      const oldDate = new Date(this.policySavedInceptionDate);
      const newDate = new Date(this.model.mainMember.policies[0].policyInceptionDate);
      if (oldDate.getTime() !== newDate.getTime()) {
        this.model.mainMember.policies[0].policyStatus = PolicyStatus.PendingFirstPremium;
        this.triggerPolicyRefund();
      }
    }
  }

  patchValues() {
    if (this.model.mainMember.policies) {
      this.form.patchValue({
        policyInceptionDate: (this.isPolicyInceptionDateDefault()) ? null : this.getDateFormattedDate(this.model.mainMember.policies[0].policyInceptionDate),
        changeInceptionDate: false,
        oldPolicyNumber: this.model.mainMember.policies[0].clientReference
      });
      this.policySavedInceptionDate = (this.isPolicyInceptionDateDefault()) ? null : this.getDateFormattedDate(this.model.mainMember.policies[0].policyInceptionDate);
    }
  }

  companyIdTypeChange(event: any): void {
    if (!this.model.mainMember.company) {
      this.model.mainMember.company = new Company();
    }

    if (event.value) {
      switch (event.value) {
        case 1: // Company
          this.form.get('companyRegNo').enable();
          const regNo = this.form.get('companyRegNo').value;
          if (this.groupReferenceNo === regNo) {
            this.form.patchValue({ companyRegNo: '' });
          }
          break;
        case 4: // Group
          this.form.get('companyRegNo').disable();
          if (this.groupReferenceNo === '') {
            this.generateGroupReferenceNo();
          } else {
            this.form.patchValue({ companyRegNo: this.groupReferenceNo });
          }
          break;
      }
      this.model.mainMember.company.companyIdType = event.value;
      this.policyProductOptionsComponent.onCompanyTypeChanged(this.model);
      this.mainMemberBenefitsComponent.clearBenefits();
    }
  }

  generateGroupReferenceNo() {
    this.generatingCode = true;
    this.requiredDocumentService.generateDocumentNumber('GroupReference').subscribe(
      result => {
        const today = new Date();
        this.groupReferenceNo = `${today.getFullYear()}/${result}/99`;
        this.form.patchValue({ companyRegNo: this.groupReferenceNo });
        this.form.get('companyRegNo').updateValueAndValidity();
        this.generatingCode = false;
      }
    );
  }

  isPolicyInceptionDateInThePast(): boolean {
    const control = this.form.get('policyInceptionDate');
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);

    const today = new Date(dtm).getTime();
    const selectedDate = new Date(control.value).getTime();

    return selectedDate < today ? true : false;
  }

  isPolicyInceptionDateDefault(): boolean {
    if (this.model.mainMember.policies.length <= 0) {
      return true;
    }

    return new Date(this.model.mainMember.policies[0].policyInceptionDate).getFullYear() === 1;
  }

  getDateFormattedDate(dt: Date): string {
    if (!dt) { return ''; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }

  onSelectedOption(event: any) {
    this.selectedProductOption = event;
    this.mainMemberBenefitsComponent.onSelectedOptionChanged(this.selectedProductOption);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    this.validateProducts(validationResult);
    return validationResult;
  }

  memberTypeHasDuplicateBasicBenefitsPerAgeGroup(benefits: Benefit[]): boolean {
    let hasDuplicates = false;

    const ageConfigs = [];

    benefits.forEach(benefit => {
      benefit.ruleItems.forEach(rule => {
        const formattedJson = rule.ruleConfiguration.replace(/'/g, '"');
        const configs = JSON.parse(formattedJson) as Array<any>;
        for (const config of configs) {
          if (config.fieldName === 'Maximum Entry Age (Years)') {
            ageConfigs.push(config);
          } else if (config.fieldName === 'Minimum Entry Age (Years)') {
            ageConfigs.push(config);
          }
        }
      });
    });

    hasDuplicates = ageConfigs.filter(a => ageConfigs.filter(b => b.fieldValue === a.fieldValue && a.fieldName === b.fieldName).length > 1).length > 1;

    return hasDuplicates;
  }

  validateProducts(validationResult: ValidationResult): void {
    if (this.model.mainMember.policies[0]) {
      if (!this.model.mainMember.policies[0].productOption) {
        validationResult.errorMessages.push('Product option is required');
        validationResult.errors += 1;
      }
    }
  }

  isFirstDay = (d: Date): boolean => {
    const date = d.getDate();
    const val = date / 1 === 1;
    return val;
  }

  setPolicyInceptionDateParameters() {
    this.lookupService.getItemByKey('AllowNewPolicyBackDate').subscribe(setting => {
      setting === 'true' ? this.canBackDate = true : this.canBackDate = false;

      if (this.canBackDate) {
        this.minDate = new Date(-8640000000000000);
      } else {
        this.minDate = new Date();
      }
    });
  }

  getIndustryClasses() {
    this.industryClassesLoading = true;
    this.lookupService.getIndustryClasses().subscribe(data => {
      this.industryClasses = data;
      this.filteredIndustryClasses = this.industryClasses.filter(s => this.filters.includes(s.id));
      this.industryClassesLoading = false;
    });
  }

  triggerPolicyRefund() {
    this.model.mainMember.policies[0].eligibleForRefund = true;
    this.model.mainMember.policies[0].refundType = RefundTypeEnum.PolicyInception;
  }


  onEditCancellation($event: any) {
    this.cancelPolicyWithNote();
  }

  cancelPolicyWithNote() {
    const rolePlayerPolicy = this.model.mainMember.policies[0];
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const dialog = this.cancellationDialog.open(CancelPolicyReasonDialogComponent, this.getCancelDialogConfig(rolePlayerPolicy));
    dialog.afterClosed().subscribe((data: PolicyManageReason) => {
      if (data) {
        rolePlayerPolicy.isDeleted = true;
        rolePlayerPolicy.modifiedDate = dtm;
        this.notifyCancellationNoteAdded(data.reason, data.effectiveDate);
      }
    });
  }

  getCancelDialogConfig(rolePlayerPolicy: RolePlayerPolicy): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.data = {
      rolePlayerPolicy,
      canAddEdit: this.canAddRemove
    };
    return config;
  }

  get canAddRemove(): boolean {
    return this.canEdit && !this.isReadOnly;
  }


  notifyCancellationNoteAdded(reason: number, effectiveDate: Date) {
    this.model.mainMember.policies[0].policyStatus = PolicyStatus.PendingCancelled;
    this.model.mainMember.policies[0].cancellationDate = new Date(effectiveDate);
    this.model.mainMember.policies[0].policyCancelReason = reason;
    const cancelReason = this.cancellationReasons.find(c => c.id === this.model.mainMember.policies[0].policyCancelReason).name;
    const data: any[] = [
      { cancellationReason: cancelReason, cancellationDate: this.model.mainMember.policies[0].cancellationDate }
    ];
    this.datasource = data;

    this.isWithinCoolingOfPeriod = this.checkIfWithinCoolingOffPeriod(this.model.mainMember.policies[0].cancellationDate);
  }

  checkIfWithinCoolingOffPeriod(effectiveDate: Date): boolean {
    const commencementDate = new Date(this.model.mainMember.policies[0].policyInceptionDate);
    const differenceInTime = effectiveDate.getTime() - commencementDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return (differenceInDays <= 31);
  }

  getCancellationReasons() {
    this.lookupService.getPolicyCancelReasons().subscribe(reasons => {
      this.cancellationReasons = reasons;
      if (this.cancellationReasons.length > 0) {
        if (this.model.mainMember.policies[0].policyCancelReason) {
          const cancelReason = this.cancellationReasons.find(c => c.id === this.model.mainMember.policies[0].policyCancelReason).name;
          const data: any[] = [
            { cancellationReason: cancelReason, cancellationDate: this.model.mainMember.policies[0].cancellationDate }
          ];
          this.datasource = data;
          if (data.length > 0 && !this.isDisabled) {
            const effectiveDate = new Date(this.model.mainMember.policies[0].cancellationDate);
            this.isWithinCoolingOfPeriod = this.checkIfWithinCoolingOffPeriod(effectiveDate);
          }
        }
      }
    });
  }

  clientReferenceExists(event: any) {
    if (event.target.value !== '') {
      const clientReference = event.target.value as string;
      this.searchingClientReferenceDuplicates = true;
      this.policyService.clientReferenceExists(clientReference.trim()).subscribe(result => {
        this.clientReferenceDuplicated = result;
        this.searchingClientReferenceDuplicates = false;
        this.applyExistsValidation(this.clientReferenceDuplicated, 'oldPolicyNumber');
      });
    }
  }

  applyExistsValidation(applyValidation: boolean, controlName: string) {
    if (applyValidation) {
      this.form.get(controlName).setErrors({ exists: true });
    } else {
      this.form.get(controlName).setErrors(null);
    }
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }
}
