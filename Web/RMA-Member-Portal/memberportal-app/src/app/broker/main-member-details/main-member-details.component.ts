import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { AppEventsManager } from "src/app/shared-utilities/app-events-manager/app-events-manager";
import { MatDatePickerDateFormat, DatePickerDateFormat } from "src/app/shared-utilities/datepicker/dateformat";
import { ValidationResult } from "src/app/shared/components/wizard/shared/models/validation-result";
import { WizardDetailBaseComponent } from "src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component";
import { CaseType } from "src/app/shared/enums/case-type.enum";
import { CoverMemberTypeEnum } from "src/app/shared/enums/cover-member-type-enum";
import { PolicyStatus } from "src/app/shared/enums/policy-status.enum";
import { RefundTypeEnum } from "src/app/shared/enums/refund-type.enum";
import { RolePlayerTypeEnum } from "src/app/shared/enums/role-player-type-enum";
import { Case } from "src/app/shared/models/case";
import { Person } from "src/app/shared/models/person";
import { Product } from "src/app/shared/models/product";
import { ProductOption } from "src/app/shared/models/product-option";
import { RolePlayerPolicy } from "src/app/shared/models/role-player-policy";
import { RolePlayer } from "src/app/shared/models/roleplayer";
import { RolePlayerRelation } from "src/app/shared/models/roleplayer-relation";
import { LookupService } from "src/app/shared/services/lookup.service";
import { GroupMemberDetailsComponent } from "../group-members-details/group-member-details.component";
import { PersonDetailsComponent } from "../person-details/person-details.component";
import { PolicyBenefitsComponent } from "../policy-benefits/policy-benefits.component";
import { PolicyProductOptionsComponent } from "../policy-product-options/policy-product-options.component";
import { ReinstatePolicyDialogComponent } from "../reinstate-policy-dialog/reinstate-policy-dialog.component";


