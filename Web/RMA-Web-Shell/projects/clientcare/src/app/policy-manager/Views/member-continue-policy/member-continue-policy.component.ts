import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { ProductOption } from '../../../product-manager/models/product-option';
import { RolePlayerBenefit } from '../../shared/entities/role-player-benefit';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { Person } from '../../shared/entities/person';
import { Case } from '../../shared/entities/case';
import { BenefitModel } from '../../../product-manager/models/benefit-model';

@Component({
  selector: 'app-member-continue-policy',
  templateUrl: './member-continue-policy.component.html',
  styleUrls: ['./member-continue-policy.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class MemberContinuePolicyComponent extends WizardDetailBaseComponent<Case> {

  memberColumns = ['select', 'memberName', 'idNumber', 'dateOfBirth', 'age'];
  datasourceMembers = new MatTableDataSource<Person>();

  benefitColumns = ['select', 'age', 'benefitType', 'coverMemberType', 'benefitName', 'premium', 'amount'];
  datasourceBenefits = new MatTableDataSource<BenefitModel>();

  coverMemberType = CoverMemberTypeEnum.MainMember;
  selectedProductOption: ProductOption;
  productOptions: ProductOption[] = [];
  productOptionName: string;
  benefits: BenefitModel[] = [];
  idTypes: Lookup[] = [];
  minDate = new Date();
  form: UntypedFormGroup;
  caseModel: Case;
  joinAge: number;

  loadingProductOptions = false;
  loadingBenefits = false;

  isFirstDay = (d: Date): boolean => {
    if (!d) { return false; }
    const date = d.getDate();
    const val = date / 1 === 1;
    return val;
  }

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    // tslint:disable-next-line: deprecation
    this.lookupService.getIdTypes().subscribe({
      next: (data: Lookup[]) => {
        this.idTypes = data;
      }
    });
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      policyNumber: [''],
      idType: [''],
      idNumber: [''],
      firstName: [''],
      surname: [''],
      dateOfBirth: [''],
      age: [''],
      productName: [''],
      productOptionId: [''],
      policyInceptionDate: [''],
      policyJoinAge: [''],
      continueEffectiveDate: ['', [Validators.required]]
    });
  }

  populateForm(): void {
    if (this.model) {
      this.caseModel = this.model;

      this.populateMembers();
      this.populateProductOptions(this.model.productId);

      this.minDate = new Date(this.model.mainMember.policies[0].policyInceptionDate);
      const defaultContinueDate = this.getFirstOfNextMonth();

      this.form.patchValue({
        policyNumber: this.model.mainMember.policies[0].policyNumber,
        productName: this.model.mainMember.policies[0].productOption.product.name,
        productOptionId: this.model.mainMember.policies[0].productOption.id,
        policyInceptionDate: this.model.mainMember.policies[0].policyInceptionDate,
        continueEffectiveDate: this.model.newMainMember ? this.model.newMainMember.policy.policyInceptionDate : defaultContinueDate
      });

      const person = this.model.newMainMember ? this.model.newMainMember.person : this.model.mainMember.person;
      this.patchMainMember(person);
      this.updateAge();
      this.updateJoinAge();

      this.form.get('policyNumber').disable();
      this.form.get('productName').disable();
      this.form.get('idType').disable();
      this.form.get('idNumber').disable();
      this.form.get('firstName').disable();
      this.form.get('surname').disable();
      this.form.get('dateOfBirth').disable();
      this.form.get('age').disable();
      this.form.get('policyInceptionDate').disable();
      this.form.get('policyJoinAge').disable();
    }
  }

  populateModel(): void {
    if (this.model.newMainMember) {
      const date = this.form.getRawValue().continueEffectiveDate;
      this.model.newMainMember.policy.policyStatus = PolicyStatusEnum.Continued;
      this.model.newMainMember.policy.continuationEffectiveDate = date;
      this.model.newMainMember.policies = [this.model.newMainMember.policy];
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model.newMainMember) {
      validationResult.errorMessages.push('Please select a new main member');
      validationResult.errors++;
    } else {
      if (!this.model.newMainMember.policy.policyInceptionDate) {
        validationResult.errorMessages.push('Please select a policy continuation date');
        validationResult.errors++;
      }
      if (this.model.newMainMember.benefits) {
        if (this.model.newMainMember.benefits.length === 0) {
          validationResult.errorMessages.push('Please select a main member benefit');
          validationResult.errors++;
        }
      } else {
        validationResult.errorMessages.push('Please select a main member benefit');
        validationResult.errors++;
      }
    }
    return validationResult;
  }

  private getFirstOfNextMonth(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setMonth(today.getMonth() + 1);
    today.setDate(1);
    return today;
  }

  private populateMembers(): void {
    const members: Person[] = [];
    const list = this.getAllMembers();
    for (const member of list) {
      if (member.rolePlayerId > 0 && member.person && member.person.age >= 18) {
        members.push(member.person);
      }
    }
    this.datasourceMembers.data = members;
  }

  private populateProductOptions(productId: number): void {
    if (this.productOptions.length > 0) { return; }
    this.loadingProductOptions = true;
    // tslint:disable-next-line: deprecation
    this.productOptionService.getProductOptionNamesByProductId(productId).subscribe({
      next: (data: ProductOption[]) => {
        this.productOptions = data.sort(this.compareProductOption);
        this.productOptionSelected(this.model.mainMember.policies[0].productOption);
      },
      complete: () => {
        this.loadingProductOptions = false;
      }
    });
  }

  compareProductOption(a: ProductOption, b: ProductOption): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  reloadBenefits(event: any): void {
    const productOptionId = event.value;
    const productOption = this.productOptions.find(po => po.id === productOptionId);
    this.productOptionName = productOption.name;
    if (productOption) {
      this.productOptionSelected(productOption);
    }
  }

  private productOptionSelected(productOption: ProductOption): void {
    if (!productOption) { return; }
    this.selectedProductOption = productOption;
    this.populateBenefits(productOption);
    this.form.patchValue({ productOptionId: productOption.id });
  }

  private populateBenefits(productOption: ProductOption): void {
    this.benefits = [];
    if (!productOption) { return; }
    this.loadingBenefits = true;
    // tslint:disable-next-line: deprecation
    this.productOptionService.getBenefitsForProductOptionAndCoverType(productOption.id, CoverMemberTypeEnum.MainMember).subscribe({
      next: (data: BenefitModel[]) => {
        if (data && data.length > 0) {
          const joinAge = this.form.getRawValue().policyJoinAge;
          data.forEach(
            b => {
              if (joinAge >= b.minimumAge && joinAge <= b.maximumAge) {
                this.benefits.push(b);
              }
            }
          );
        }

        this.datasourceBenefits.data = this.benefits;
      },
      complete: () => {
        this.loadingBenefits = false;
      }
    });
  }

  private getAgeValue(rules: RuleItem[], age: number): number {
    if (rules && rules.length > 0) {
      let rule = rules[0].ruleConfiguration;
      while (rule.indexOf('\'') >= 0) { rule = rule.replace('\'', '"'); }
      const value = JSON.parse(rule);
      const item = Array.isArray(value) ? value[0] : value;
      age = item.fieldValue ? item.fieldValue : item.value;
    }
    return age;
  }

  private getAllMembers(): RolePlayer[] {
    let list: RolePlayer[] = this.model.spouse;
    list = list.concat(this.model.children);
    list = list.concat(this.model.extendedFamily);
    return list;
  }

  private updateJoinAge(): void {
    const policyInceptionDate = this.form.getRawValue().continueEffectiveDate;
    const policyJoinAge = this.calculateAge(policyInceptionDate);
    this.form.patchValue({ policyJoinAge });
    this.joinAge = policyJoinAge;
  }

  private updateAge(): void {
    const today = new Date();
    const age = this.calculateAge(today);
    this.form.patchValue({ age });
  }

  private calculateAge(date: Date): number {
    let age = 0;
    if (this.form) {
      const dateOfBirth = this.form.getRawValue().dateOfBirth;
      if (dateOfBirth) {
        const calcDate = new Date(date);
        calcDate.setHours(0, 0, 0, 0);
        const dob = new Date(dateOfBirth);
        age = calcDate.getFullYear() - dob.getFullYear();
        const birthday = new Date(calcDate.getFullYear(), dob.getMonth(), dob.getDate());
        if (birthday.getTime() > calcDate.getTime()) {
          age--;
        }
      }
    }
    return age;
  }

  isMainMember(rolePlayerId: number, idNumber: string): boolean {
    let match = false;
    if (this.model.newMainMember) {
      if (rolePlayerId > 0 && this.model.newMainMember.rolePlayerId > 0) {
        match = rolePlayerId === this.model.newMainMember.rolePlayerId;
      } else {
        match = idNumber === this.model.newMainMember.person?.idNumber;
      }      
    }
    return match;
  }

  isSelectedBenefit(benefitId: number): boolean {
    if (this.model.newMainMember && this.model.newMainMember.benefits && this.model.newMainMember.benefits.length > 0) {
      const benefit = this.model.newMainMember.benefits[0];
      if (benefit) {
        return benefit.id === benefitId;
      }
    }
    return false;
  }

  changeContinueDate(): void {
    const continueEffectiveDate = new Date(this.form.getRawValue().continueEffectiveDate);
    this.form.patchValue({ continueEffectiveDate });
    this.updateJoinAge();
    this.productOptionSelected(this.selectedProductOption);
  }

  selectNewMainMember(event: any, person: Person): void {
    // Mark the person as selected
    person.isSelected = event.checked;
    // Mark all other members as not selected
    for (let member of this.datasourceMembers.data) {
      if (member !== person) {
        member.isSelected = false;
      }
    }

    if (event.checked) {
      const newMainMember = this.findMember(person.rolePlayerId, person.idNumber);
      this.model.newMainMember = newMainMember;
      this.model.newMainMember.policy.policyInceptionDate = this.form.getRawValue().continueEffectiveDate;
      this.flagMemberAsDeleted(person.rolePlayerId, person?.idNumber, true);
    } else {
      this.flagMemberAsDeleted(this.model.newMainMember.rolePlayerId, this.model.newMainMember.person.idNumber, false);
      this.model.newMainMember = null;
    }    
    this.patchMainMember(this.model.newMainMember ? this.model.newMainMember.person : this.model.mainMember.person);
    this.updateAge();
    this.updateJoinAge();
    this.productOptionSelected(this.selectedProductOption);
  }

  private flagMemberAsDeleted(rolePlayerId: number, idNumber: string, isDeleted: boolean): void {
    this.flagMemberDeleted(this.model.spouse, rolePlayerId, idNumber, isDeleted);
    this.flagMemberDeleted(this.model.children, rolePlayerId, idNumber, isDeleted);
    this.flagMemberDeleted(this.model.extendedFamily, rolePlayerId, idNumber, isDeleted);
  }

  private flagMemberDeleted(list: RolePlayer[], rolePlayerId: number, idNumber: string, isDeleted: boolean): void {
    if (!list) { return; }
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < list.length; i++) {
      if ((rolePlayerId > 0 && list[i].rolePlayerId === rolePlayerId) || (rolePlayerId === 0 && list[i].person?.idNumber === idNumber)) {
        list[i].isDeleted = isDeleted;
        if (list[i].person) {
          list[i].person.isDeleted = isDeleted;
          if (isDeleted) {
            list[i].person.isBeneficiary = false;
          }
        }
      } else if (isDeleted) {
        list[i].isDeleted = false;
        if (list[i].person) {
          list[i].person.isDeleted = false;
          list[i].person.isBeneficiary = false;
        }
      }
    }
  }

  private patchMainMember(person: Person): void {
    if (!person) { return; }
    this.form.patchValue({
      idType: person.idType,
      idNumber: person.idNumber || person.passportNumber,
      firstName: person.firstName,
      surname: person.surname,
      dateOfBirth: person.dateOfBirth,
      age: person.age,
    });
  }

  private findMember(rolePlayerId: number, idNumber: string): RolePlayer {
    const list = this.getAllMembers();
    return this.findRolePlayer(rolePlayerId, idNumber, list);
  }

  private findRolePlayer(rolePlayerId: number, idNumber: string, members: RolePlayer[]): RolePlayer {
    const rolePlayer = members.find(r => rolePlayerId > 0 ? r.rolePlayerId === rolePlayerId : r.person?.idNumber === idNumber);

    if (!rolePlayer) { return null; }

    const player = new RolePlayer();
    player.rolePlayerId = rolePlayerId;
    player.displayName = rolePlayer.displayName;
    player.tellNumber = rolePlayer.tellNumber;
    player.cellNumber = rolePlayer.cellNumber;
    player.emailAddress = rolePlayer.emailAddress;
    player.policies = null;
    player.benefits = [];
    player.preferredCommunicationTypeId = rolePlayer.preferredCommunicationTypeId;
    player.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
    player.isDeleted = false;

    const values = this.form.getRawValue();
    player.policy = new RolePlayerPolicy();
    player.policy.policyInceptionDate = values.continueEffectiveDate
      ? values.continueEffectiveDate
      : values.policyInceptionDate;

    player.person = new Person();
    player.person.rolePlayerId = rolePlayerId;
    player.person.firstName = rolePlayer.person.firstName;
    player.person.surname = rolePlayer.person.surname;
    player.person.idType = rolePlayer.person.idType;
    player.person.idNumber = rolePlayer.person.idNumber;
    player.person.passportNumber = rolePlayer.person.passportNumber;
    player.person.dateOfBirth = rolePlayer.person.dateOfBirth;
    player.person.age = rolePlayer.person.age;
    player.person.isAlive = true;
    player.person.isDeleted = false;

    return player;
  }

  getBenefitType(id: number): string {
    return BenefitTypeEnum[id];
  }

  getCoverMemberType(id: number): string {
    return CoverMemberTypeEnum[id].replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  selectedBenefit(event: any, benefit: BenefitModel): void {
    if (this.model.newMainMember ) {
      this.model.newMainMember.benefits = [];
      if (event.checked) {
        const rpb = new RolePlayerBenefit();
        rpb.selected = event.checked;
        rpb.rolePlayerName = this.model.newMainMember.displayName;
        rpb.age = this.joinAge;
        rpb.ageIsYears = true;
        rpb.id = benefit.benefitId;
        rpb.benefitType = benefit.benefitType;
        rpb.coverMemberType = benefit.coverMemberType;
        rpb.name = benefit.benefitName;
        rpb.code = benefit.benefitCode;
        rpb.benefitBaseRateLatest = benefit.baseRate;
        rpb.benefitRateLatest = benefit.benefitAmount;      
        this.model.newMainMember.benefits.push(rpb);
      }
    } else {
      benefit.selected = false;
    }
  }
}
