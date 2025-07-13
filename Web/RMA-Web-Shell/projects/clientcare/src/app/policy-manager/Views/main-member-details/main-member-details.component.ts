import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ProductOption } from '../../../product-manager/models/product-option';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Person } from '../../shared/entities/person';
import { PersonDetailsComponent } from '../person-details/person-details.component';
import { Product } from '../../../product-manager/models/product';
import { Case } from '../../shared/entities/case';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { PolicyProductOptionsComponent } from '../policy-product-options/policy-product-options.component';
import { PolicyBenefitsComponent } from '../policy-benefits/policy-benefits.component';
import { GroupMemberDetailsComponent } from '../group-members-details/group-member-details.component';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { RolePlayerRelation } from '../../shared/entities/roleplayer-relation';
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { CancelPolicyReasonDialogComponent } from '../cancel-policy-reason-dialog/cancel-policy-reason-dialog.component';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { PolicyManageReason } from '../../shared/entities/policy-manage-reason';
import { ReinstatePolicyDialogComponent } from '../reinstate-policy-dialog/reinstate-policy-dialog.component';
import { RefundTypeEnum } from 'projects/fincare/src/app/shared/enum/refund-type.enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { PolicyService } from '../../shared/Services/policy.service';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

@Component({
  selector: 'main-member-details',
  templateUrl: './main-member-details.component.html',
  styleUrls: ['./main-member-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class MainMemberDetailsComponent extends WizardDetailBaseComponent<Case> implements AfterContentChecked {

  productOptions: ProductOption[] = [];
  person: Person;
  formMainMember: UntypedFormGroup;
  products: Product[];
  selectedProductOption: ProductOption;
  product: Product;
  brokerageId: number;
  representativeId: number;
  detailsModel: Case;
  isGroup = false;
  formGroupMember: UntypedFormGroup;
  coverMemberType = CoverMemberTypeEnum.MainMember;
  isSaIDtype = false;
  mainMemberAge: number;
  minDate: Date;
  canBackDate: boolean;
  isReadOnly: boolean;
  isCancelCase = false;
  displayedColumns = ['cancellationReason', 'cancellationDate', 'action'];
  datasource: any = [];
  isWithinCoolingOfPeriod = false;
  caseCausesProductsDisabling = false;
  isReinstatementCase = false;
  showPolicyNumber = false;
  isMaintainPolicyChanges = false;
  formPolicyDetails: UntypedFormGroup;
  policySavedInceptionDate: string;
  canChangeStartDate = false;
  cancellationReasons: Lookup[] = [];
  clientReferenceDuplicated = false;
  searchingClientReferenceDuplicates = false;

  roleplayerContext: RolePlayerTypeEnum[] = [RolePlayerTypeEnum.MainMemberSelf];

  @ViewChild(PersonDetailsComponent, { static: false }) personalDetailsComponent: PersonDetailsComponent;
  @ViewChild(GroupMemberDetailsComponent, { static: false }) groupMemberDetailsComponent: GroupMemberDetailsComponent;
  @ViewChild(PolicyProductOptionsComponent, { static: true }) policyProductOptionsComponent: PolicyProductOptionsComponent;
  @ViewChild(PolicyBenefitsComponent, { static: true }) mainMemberBenefitsComponent: PolicyBenefitsComponent;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly changeDetector: ChangeDetectorRef,
    private personDialog: MatDialog,
    private policyService: PolicyService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.setPolicyInceptionDateParameters();
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  onLoadLookups() { }

  createForm() {
    if (this.formMainMember) { return; }
    this.formMainMember = this.formBuilder.group({
      changeInceptionDate: false,
      policyInceptionDate: [null, [Validators.required]],
      joinAge: new UntypedFormControl(''),
      isVopdRequired: false,
      reinstatementDate: ['']
    });
    this.formPolicyDetails = this.formBuilder.group({
      mainMemberPolicyNumber: [''],
      oldPolicyNumber: ['']
    });
  }

  populateForm() {
    if (this.model) {
      this.detailsModel = this.model;

      switch (this.model.caseTypeId) {
        case CaseType.IndividualNewBusiness:
          this.isGroup = false;
          break;
        case CaseType.GroupNewBusiness:
          this.isGroup = true;
          break;
        case CaseType.MaintainPolicyChanges:
          this.isGroup = this.model.mainMember.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Company;
          break;
      }

      if (!this.isGroup) { this.patchNonGroupValues(); }

      this.mainMemberBenefitsComponent.isReadOnly = this.isDisabled;
      this.mainMemberBenefitsComponent.populateForm(this.model);
      if (!this.isDisabled) {
        this.isPolicyInceptionDateInThePast();
      }

      this.patchValues();
      this.formMainMember.patchValue({
        changeInceptionDate: false,
        joinAge: 0
      });
      this.formMainMember.get('joinAge').disable();
      if (!this.isGroup) {
        if (this.canBackDate) {
          this.canBackDate = this.model.clientReference && this.model.clientReference !== '';
        }
        this.calculateAge();
      }

      this.isCancelCase = this.model.caseTypeId === CaseType.CancelPolicy;
      this.isReinstatementCase = this.model.caseTypeId === CaseType.ReinstatePolicy;
      if (this.isCancelCase) {
        this.getCancellationReasons();
        this.setCancelCaseControlProperties();
        this.showPolicyNumber = true;
        this.formPolicyDetails.patchValue({ mainMemberPolicyNumber: this.model.mainMember.policies[0].policyNumber });
        this.formPolicyDetails.get('mainMemberPolicyNumber').disable();
      }
      if (this.isReinstatementCase) {
        if (this.model.mainMember.policies[0].lastReinstateDate) {
          this.formMainMember.patchValue({ reinstatementDate: this.getDateFormattedDate(this.model.mainMember.policies[0].lastReinstateDate) });
        }
        this.formMainMember.get('reinstatementDate').disable();
        this.formMainMember.get('policyInceptionDate').disable();
        this.showPolicyNumber = true;
        this.formPolicyDetails.patchValue({ mainMemberPolicyNumber: this.model.mainMember.policies[0].policyNumber });
        this.formPolicyDetails.get('mainMemberPolicyNumber').disable();
      }
    }
    if (this.isDisabled) {
      if (this.policyProductOptionsComponent && this.policyProductOptionsComponent.formProducts) {
        this.policyProductOptionsComponent.formProducts.disable();
      }
      if (this.personalDetailsComponent && this.personalDetailsComponent.form) {
        this.personalDetailsComponent.form.disable();
      }
      this.formMainMember.disable();
      this.formPolicyDetails.get('oldPolicyNumber').disable();
      this.mainMemberBenefitsComponent.isWizard = false;
    } else {
      this.canChangeStartDate = this.checkChangeStartDate();
      this.mainMemberBenefitsComponent.isWizard = true;
    }
    if (this.model && this.model.caseTypeId === CaseType.MaintainPolicyChanges) {
      this.setMaintainCaseControlProperties();
      this.formPolicyDetails.patchValue({ oldPolicyNumber: this.model.mainMember.policies[0].clientReference });
      this.formPolicyDetails.patchValue({ mainMemberPolicyNumber: this.model.mainMember.policies[0].policyNumber });
      this.isMaintainPolicyChanges = true;
      this.showPolicyNumber = true;
      this.formPolicyDetails.get('mainMemberPolicyNumber').disable();    
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

  populateModel() {
    switch (this.model.caseTypeId) {
      case CaseType.IndividualNewBusiness:
        this.isGroup = false;
        break;
      case CaseType.GroupNewBusiness:
        this.isGroup = true;
        break;
      case CaseType.MaintainPolicyChanges:
        this.isGroup = this.model.mainMember.rolePlayerIdentificationType !== RolePlayerIdentificationTypeEnum.Person;
        this.model.mainMember.policies[0].clientReference = this.formPolicyDetails.get('oldPolicyNumber').value;
        break;
    }

    if (this.policyProductOptionsComponent.formProducts.valid && this.policyProductOptionsComponent.selectedProductOption && this.model.mainMember.policies) {
      this.model.mainMember.policies[0].productOption = this.policyProductOptionsComponent.selectedProductOption;
      this.model.mainMember.policies[0].productOption.product = this.policyProductOptionsComponent.selectedProductOption.product;
    }

    const date = new Date(this.formMainMember.get('policyInceptionDate').value);
    const joinDate = date.getCorrectUCTDate();

    if (!this.isGroup) {
      this.personalDetailsComponent.populateModel();
      this.policyProductOptionsComponent.populateModel();

      const person = new Person();
      if (this.personalDetailsComponent.form) {

        let dob = this.personalDetailsComponent.form.get('dateOfBirth').value;
        dob = this.fixDateOfBirth(new Date(dob));

        const personValues = this.personalDetailsComponent.form.getRawValue();
        person.dateOfBirth = dob;
        person.dateOfDeath = this.personalDetailsComponent.form.get('dateOfDeath').value;
        person.deathCertificateNumber = this.personalDetailsComponent.form.get('deathCertificateNumber').value;
        person.firstName = personValues.firstName;
        person.surname = personValues.surname;
        person.idNumber = this.personalDetailsComponent.form.get('idNumber').value;
        person.idType = personValues.idType;
        person.isAlive = personValues.isAlive;
        person.isVopdVerified = personValues.isVopdVerified;
        person.dateVopdVerified = this.personalDetailsComponent.form.get('dateVopdVerified').value;
        person.rolePlayerId = personValues.rolePlayerId;
        this.model.mainMember.rolePlayerId = (personValues.rolePlayerId > 0) ? personValues.rolePlayerId : this.model.mainMember.rolePlayerId;
        person.isDeleted = personValues.isDeleted;
        person.createdBy = personValues.createdBy ? personValues.createdBy : this.authService.getCurrentUser().email;
        person.createdDate = personValues.createdDate ? personValues.createdDate : new Date();
      }

      this.model.mainMember.displayName = `${person.firstName} ${person.surname}`.trim();
      this.model.mainMember.productId = this.model.productId;
      this.model.mainMember.policies[0].policyInceptionDate = joinDate;
      this.model.mainMember.policies[0].productOption.startDate = joinDate;
      this.model.mainMember.isVopdRequired = this.formMainMember.get('isVopdRequired').value;
      this.model.mainMember.person = person;
      this.model.mainMember.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;

      this.model.mainMember.joinDate = joinDate;
      //Commented the below line of code because business needs scheme details  
      //for view only on contact details tab.
      //this.model.mainMember.company = null;

      this.addMainMemberBeneficiary(this.model.mainMember);
      this.mainMemberBenefitsComponent.populateModel();
    } else {
      this.groupMemberDetailsComponent.setViewData(this.model);
      this.groupMemberDetailsComponent.populateModel();

      if (this.groupMemberDetailsComponent.form.valid) {
        const groupValues = this.groupMemberDetailsComponent.form.value;
        this.model.mainMember = groupValues;
        this.model.mainMember.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Company;
      }

      this.model.mainMember.policies[0].policyInceptionDate = joinDate;
      this.model.mainMember.policies[0].productOption.startDate = joinDate;
      this.model.mainMember.policies[0].policyStatus = PolicyStatusEnum.PendingFirstPremium;
    }

    if (this.canChangeStartDate) {
      const oldDate = new Date(this.policySavedInceptionDate);
      const newDate = new Date(this.model.mainMember.policies[0].policyInceptionDate);
      if (oldDate.getTime() !== newDate.getTime()) {
        this.model.mainMember.policies[0].policyStatus = PolicyStatusEnum.PendingFirstPremium;
        this.triggerPolicyRefund();
      }
    }
  }

  private fixDateOfBirth(date: Date): Date {
    const today = new Date();
    const timeZoneOffset = today.getTimezoneOffset();
    const adjustMinutes = (timeZoneOffset === 0) ? 0 : -timeZoneOffset;
    date.setHours(0, adjustMinutes, 0, 0);
    return date;
  }

  addMainMemberBeneficiary(rolePlayer: RolePlayer) {
    if (!this.model.beneficiaries) { this.model.beneficiaries = []; }
    const idx = this.model.beneficiaries.findIndex(b => b.person && b.person.idNumber === rolePlayer.person.idNumber);
    if (idx >= 0) {
      this.model.beneficiaries.splice(idx, 1);
    }
    this.model.beneficiaries.unshift(this.getMainMemberRolePlayer(rolePlayer));
  }

  getMainMemberRolePlayer(member: RolePlayer): RolePlayer {
    const rolePlayer = new RolePlayer();

    rolePlayer.person = Object.assign({}, member.person ? member.person : new Person());
    rolePlayer.person.manualBeneficiary = false;

    rolePlayer.rolePlayerId = member.rolePlayerId ? member.rolePlayerId : 0;
    rolePlayer.displayName = member.displayName;
    rolePlayer.tellNumber = member.tellNumber;
    rolePlayer.cellNumber = member.cellNumber;
    rolePlayer.emailAddress = member.emailAddress;
    rolePlayer.preferredCommunicationTypeId = member.preferredCommunicationTypeId;
    rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
    rolePlayer.person.manualBeneficiary = false;

    const relation = new RolePlayerRelation();
    relation.fromRolePlayerId = member.rolePlayerId ? member.rolePlayerId : 0;
    relation.toRolePlayerId = member.rolePlayerId ? member.rolePlayerId : 0;
    relation.rolePlayerTypeId = 10;
    rolePlayer.fromRolePlayers.push(relation);

    return rolePlayer;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.caseTypeId === CaseType.CancelPolicy) {
      if (!this.model.mainMember.policies[0].cancellationDate) {
        validationResult.errorMessages.push('Policy Cancellation Date is required');
        validationResult.errors = validationResult.errors + 1;
      }
      if (!this.model.mainMember.policies[0].policyCancelReason) {
        validationResult.errorMessages.push('Policy Cancellation Reason is required');
        validationResult.errors = validationResult.errors + 1;
      }
    }
    if (this.model.caseTypeId === CaseType.ReinstatePolicy) {
      if (!this.model.mainMember.policies[0].lastReinstateDate) {
        validationResult.errorMessages.push('Policy Reinstatement Effective Date is required');
        validationResult.errors = validationResult.errors + 1;
      }
    }

    if (this.policyProductOptionsComponent && this.policyProductOptionsComponent.formProducts) {
      this.policyProductOptionsComponent.onValidateModel(validationResult);
    } else if (this.model) {
      this.validateProducts(validationResult);
    }

    if (this.personalDetailsComponent && this.personalDetailsComponent.form) {
      this.personalDetailsComponent.onValidateModel(validationResult);
    } else if (this.model) {
      this.validatePerson(validationResult);
    }
    if (this.mainMemberBenefitsComponent) {
      this.mainMemberBenefitsComponent.onValidateModel(validationResult);
    }

    if (this.formMainMember && !this.formMainMember.get('policyInceptionDate').value) {
      validationResult.errorMessages.push('Policy Inception Date is required');
      validationResult.errors += 1;
    }

    return validationResult;
  }

  patchValues() {
    if (this.model.mainMember.policies) {
      this.formMainMember.patchValue({
        policyInceptionDate: (this.isPolicyInceptionDateDefault()) ? null : this.getDateFormattedDate(this.model.mainMember.policies[0].policyInceptionDate),
      });
      this.policySavedInceptionDate = (this.isPolicyInceptionDateDefault()) ? null : this.getDateFormattedDate(this.model.mainMember.policies[0].policyInceptionDate);
    }
  }

  isPolicyInceptionDateInThePast(): boolean {
    const control = this.formMainMember.get('policyInceptionDate');
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);

    const today = new Date(dtm).getTime();
    const selectedDate = new Date(control.value).getTime();

    return selectedDate < today;
  }

  isPolicyInceptionDateDefault(): boolean {
    if (this.model.mainMember.policies == null) {
      return true;
    }

    if (this.model.mainMember.policies.length <= 0) {
      return true;
    }

    const inceptionDate = new Date(this.model.mainMember.policies[0].policyInceptionDate).getFullYear();
    return inceptionDate === 1;
  }

  getDateFormattedDate(dt: Date): string {
    if (!dt) { return ''; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }

  clearAllMemberBenefits() {
    if (this.model.spouse) {
      for (let i = this.model.spouse.length - 1; i >= 0; i--) {
        this.model.spouse[i].benefits = [];
      }
    }

    if (this.model.children) {
      for (let i = this.model.children.length - 1; i >= 0; i--) {
        this.model.children[i].benefits = [];
      }
    }

    if (this.model.extendedFamily) {
      for (let i = this.model.extendedFamily.length - 1; i >= 0; i--) {
        this.model.extendedFamily[i].benefits = [];
      }
    }

    if (this.model.mainMember) {
      this.model.mainMember.benefits = [];
    }
  }

  onSelectedOption(event: any) {
    this.clearAllMemberBenefits();
    this.selectedProductOption = event;
    this.mainMemberBenefitsComponent.onSelectedOptionChanged(this.selectedProductOption);
  }

  validatePerson(validationResult: ValidationResult) {
    if (this.model.mainMember.person && this.model.mainMember.person.firstName.length === 0) {
      validationResult.errorMessages.push('Firstname is required');
      validationResult.errors += 1;
    }

    if (this.model.mainMember.person.surname.length === 0) {
      validationResult.errorMessages.push('Surname is required');
      validationResult.errors += 1;
    }

    if (!this.model.mainMember.person.idType) {
      validationResult.errorMessages.push('ID type is required');
      validationResult.errors += 1;
    }

    if (!this.model.mainMember.person.dateOfBirth) {
      validationResult.errorMessages.push('Date of Birth is required');
      validationResult.errors += 1;
    }

    if (this.model.mainMember.person.dateOfBirth) {
      const dtm = new Date();
      dtm.setHours(0, 0, 0, 0);
      const today = new Date(dtm).getTime();
      const dob = new Date(this.model.mainMember.person.dateOfBirth).getTime();

      if (dob > today) {
        validationResult.errorMessages.push('Date of Birth cannot be in the future');
        validationResult.errors += 1;
      }
    }

    if (this.model.mainMember.person.idNumber.length === 0) {
      validationResult.errorMessages.push('ID/Passport is required');
      validationResult.errors += 1;
    }
  }

  validateProducts(validationResult: ValidationResult) {
    if (this.model.mainMember.policies[0] && !this.model.mainMember.policies[0].productOption) {
      validationResult.errorMessages.push('Product Option is required');
      validationResult.errors += 1;
    }
  }

  setIDType(isSaId: boolean) {
    this.isSaIDtype = isSaId;
    if (!isSaId) {
      this.formMainMember.patchValue({ isVopdRequired: false });
    }
  }

  patchNonGroupValues() {
    if (this.model.mainMember) {
      if (this.model.mainMember.person) {
        this.model.mainMember.person.isAlive = true;
      }
      this.model.mainMember.person.isAlive = true;
      this.formMainMember.patchValue({
        isVopdRequired: (this.model.mainMember.isVopdRequired) ? this.model.mainMember.isVopdRequired : false
      });
    }
  }

  isFirstDay = (dtm: Date): boolean => {
    if (!dtm) { return false; }
    const date = dtm.getDate();
    const val = date / 1 === 1;
    return val;
  }

  onBirthDayChanged(dob: Date) {
    this.model.mainMember.person.dateOfBirth = dob;
  }

  onAgeChanged(age: number) {
    this.calculateAge();
  }

  cancelPolicyWithNote() {
    const rolePlayerPolicy = this.model.mainMember.policies[0];
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const dialog = this.personDialog.open(CancelPolicyReasonDialogComponent, this.getRemoveDialogConfig(rolePlayerPolicy));
    dialog.afterClosed().subscribe((data: PolicyManageReason) => {
      if (data) {
        rolePlayerPolicy.isDeleted = true;
        rolePlayerPolicy.modifiedDate = dtm;
        this.notifyRemovalNoteAdded(data.reason, data.effectiveDate);
      }
    });
  }

  getRemoveDialogConfig(rolePlayerPolicy: RolePlayerPolicy): MatDialogConfig {
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

  notifyRemovalNoteAdded(reason: number, effectiveDate: Date) {
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

  setPolicyInceptionDateParameters() {
    // tslint:disable-next-line: deprecation
    this.lookupService.getItemByKey('AllowNewPolicyBackDate').subscribe(
      setting => {
        this.canBackDate = setting.toLowerCase() === 'true';
        this.minDate = this.canBackDate ? new Date(-8640000000000000) : new Date();
      }
    );
  }

  checkIfWithinCoolingOffPeriod(effectiveDate: Date): boolean {
    const commencementDate = new Date(this.model.mainMember.policies[0].policyInceptionDate);
    const differenceInTime = effectiveDate.getTime() - commencementDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return (differenceInDays <= 31);
  }

  setMaintainCaseControlProperties() {
    if (this.model.mainMember && this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      if (this.model.mainMember.policies[0].policyLifeExtension) {
        this.caseCausesProductsDisabling = true;
      } else {
        this.caseCausesProductsDisabling = false;
      }
    } else {
      this.caseCausesProductsDisabling = false;
    }
  }

  setCancelCaseControlProperties() {
    this.formMainMember.get('policyInceptionDate').disable();
    this.caseCausesProductsDisabling = true;
  }

  calculateAge(): void {
    const date1 = this.model.mainMember.person.dateOfBirth;
    const date2 = this.formMainMember.get('policyInceptionDate').value;
    if (!date1 || !date2 || date1.toString().startsWith('0001')) {
      this.formMainMember.patchValue({ joinAge: null });
      this.formMainMember.get('joinAge').updateValueAndValidity();
      return;
    }
    const dob = new Date(date1);
    const joinDate = new Date(date2);
    let age = joinDate.getFullYear() - dob.getFullYear();
    const birthday = new Date(joinDate.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthday.getTime() > joinDate.getTime()) {
      age--;
    }
    this.formMainMember.patchValue({ joinAge: age });
    this.formMainMember.get('joinAge').updateValueAndValidity();

    if (this.mainMemberBenefitsComponent) {
      this.mainMemberBenefitsComponent.mainMemberAge = age;
      if (this.selectedProductOption) {
        this.mainMemberBenefitsComponent.getData(this.selectedProductOption);
      } else if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0 &&
        this.model.mainMember.policies[0].productOption) {
        this.mainMemberBenefitsComponent.getData(this.model.mainMember.policies[0].productOption);
      }
    }
  }

  onEditCancellation($event: any) {
    this.cancelPolicyWithNote();
  }

  captureReinstateEffectiveDate() {
    const rolePlayerPolicy = this.model.mainMember.policies[0];
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const dialog = this.personDialog.open(ReinstatePolicyDialogComponent, this.getRemoveDialogConfig(rolePlayerPolicy));
    dialog.afterClosed().subscribe((effectiveDate: Date) => {
      if (effectiveDate) {
        this.notifyReinstatementDateAdded(effectiveDate);
      }
    });
  }

  notifyReinstatementDateAdded(effectiveDate: Date) {
    this.model.mainMember.policies[0].lastReinstateDate = effectiveDate;
    this.formMainMember.patchValue({ reinstatementDate: this.getDateFormattedDate(this.model.mainMember.policies[0].lastReinstateDate) });
    this.model.mainMember.policies[0].policyStatus = PolicyStatusEnum.Reinstated;
  }

  onEditReinstate() {
    this.captureReinstateEffectiveDate();
  }

  enableStartDate(box: any): void {
    if (box.checked) {
      this.minDate = this.model.mainMember.policies[0].policyInceptionDate;
      this.formMainMember.get('policyInceptionDate').enable();
    } else {
      this.formMainMember.patchValue({
        policyInceptionDate: this.policySavedInceptionDate
      });
      this.formMainMember.get('policyInceptionDate').disable();
    }
  }

  triggerPolicyRefund() {
    this.model.mainMember.policies[0].eligibleForRefund = true;
    this.model.mainMember.policies[0].refundType = RefundTypeEnum.PolicyInception;
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
      this.formPolicyDetails.get(controlName).setErrors({ exists: true });
    } else {
      this.formPolicyDetails.get(controlName).setErrors(null);
    }
    this.formPolicyDetails.get(controlName).markAsTouched();
    this.formPolicyDetails.get(controlName).updateValueAndValidity();
  }
}