@Component({
  selector: 'main-member-details',
  templateUrl: './main-member-details.component.html',
  styleUrls: ['./main-member-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class MainMemberDetailsComponent extends WizardDetailBaseComponent<Case> implements AfterViewInit {

  person: Person;
  formMainMember: FormGroup;
  selectedProductOption: ProductOption;
  product: Product;
  detailsModel: Case;
  isGroup = false;
  formGroupMember: FormGroup;
  coverMemberType = CoverMemberTypeEnum.MainMember;
  isSaIdType = false;
  mainMemberAge: number;
  minDate: Date;
  canBackDate: boolean;
  isReadOnly: boolean;
  displayedColumns = ['cancellationReason', 'cancellationDate', 'action'];
  caseCausesProductsDisabling = false;
  policySavedInceptionDate: string;
  canChangeStartDate = false;

  roleplayerContext: RolePlayerTypeEnum[] = [RolePlayerTypeEnum.MainMemberSelf];

  @ViewChild(PersonDetailsComponent) personalDetailsComponent: PersonDetailsComponent;
  @ViewChild(GroupMemberDetailsComponent) groupMemberDetailsComponent: GroupMemberDetailsComponent;
  @ViewChild(PolicyProductOptionsComponent) policyProductOptionsComponent: PolicyProductOptionsComponent;
  @ViewChild('mainMemberBenefitsComponent') mainMemberBenefitsComponent: PolicyBenefitsComponent;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,
    private personDialog: MatDialog
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm();
    this.setPolicyInceptionDateParameters();
  }

  onLoadLookups() { }

  ngAfterViewInit() {
    this.populateMainMemberBenefitsComponent();
  }

  createForm() {
    if (this.formMainMember) { return; }
    this.formMainMember = this.formBuilder.group({
      changeInceptionDate: false,
      policyInceptionDate: [{ value: null, disabled: true }, [Validators.required]],
      joinAge: new FormControl(''),
      isVopdRequired: false,
      reinstatementDate: ['']
    });
  }

  populateForm() {
    this.populateMainMemberBenefitsComponent();
  }

  populateMainMemberBenefitsComponent() {
    if (this.mainMemberBenefitsComponent && this.model) {
      this.detailsModel = this.model;

      switch (this.model.caseTypeId) {
        case CaseType.IndividualNewBusiness:
          this.isGroup = false;
          break;
        case CaseType.GroupNewBusiness:
          this.isGroup = true;
          break;
      }


      if (!this.isGroup) { this.patchNonGroupValues(); }

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
      if (this.isDisabled) {
        if (this.policyProductOptionsComponent && this.policyProductOptionsComponent.formProducts) {
          this.policyProductOptionsComponent.formProducts.disable();
        }
        if (this.personalDetailsComponent && this.personalDetailsComponent.form) {
          this.personalDetailsComponent.form.disable();
        }
        this.formMainMember.disable();
        this.mainMemberBenefitsComponent.isWizard = false;
      } else {
        this.canChangeStartDate = this.checkChangeStartDate();
      }
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

  populateModel() {
    switch (this.model.caseTypeId) {
      case CaseType.IndividualNewBusiness:
        this.isGroup = false;
        this.model.caseTypeId = this.model.caseTypeId;
        break;
      case CaseType.GroupNewBusiness:
        this.isGroup = true;
        this.model.caseTypeId = this.model.caseTypeId;
        break;
    }

    if (this.policyProductOptionsComponent.formProducts.valid && this.policyProductOptionsComponent.selectedProductOption && this.model.mainMember.policies) {
      this.model.mainMember.policies[0].productOption = this.policyProductOptionsComponent.selectedProductOption;
      this.model.mainMember.policies[0].productOption.product = this.policyProductOptionsComponent.selectedProductOption.product;
    }

    if (!this.isGroup) {
      this.personalDetailsComponent.populateModel();
      this.policyProductOptionsComponent.populateModel();

      const person = new Person();
      if (this.personalDetailsComponent.form) {
        const personValues = this.personalDetailsComponent.form.value;
        person.dateOfBirth = this.personalDetailsComponent.form.get('dateOfBirth').value;
        person.dateOfDeath = this.personalDetailsComponent.form.get('dateOfDeath').value;
        person.deathCertificateNumber = this.personalDetailsComponent.form.get('deathCertificateNumber').value;
        person.firstName = this.personalDetailsComponent.form.controls['firstName'].value
        person.surname = this.personalDetailsComponent.form.controls['surname'].value
        person.idNumber = this.personalDetailsComponent.form.get('idNumber').value;
        person.idType = this.personalDetailsComponent.form.controls['idType'].value
        person.isAlive = this.personalDetailsComponent.form.controls['isAlive'].value
        person.isVopdVerified = this.personalDetailsComponent.form.controls['isVopdVerified'].value
        person.dateVopdVerified = this.personalDetailsComponent.form.get('dateVopdVerified').value;
        person.rolePlayerId = personValues.rolePlayerId;
        this.model.mainMember.rolePlayerId = (personValues.rolePlayerId > 0) ? personValues.rolePlayerId : this.model.mainMember.rolePlayerId;
        person.isDeleted = personValues.isDeleted;
        person.createdBy = personValues.createdBy;
        person.createdDate = personValues.createdDate;
      }

      this.model.mainMember.displayName = `${person.firstName} ${person.surname}`.trim();
      this.model.mainMember.productId = this.model.productId;
      this.model.mainMember.policies[0].policyInceptionDate = this.formMainMember.get('policyInceptionDate').value;
      this.model.mainMember.policies[0].productOption.startDate = this.formMainMember.get('policyInceptionDate').value;
      this.model.mainMember.isVopdRequired = this.formMainMember.get('isVopdRequired').value;
      this.model.mainMember.person = person;
      this.model.mainMember.joinDate = this.formMainMember.get('policyInceptionDate').value;
      this.model.mainMember.company = null;

      this.addMainMemberBeneficiary(this.model.mainMember);
      this.mainMemberBenefitsComponent.populateModel();
    } else {
      this.groupMemberDetailsComponent.setViewData(this.model);
      this.groupMemberDetailsComponent.populateModel();

      if (this.groupMemberDetailsComponent.form.valid) {
        const groupValues = this.groupMemberDetailsComponent.form.value;
        this.model.mainMember = groupValues;
      }

      this.model.mainMember.policies[0].policyInceptionDate = this.formMainMember.get('policyInceptionDate').value;
      this.model.mainMember.policies[0].productOption.startDate = this.formMainMember.get('policyInceptionDate').value;
      this.model.mainMember.policies[0].policyStatus = PolicyStatus.PendingFirstPremium;
    }

    if (this.canChangeStartDate) {
      const oldDate = new Date(this.policySavedInceptionDate);
      const newDate = new Date(this.model.mainMember.policies[0].policyInceptionDate);
      if (oldDate.getTime() !== newDate.getTime()) {
        this.model.mainMember.policies[0].policyStatus = PolicyStatus.PendingFirstPremium;
        this.triggerPolicyRefund();
      }
    }
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
    rolePlayer.person.manualBeneficiary = false;

    const relation = new RolePlayerRelation();
    relation.fromRolePlayerId = member.rolePlayerId ? member.rolePlayerId : 0;
    relation.toRolePlayerId = member.rolePlayerId ? member.rolePlayerId : 0;
    relation.rolePlayerTypeId = 10;
    rolePlayer.fromRolePlayers.push(relation);

    return rolePlayer;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

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
    return validationResult;
  }

  patchValues() {
    if (this.model && this.model.mainMember.policies) {
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

    if (this.model.mainMember.person.idType === null) {
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
        validationResult.errorMessages.push('Date Of Birth cannot be in the future');
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
    this.isSaIdType = isSaId;
    if (!isSaId) {
      this.formMainMember.patchValue({ isVopdRequired: false });
    }
  }

  patchNonGroupValues() {
    if (this.model && this.model.mainMember) {
      if (this.model.mainMember.person) {
        this.model.mainMember.person.isAlive = true;
      }
      this.model.mainMember.person.isAlive = true;
      this.formMainMember.patchValue({
        isVopdRequired: (this.model.mainMember.isVopdRequired) ? this.model.mainMember.isVopdRequired : false
      });
    }
  }

  isFirstDay = (d: Date): boolean => {
    const date = d.getDate();
    const val = date / 1 === 1;
    return val;
  }

  onBirthDayChanged(dob: Date) {
    this.model.mainMember.person.dateOfBirth = dob;
  }

  onAgeChanged(age: number) {
    this.calculateAge();
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
    this.formMainMember.get('policyInceptionDate').disable();
    this.caseCausesProductsDisabling = false;
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
    this.model.mainMember.policies[0].policyStatus = PolicyStatus.PendingReinstatement;
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
}
