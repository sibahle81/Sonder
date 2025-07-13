import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ProductOption } from '../../../product-manager/models/product-option';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from '../../shared/entities/case';
import { PolicyProductOptionsComponent } from '../policy-product-options/policy-product-options.component';
import { GroupPolicyBenefitsComponent } from '../group-policy-benefits/group-policy-benefits.component';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { ValidateRegistrationNumber } from 'projects/shared-utilities-lib/src/lib/validators/registration-number.validator';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { Company } from '../../shared/entities/company';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Benefit } from '../../../product-manager/models/benefit';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { RefundTypeEnum } from 'projects/fincare/src/app/shared/enum/refund-type.enum';
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { CancelPolicyReasonDialogComponent } from '../cancel-policy-reason-dialog/cancel-policy-reason-dialog.component';
import { PolicyManageReason } from '../../shared/entities/policy-manage-reason';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { PolicyService } from '../../shared/Services/policy.service';
import { EuropAssistPremiumMatrix } from '../../shared/entities/europ-assist-premium-matrix';
import { Constants } from '../../../constants';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { HttpErrorResponse } from '@angular/common/http';
import { IndustryService } from '../../shared/Services/industry.service';
import { Industry } from '../../../client-manager/shared/Entities/industry';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { SchemeClassification } from '../../shared/entities/scheme-classification';
import { ClientTypeEnum } from '../../shared/enums/client-type-enum';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { PolicyContact } from '../../shared/entities/policy-contact';
import { ContactTypeEnum } from '../../../broker-manager/models/enums/contact-type.enum';
import { BooleanEnum } from '../../shared/enums/boolean-enum';

