import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from '../../shared/entities/case';
import { ProductOption } from '../../../product-manager/models/product-option';
import { Person } from '../../shared/entities/person';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Product } from '../../../product-manager/models/product';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { PersonDetailsComponent } from '../person-details/person-details.component';
import { GroupMemberDetailsComponent } from '../group-members-details/group-member-details.component';
import { PolicyProductOptionsComponent } from '../policy-product-options/policy-product-options.component';
import { PolicyBenefitsComponent } from '../policy-benefits/policy-benefits.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { RolePlayerRelation } from '../../shared/entities/roleplayer-relation';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RolePlayerPolicyService } from '../../shared/Services/role-player-policy.service';
import { ContinuePolicyDialogComponent } from '../continue-policy-dialog/continue-policy-dialog.component';
import { RolePlayerPersonDialogComponent } from '../role-player-person-dialog/role-player-person-dialog.component';
import { RolePlayerType } from '../../shared/entities/roleplayer-type';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { RolePlayerService } from '../../shared/Services/roleplayer.service';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

@Component({
  selector: 'app-main-member-continue-policy',
  templateUrl: './main-member-continue-policy.component.html',
  styleUrls: ['./main-member-continue-policy.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class MainMemberContinuePolicyComponent extends WizardDetailBaseComponent<Case> {

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
  displayedColumns = ['select', 'displayName', 'idNumber', 'age'];
  datasource: any = [];
  isWithinCoolingOfPeriod = false;
  caseCausesProductsDisabling = false;
  currentQuery: string;
  datasourceInsuredLives = new MatTableDataSource<RolePlayer>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  insuredLivesToContinuePolicy: RolePlayer[];
  rowCount: number;
  selectedNewMainMember: number[] = [];
  newMainMember: RolePlayer;
  continuationEffectiveDateCaptured = false;
  formPolicyDetails: UntypedFormGroup;

  @ViewChild(PersonDetailsComponent, { static: true }) personalDetailsComponent: PersonDetailsComponent;
  @ViewChild(GroupMemberDetailsComponent, { static: false }) groupMemberDetailsComponent: GroupMemberDetailsComponent;
  @ViewChild(PolicyProductOptionsComponent, { static: true }) policyProductOptionsComponent: PolicyProductOptionsComponent;
  @ViewChild(PolicyBenefitsComponent, { static: true }) mainMemberBenefitsComponent: PolicyBenefitsComponent;
  isLoading: boolean;
  reinstateEffectiveDateCaptured: any;
  rolePlayers: any;
  addPerson: any;
  rolePlayerPolicies: any;
  rolePlayerTypes: RolePlayerType[] = [];
  rolePlayerTypeIds: number[] = [35];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private personDialog: MatDialog,
    private readonly policyService: RolePlayerPolicyService,
    private readonly confirmservice: ConfirmationDialogsService,
    private dialogBox: MatDialog,
    private readonly rolePlayerService: RolePlayerService,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() {
    this.rolePlayerService.getRolePlayerTypeIsRelation().subscribe(
      data => {
        this.rolePlayerTypes = data.filter(rp => this.rolePlayerTypeIds.indexOf(rp.rolePlayerTypeId) >= 0);
      }
    );
  }

  createForm() {
    if (this.formMainMember) { return; }
    this.formMainMember = this.formBuilder.group({
      policyInceptionDate: [null],
      isVopdRequired: false,
      joinAge: new UntypedFormControl(''),
      mainMemberPolicyNumber: [''],
      continueDate: ['']
    });
    this.formPolicyDetails = this.formBuilder.group({
      mainMemberPolicyNumber: ['']
    });
  }

  populateForm() {
    if (this.model) {
      this.detailsModel = this.model;
      this.getInsuredLivesToContinuePolicy();
      this.isGroup = this.model.caseTypeId === CaseType.GroupNewBusiness;
      if (!this.isGroup) { this.patchNonGroupValues(); }

      this.mainMemberBenefitsComponent.populateForm(this.model);
      this.formPolicyDetails.patchValue({ mainMemberPolicyNumber: this.model.mainMember.policies[0].policyNumber });
      this.formPolicyDetails.get('mainMemberPolicyNumber').disable();
    }
    this.patchValues();
    this.formMainMember.patchValue({ joinAge: 0 });
    this.formMainMember.get('joinAge').disable();
    if (this.isDisabled) {
      if (this.policyProductOptionsComponent && this.policyProductOptionsComponent.formProducts) {
        this.policyProductOptionsComponent.formProducts.disable();
      }
      if (this.personalDetailsComponent && this.personalDetailsComponent.form) {
        this.personalDetailsComponent.form.disable();
      }
      this.formMainMember.disable();
      this.mainMemberBenefitsComponent.isWizard = false;
    }
    this.setContinuePolicyCaseControlProperties();
    this.formMainMember.get('continueDate').disable();
  }

  populateModel() {
    if (this.formMainMember.get('continueDate').value) {
      if (this.policyProductOptionsComponent.formProducts.valid && this.policyProductOptionsComponent.selectedProductOption && this.model.mainMember.policies) {
        this.model.mainMember.policies[0].productOption = this.policyProductOptionsComponent.selectedProductOption;
        this.model.mainMember.policies[0].productOption.product = this.policyProductOptionsComponent.selectedProductOption.product;
      }

      this.personalDetailsComponent.populateModel();
      this.policyProductOptionsComponent.populateModel();

      const person = new Person();
      if (this.personalDetailsComponent.form) {
        const personValues = this.personalDetailsComponent.form.value;
        person.dateOfBirth = this.personalDetailsComponent.form.get('dateOfBirth').value;
        person.dateOfDeath = this.personalDetailsComponent.form.get('dateOfDeath').value;
        person.deathCertificateNumber = this.personalDetailsComponent.form.get('deathCertificateNumber').value;
        person.firstName = this.personalDetailsComponent.form.get('firstName').value;
        person.surname = this.personalDetailsComponent.form.get('surname').value;
        person.idNumber = this.personalDetailsComponent.form.get('idNumber').value;
        person.idType = personValues.idType;
        person.isAlive = personValues.isAlive;
        person.isVopdVerified = personValues.isVopdVerified;
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
      this.model.mainMember.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
      this.model.mainMember.joinDate = this.formMainMember.get('policyInceptionDate').value;

      this.addMainMemberBeneficiary(this.model.mainMember);
      this.mainMemberBenefitsComponent.populateModel();
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
    if (!this.model.mainMember.policies[0].continuationEffectiveDate) {
      validationResult.errorMessages.push('Policy Continuation Effective Date is required');
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
    return validationResult;
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
      validationResult.errorMessages.push('ID / Passport is required');
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

  patchValues() {
    if (this.model.mainMember.policies) {
      this.formMainMember.patchValue({
        policyInceptionDate: this.getDateFormattedDate(this.model.mainMember.policies[0].policyInceptionDate),
        continueDate: this.getDateFormattedDate(this.model.mainMember.policies[0].continuationEffectiveDate)
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

  getContinuePolicyDialogConfig(rolePlayerPolicy: RolePlayerPolicy): MatDialogConfig {
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

  setContinuePolicyCaseControlProperties() {
    this.formMainMember.get('policyInceptionDate').disable();
    this.caseCausesProductsDisabling = false;
  }


  calculateAgeUsingDateOfBirth(dateOfBirth: string): number {
    const dob1 = dateOfBirth;
    const dob = new Date(dob1);
    if (dob) {
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      return calculatedAge;
    }
    return 0;
  }

  onSelectNewMainMember(event: any, rolePlayer: RolePlayer) {
    if (event.checked) {
      this.continuationEffectiveDateCaptured = false;
      this.selectedNewMainMember = [];
      this.selectedNewMainMember.push(rolePlayer.rolePlayerId);
      this.detailsModel.mainMember.person = rolePlayer.person;
      this.newMainMember = rolePlayer;
      this.isGroup = this.model.caseTypeId === CaseType.GroupNewBusiness;
      this.patchNonGroupValues();
      this.captureEffectiveDate();
    }
  }

  getInsuredLivesToContinuePolicy() {
    this.isLoading = true;
    this.policyService.getInsuredLivesToContinuePolicy(this.paginator.pageIndex + 1, 5, 'rolePlayerId', 'asc', this.model.mainMember.policies[0].policyId.toString())
      .subscribe(result => {
        const lives = result.data.filter(c => this.calculateAgeUsingDateOfBirth(c.person.dateOfBirth.toString()) > 18);
        this.insuredLivesToContinuePolicy = lives;
        this.datasourceInsuredLives.data = lives;
        this.rowCount = lives.length;
        this.isLoading = false;
      });
  }

  onAgeChanged(age: number) {
    this.calculateAge();
  }

  calculateAge(): void {
    const date1 = this.model.mainMember.person.dateOfBirth;
    const date2 = this.formMainMember.get('policyInceptionDate').value;
    if (!date1 || !date2 || date1.toString().startsWith('0001')) {
      this.formMainMember.patchValue({ joinAge: null });
      this.formMainMember.get('joinAge').updateValueAndValidity();
      return;
    }
    let dob = new Date(date1);
    dob = new Date(dob.toLocaleDateString());
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

  captureEffectiveDate() {
    const rolePlayerPolicy = this.model.mainMember.policies[0];
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const dialog = this.personDialog.open(ContinuePolicyDialogComponent, this.getContinuePolicyDialogConfig(rolePlayerPolicy));
    dialog.afterClosed().subscribe((effectiveDate: Date) => {
      if (effectiveDate) {
        this.notifyEffectiveDateAdded(effectiveDate);
        this.removeRolePlayerFromOldLocation(this.model.mainMember);
        this.continuationEffectiveDateCaptured = true;
      }
    });
  }

  notifyEffectiveDateAdded(effectiveDate: Date) {
    this.model.mainMember.policies[0].continuationEffectiveDate = effectiveDate;
    this.formMainMember.patchValue({ continueDate: this.getDateFormattedDate(this.model.mainMember.policies[0].continuationEffectiveDate) });
    this.model.mainMember.policies[0].policyStatus = PolicyStatusEnum.PendingContinuation;
  }

  removeRolePlayerFromOldLocation(rolePlayer: RolePlayer) {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);

    if (this.model.children) {
      let indexOfChildRolePlayer = -1;
      if (this.model.children.length > 0) {
        for (let i = 0; i < this.model.children.length; i++) {
          if ((this.model.children[i].person.rolePlayerId === rolePlayer.person.rolePlayerId)) {
            indexOfChildRolePlayer = i;
            break;
          }
        }
        if (indexOfChildRolePlayer > -1) {
          this.model.children[indexOfChildRolePlayer].isDeleted = true;
          this.model.children[indexOfChildRolePlayer].modifiedDate = dtm;
          this.model.children[indexOfChildRolePlayer].endDate = dtm;
        }
      }
    }
    if (this.model.spouse) {
      let indexOfSpouseRolePlayer = -1;
      if (this.model.spouse.length > -1) {
        for (let i = 0; i < this.model.spouse.length; i++) {
          if ((this.model.spouse[i].person.rolePlayerId === rolePlayer.person.rolePlayerId)) {
            indexOfSpouseRolePlayer = i;
            break;
          }
        }
        if (indexOfSpouseRolePlayer > -1) {
          this.model.spouse[indexOfSpouseRolePlayer].isDeleted = true;
          this.model.spouse[indexOfSpouseRolePlayer].modifiedDate = dtm;
          this.model.spouse[indexOfSpouseRolePlayer].endDate = dtm;
        }
      }
    }
    if (this.model.extendedFamily) {
      let indexOfExtendedRolePlayer = -1;
      if (this.model.extendedFamily.length > 0) {
        for (let i = 0; i < this.model.extendedFamily.length; i++) {
          if ((this.model.extendedFamily[i].person.rolePlayerId === rolePlayer.person.rolePlayerId)) {
            indexOfExtendedRolePlayer = i;
            break;
          }
        }
        if (indexOfExtendedRolePlayer > -1) {
          this.model.extendedFamily[indexOfExtendedRolePlayer].isDeleted = true;
          this.model.extendedFamily[indexOfExtendedRolePlayer].modifiedDate = dtm;
          this.model.extendedFamily[indexOfExtendedRolePlayer].endDate = dtm;
        }
      }
    }
  }

  addRelation(): void {
    const rolePlayer = new RolePlayer();
    rolePlayer.person = new Person();
    rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
    rolePlayer.person.isAlive = true;
    rolePlayer.person.manualBeneficiary = true;
    rolePlayer.isDeleted = false;
    const dialog = this.dialogBox.open(RolePlayerPersonDialogComponent, this.getDialogConfig(rolePlayer));
    dialog.afterClosed().subscribe((rp: RolePlayer) => {
      if (rp) {
        rp.isDeleted = rolePlayer.isDeleted;
        rp.person.isAlive = rolePlayer.person.isAlive;
        rp.person.manualBeneficiary = rolePlayer.person.manualBeneficiary;
        rp.rolePlayerIdentificationType = rolePlayer.rolePlayerIdentificationType;
        this.notifyGuardianAdded(rp);
      }
    });
  }

  getDialogConfig(rolePlayer: RolePlayer): MatDialogConfig {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const config = new MatDialogConfig();
    const canEdit = true;
    config.disableClose = true;
    config.data = {
      rolePlayer,
      rolePlayerTypes: this.rolePlayerTypes,
      canAddEdit: canEdit,
      showChildOptions: false,
      showJoinDate: false,
      joinDate: dtm
    };
    return config;
  }

  notifyGuardianAdded(rolePlayer: RolePlayer) {
    this.continuationEffectiveDateCaptured = false;
    this.detailsModel.mainMember.person = rolePlayer.person;
    this.newMainMember = rolePlayer;
    this.patchNonGroupValues();
    this.captureEffectiveDate();
  }

  onEditContinueDate() {
    this.captureEffectiveDate();
  }
}