@Component({
  selector: 'group-member-detail',
  templateUrl: './group-member-details.component.html',
  styleUrls: ['./group-member-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class GroupMemberDetailsComponent extends WizardDetailBaseComponent<Case> {
  @Input() parentModel: Case = new Case();
  @ViewChild(PolicyProductOptionsComponent, { static: true }) policyProductOptionsComponent: PolicyProductOptionsComponent;
  @ViewChild(GroupPolicyBenefitsComponent, { static: true }) mainMemberBenefitsComponent: GroupPolicyBenefitsComponent;

  selectedProductOption: ProductOption;
  generatingCode = false;
  groupReferenceNo = '';
  minDate: Date;
  eaMinDate: Date;
  canBackDate: boolean;
  productOptions: ProductOption[] = [];
  industryClasses: Lookup[] = [];
  filteredIndustryClasses: Lookup[] = [];
  filters: number[] = [1, 2, 3, 5, 6];
  selectedIndustryClass: number;
  industryClassesLoading = false;
  policySavedInceptionDate: string;
  europAssistSavedInceptionDate: string;
  canChangeStartDate = false;
  isCancelCase = false;
  displayedColumns = ['cancellationReason', 'cancellationDate', 'action'];
  datasource: any = [];
  isWithinCoolingOfPeriod = false;
  isReadOnly: boolean;
  cancellationReasons: Lookup[] = [];
  clientReferenceDuplicated = false;
  searchingClientReferenceDuplicates = false;
  isEuropAssist = false;
  isAnnualIncrease = false;
  hasEuropAssist = false;
  hasAnnualIncrease = false;
  isShowEndDate = false;
  isEnableInceptionDate = false;
  europAssistPremiumMatrix: EuropAssistPremiumMatrix;
  europAssistFee: any;
  hasPermission: boolean;
  backDatePermission = 'Back-date Europ Assist';
  annualIncreaseType = 'No annual increase';
  loadingIndustries: boolean = false;
  industries: Industry[] = [];
  filteredIndustries: Industry[] = [];
  loadingClientTypes: boolean = false;
  clientTypes: Lookup[] = [];
  loadingUnderwrittenList: boolean = false;
  underwrittenList: Lookup[] = [];
  loadingPolicyHolderList: boolean = false;
  policyHolderList: Lookup[] = [];
  partnershipList: Lookup[] = [];
  loadingPartnershipList: boolean = false;

  get brokerDetail(): Brokerage {
    return this.model && 
           this.model?.brokerage ? this.model.brokerage : new Brokerage();
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly lookupService: LookupService,
    private readonly policyService: PolicyService,
    private readonly industryService: IndustryService,
    private cancellationDialog: MatDialog
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.setPolicyInceptionDateParameters();
  }

  onLoadLookups(): void {
    this.loadIndustryClasses();
    this.loadIndustries();
    this.loadClientTypes();
    this.loadUnderwrittens();
    this.loadPolicyHolders();
    this.loadPartnerships();
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      rolePlayerId: [id],
      code: new UntypedFormControl(''),
      companyName: new UntypedFormControl('', [Validators.required]),
      companyRegNo: new UntypedFormControl('', [Validators.required, ValidateRegistrationNumber]),
      referenceNumber: new UntypedFormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
      contactPersonName: new UntypedFormControl('', [Validators.required]),
      contactTelephone: new UntypedFormControl('', [Validators.required, ValidatePhoneNumber]),
      contactMobile: new UntypedFormControl('', [Validators.required, ValidatePhoneNumber]),
      contactEmail: new UntypedFormControl('', [Validators.required, Validators.email]),
      policyInceptionDate: new UntypedFormControl(null, [Validators.required]),
      companyIdType: ['', [Validators.min(1), Validators.required]],
      industryClass: [null, [Validators.required]],
      industryId: [null, [Validators.required]],
      clientTypeId: [null, [Validators.required]],
      changeInceptionDate: new UntypedFormControl(''),
      changeEuropAssistInceptionDate: new UntypedFormControl(''),
      oldPolicyNumber: new UntypedFormControl(''),
      isEuropAssist: new UntypedFormControl(''),
      isAnnualIncrease: new UntypedFormControl(''),
      europAssistInceptionDate: new UntypedFormControl(''),
      europAssistEndDate: new UntypedFormControl(''),
      annualIncreaseType: new UntypedFormControl(''),
      underwritten: [null, [Validators.required]],
      policyHolder: [null, [Validators.required]],
      partnership: [null, [Validators.required]],
      contactName: new UntypedFormControl('', [Validators.required]),
      telephoneNumber: new UntypedFormControl('', [Validators.required]),
      emailAddress: new UntypedFormControl('', [Validators.required]),
    });
  }

  populateForm(): void {
    if (this.model) {
      this.mainMemberBenefitsComponent.populateForm(this.model);
      if (!this.isDisabled) {
        this.isPolicyInceptionDateInThePast();
      }
      this.patchValues();
    }

    if (this.isDisabled) {
      this.form.get('oldPolicyNumber').disable();
      if (this.policyProductOptionsComponent) {
        if (this.policyProductOptionsComponent.formProducts) {
          this.policyProductOptionsComponent.formProducts.disable();
        }
      }
    }

    if (this.model.mainMember && this.model.mainMember.policies && this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      if (this.model.mainMember.policies[0].policyId === 0) {
        this.form.get('policyInceptionDate').enable();
        this.form.get('europAssistInceptionDate').enable();
      } else {
        this.form.get('europAssistInceptionDate').disable();
      }
    } else {
      this.form.get('policyInceptionDate').disable();
      this.form.get('europAssistInceptionDate').disable();
    }

    if (this.model.mainMember.company) {
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
        industryClass: this.model.mainMember.company.industryClass ? this.model.mainMember.company.industryClass : null,
        industryId: this.model.mainMember.company.industryId ? this.model.mainMember.company.industryId : null,
        clientTypeId: this.model.mainMember.clientType ? this.model.mainMember.clientType : null,
        isEuropAssist: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].isEuropAssist : false,
        isAnnualIncrease: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].isAnnualIncrease : false,
        annualIncreaseType: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].annualIncreaseType : 'No annual increase',
        europAssistInceptionDate: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].europAssistEffectiveDate : null,
        europAssistEndDate: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].europAssistEndDate : null,
        underwritten: this.model.mainMember.company.schemeClassification?.underwritten ? this.model.mainMember.company.schemeClassification?.underwritten : null,
        policyHolder: this.model.mainMember.company.schemeClassification?.policyHolder ? this.model.mainMember.company.schemeClassification?.policyHolder : null,
        partnership: this.model.mainMember.company.schemeClassification?.isPartnership ? 1 : 0,
        contactName: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].brokerPolicyContact?.contactName : '',	
	      telephoneNumber: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].brokerPolicyContact?.telephoneNumber : '',
	      emailAddress: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].brokerPolicyContact?.emailAddress : ''
      });

      if (this.model.mainMember.company.industryClass && this.model.mainMember.company.industryClass > 0) {
        if (this.industries && this.industries.length > 0) {
          this.getIndustries(this.model.mainMember.company.industryClass);
          this.form.patchValue({industryId: this.model.mainMember.company.industryId ? this.model.mainMember.company.industryId : null});
        }
      }

      if (this.model.mainMember.policies && this.model.mainMember.policies[0]) {
        this.hasEuropAssist = this.model.mainMember.policies[0].isEuropAssist;
        this.isEuropAssist = this.model.mainMember.policies[0].isEuropAssist;

        if (this.model.mainMember.policies[0].europAssistEndDate !== null) {
          this.isShowEndDate = true;
        }
      }

      const companyIdType = this.model.mainMember.company.companyIdType ? this.model.mainMember.company.companyIdType : 0;
      const referenceNumber = this.model.mainMember.company.companyRegNo ? this.model.mainMember.company.companyRegNo.trim() : '';

      if (companyIdType === 4 && referenceNumber !== '') {
        this.groupReferenceNo = referenceNumber;
      }

      this.companyIdTypeChange({ value: this.model.mainMember.company.companyIdType });

      this.isCancelCase = this.model.caseTypeId === CaseType.CancelPolicy;

      if (this.isCancelCase) {
        this.getCancellationReasons();
      }
    }

    if (!this.isDisabled) {
      this.canChangeStartDate = this.checkChangeStartDate();
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

  enableEuropAssistInceptionDate(box: any): void {
    if (box.checked) {
      this.eaMinDate = this.model.mainMember.policies[0].europAssistEffectiveDate;
      this.form.get('europAssistInceptionDate').enable();
      this.isEnableInceptionDate = true;
    } else {
      this.form.patchValue({
        europAssistInceptionDate: this.europAssistSavedInceptionDate
      });
      this.form.get('europAssistInceptionDate').disable();
      this.isEnableInceptionDate = false;
    }
  }

  checkChangeStartDate(): boolean {
    if (!this.model.mainMember) { return false; }
    if (!this.model.mainMember.policies) { return false; }
    if (this.model.mainMember.policies.length === 0) { return false; }
    if (!this.model.mainMember.policies[0]) { return false; }

    const policy = this.model.mainMember.policies[0];
    if (policy.policyId === 0) { return false; }
    if (policy.policyStatus === PolicyStatusEnum.PendingFirstPremium) { return true; }
    if (policy.policyStatus === PolicyStatusEnum.Active) {
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

    const date = new Date(value.policyInceptionDate);
    const joinDate = date.getCorrectUCTDate();

    this.model.mainMember.displayName = value.companyName;
    this.model.mainMember.company.name = value.companyName;
    this.model.mainMember.clientType = value.clientTypeId;

    if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      if (this.model.mainMember.policies[0].policyOwner) {
        this.model.mainMember.policies[0].policyOwner.displayName = value.companyName;
      }
    }    

    this.model.mainMember.company.companyRegNo = value.companyRegNo;
    this.model.mainMember.company.referenceNumber = value.companyRegNo;
    this.model.mainMember.company.vatRegistrationNo = value.referenceNumber;
    this.model.mainMember.company.contactPersonName = value.contactPersonName;
    this.model.mainMember.company.contactTelephone = value.contactTelephone;
    this.model.mainMember.company.contactMobile = value.contactMobile;
    this.model.mainMember.company.contactEmail = value.contactEmail;
    this.model.mainMember.company.companyIdType = value.companyIdType;
    this.model.mainMember.company.industryClass = value.industryClass;
    this.model.mainMember.company.industryId = value.industryId;
    
    if (!this.model.mainMember.company.schemeClassification) {
      this.model.mainMember.company.schemeClassification = new SchemeClassification();
    }
    this.model.mainMember.company.schemeClassification.rolePlayerId = this.model.mainMember.rolePlayerId;
    this.model.mainMember.company.schemeClassification.underwritten = value.underwritten;
    this.model.mainMember.company.schemeClassification.policyHolder = value.policyHolder;
    this.model.mainMember.company.schemeClassification.isPartnership = +value.partnership == BooleanEnum.Yes;
   
    this.model.mainMember.policies[0].clientReference = value.oldPolicyNumber;
    this.model.mainMember.policies[0].isEuropAssist = this.isEuropAssist;
    this.model.mainMember.policies[0].isAnnualIncrease = this.isAnnualIncrease;
    this.model.mainMember.policies[0].annualIncreaseType = this.annualIncreaseType; 
    
    if (!this.model.mainMember.policies[0].brokerPolicyContact) {
      this.model.mainMember.policies[0].brokerPolicyContact = new PolicyContact();
    }
    this.model.mainMember.policies[0].brokerPolicyContact.contactName  = value.contactName;
    this.model.mainMember.policies[0].brokerPolicyContact.telephoneNumber  = value.telephoneNumber;
    this.model.mainMember.policies[0].brokerPolicyContact.emailAddress  = value.emailAddress; 
    this.model.mainMember.policies[0].brokerPolicyContact.contactType  = ContactTypeEnum.BrokerContact; 

    if (this.isEuropAssist) {
      const euInceptiondate = new Date(value.europAssistInceptionDate);
      const europInceptiondate = euInceptiondate.getCorrectUCTDate();
      this.model.mainMember.policies[0].europAssistEffectiveDate = europInceptiondate;
    }

    if (this.hasEuropAssist && !this.isEuropAssist) {
      if (value.europAssistEndDate) {
        const endDate = new Date(value.europAssistEndDate);
        const endingDate = endDate.getCorrectUCTDate();
        this.model.mainMember.policies[0].europAssistEndDate = endingDate;
      }
    }

    if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      this.model.mainMember.policies[0].policyInceptionDate = joinDate;
      this.model.mainMember.company.effectiveDate = joinDate;
    }

    this.policyProductOptionsComponent.populateModel();
    this.mainMemberBenefitsComponent.populateModel();

    if (this.canChangeStartDate) {
      const oldDate = new Date(this.policySavedInceptionDate);
      const newDate = new Date(this.model.mainMember.policies[0].policyInceptionDate);
      if (oldDate.getTime() !== newDate.getTime()) {
        this.model.mainMember.policies[0].policyStatus = PolicyStatusEnum.PendingFirstPremium;
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
      this.europAssistSavedInceptionDate = (this.isPolicyInceptionDateDefault()) ? null : this.getDateFormattedDate(this.model.mainMember.policies[0].europAssistEffectiveDate);
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

  isEuropAssistCheckChange(e: any) {
    if (this.model.mainMember.policies && this.model.mainMember.policies[0]) {
      this.hasEuropAssist = this.model.mainMember.policies[0].isEuropAssist;
    }
    this.isEuropAssist = e.checked;

    if (this.hasEuropAssist && !this.isEuropAssist) {
      this.isShowEndDate = true;
    } else {
      this.isShowEndDate = false;
    }

    if (this.isEuropAssist && !this.hasEuropAssist) {
      this.isEnableInceptionDate = true;
    } else {
      this.isEnableInceptionDate = false;
    }
  }

  annualIncreaseTypeChanged(e: any) {
    if (this.model.mainMember.policies && this.model.mainMember.policies[0]) {
      var annualIncreaseType = this.form.get('annualIncreaseType').value;
      this.annualIncreaseType = annualIncreaseType;
    }
  }

  isAnnualIncreaseCheckChange(e: any) {
    if (this.model.mainMember.policies && this.model.mainMember.policies[0]) {
      this.hasAnnualIncrease = this.model.mainMember.policies[0].isAnnualIncrease;
    }
    this.isAnnualIncrease = e.checked;
    this.isAnnualIncrease = true;
  }

  onSelectedOption(event: any) {
    this.selectedProductOption = event;
    this.mainMemberBenefitsComponent.onSelectedOptionChanged(this.selectedProductOption);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    this.validateProducts(validationResult);
    if (this.isCancelCase) {
      const policy = this.model.mainMember.policies[0];
      if (!policy.policyCancelReason) {
        validationResult.errorMessages.push('Policy cancellation reason and effective date are required');
        validationResult.errors += 1;
      }
    }
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
    if (!d) { return false; }
    const date = d.getDate();
    const val = date / 1 === 1;
    return val;
  }

  setPolicyInceptionDateParameters() {
    this.lookupService.getItemByKey('AllowNewPolicyBackDate').subscribe(setting => {
      setting === 'true' ? this.canBackDate = true : this.canBackDate = false;
      this.isShowEndDate = false;
      if (this.canBackDate) {
        this.minDate = new Date(-8640000000000000);
      } else {
        this.minDate = new Date();
      }

      this.hasPermission = userUtility.hasPermission(this.backDatePermission);
      if (this.hasPermission) {
        const backDate = new Date();
        backDate.setMonth(backDate.getMonth() - 1);
        this.eaMinDate = new Date(backDate);
      } else {
        this.eaMinDate = new Date();
      }
    });
  }

  loadClientTypes(): void {
    this.loadingClientTypes = true;
    this.lookupService.getClientTypes().subscribe({
      next: (data: Lookup[]) => {   
        this.clientTypes = data;
         //Remove items
        this.clientTypes.splice(this.clientTypes.findIndex(item => item.id === ClientTypeEnum.HealthCareProvider),1);
        this.clientTypes.splice(this.clientTypes.findIndex(item => item.id === ClientTypeEnum.All),1);      
      },
      error: (response: HttpErrorResponse) => {

        this.loadingClientTypes = false;
      },
      complete: () => {
        this.loadingClientTypes = false;
      }
    });
  }

  loadIndustries(): void {
    this.loadingIndustries = true;
    this.industryService.getIndustries().subscribe({
      next: (data: Industry[]) => {
        this.industries = data;
        const values = this.form?.getRawValue();
        if (values && values.industryClass) {
          this.getIndustries(values.industryClass);
          if (this.model?.mainMember?.company) {
            this.form.patchValue({industryId: this.model.mainMember.company.industryId})
          }
        }
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : 'Could not load policy';
        this.alertService.error(errorMessage, 'Industry Error');
        this.loadingIndustries = false;
      },
      complete: () => {

        this.loadingIndustries = false;
      }
    });
  }

  loadIndustryClasses() {
    this.industryClassesLoading = true;
    this.lookupService.getIndustryClasses().subscribe(data => {
      this.industryClasses = data;
      this.filteredIndustryClasses = this.industryClasses.filter(s => this.filters.includes(s.id));
      this.industryClassesLoading = false;
    });

    this.policyService.getEuropAssistPremiumMatrices().subscribe(matrices => {
      this.europAssistPremiumMatrix = matrices[0];
      this.europAssistFee = this.europAssistPremiumMatrix.basePremium + this.europAssistPremiumMatrix.profitExpenseLoadingPremium;
    })
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
    this.model.mainMember.policies[0].policyStatus = PolicyStatusEnum.PendingCancelled;
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

  getIndustries(industryClassId: number): void {
    this.form.patchValue({industryId: null});
    this.filteredIndustries = this.industries.filter(s => s.industryClass === industryClassId);
  }

  loadUnderwrittens(): void {
    this.loadingUnderwrittenList = true;
    this.lookupService.getUnderwrittenOptions().subscribe({
      next: (data: Lookup[]) => {
        this.underwrittenList = data?.sort((a, b) => a.id - b.id);
      },
      error: (response: HttpErrorResponse) => {

        this.loadingUnderwrittenList = false;
      },
      complete: () => {
        this.loadingUnderwrittenList = false;
      }
    });
  }
  loadPolicyHolders(): void {
    this.loadingPolicyHolderList = true;
    this.lookupService.getPolicyHolderOptions().subscribe({
      next: (data: Lookup[]) => {
        this.policyHolderList = data?.sort((a, b) => a.id - b.id);
      },
      error: (response: HttpErrorResponse) => {
        this.loadingPolicyHolderList = false;
      },
      complete: () => {
        this.loadingPolicyHolderList = false;
      }
    });
  }
  loadPartnerships(): void {
    this.partnershipList.push(new Lookup(1,'Yes'));
    this.partnershipList.push(new Lookup(0,'No'));
  }
}
