import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Benefit } from '../../../product-manager/models/benefit';
import { RoleplayerGroupPolicy } from '../../shared/entities/role-player-group-policy';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { Person } from '../../shared/entities/person';
import { IdTypeEnum } from '../../shared/enums/idTypeEnum';
import { RolePlayer } from '../../shared/entities/roleplayer';

@Component({
  selector: 'app-group-policy-main-member',
  templateUrl: './group-policy-main-member.component.html',
  styleUrls: ['./group-policy-main-member.component.css'],
  providers: [
    [DatePipe],
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class GroupPolicyMainMemberComponent extends WizardDetailBaseComponent<RoleplayerGroupPolicy> {

  isLoading = true;
  idTypes: Lookup[] = [];
  benefits: Benefit[] = [];
  filteredBenefits: Benefit[] = [];
  minDate = new Date();
  maxDate: Date;
  joinAge = 18;
  age = 18;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.setMaxDateOfBirth();
  }

  isFirstDayOfMonth = (d: Date): boolean => {
    const date = d.getDate();
    const val = date === 1;
    return val;
  }

  setMaxDateOfBirth(): void {
    this.maxDate = new Date();
    this.maxDate.setHours(0, 0, 0, 0);
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  onLoadLookups() {
    this.lookupService.getIdTypes().subscribe(
      data => {
        this.idTypes = data;
      }
    );
  }

  createForm() {
    this.form = this.formBuilder.group({
      rolePlayerId: [''],
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      idTypeId: ['', [Validators.required, Validators.min(1)]],
      idNumber: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      age: [''],
      policyJoinDate: ['', [Validators.required]],
      joinAge: ['', [Validators.required, Validators.min(18)]],
      benefitId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  populateForm() {
    this.isLoading = true;
    if (this.benefits && this.benefits.length > 0) {
      this.loadMainMember(this.benefits);
    } else {
      this.productOptionService.getBenefitsForOption(this.model.productOptionId).subscribe(
        data => {
          this.loadMainMember(data);
        }
      );
    }
  }

  private loadMainMember(benefits: Benefit[]) {
    this.benefits = benefits.filter(s => s.coverMemberType === 1);
    const mainMember = this.model.mainMember;
    const person = mainMember.person;

    let dobIsAssigned = this.dobAssigned(person);
    const benefitAssigned = this.benefitAssigned(mainMember);

    this.form.patchValue({
      rolePlayerId: person.rolePlayerId ? person.rolePlayerId : 0,
      firstName: person.firstName,
      surname: person.surname,
      idTypeId: person.idType,
      idNumber: person.idNumber,
      dateOfBirth: dobIsAssigned ? person.dateOfBirth : this.maxDate,
      age: dobIsAssigned ? person.age : 18,
      policyJoinDate: new Date(mainMember.joinDate),
      joinAge: this.joinAge,
      benefitId: benefitAssigned ? mainMember.policies[0].benefits[0].id : null
    });

    this.form.get('idTypeId').disable();
    if (person.idType === IdTypeEnum.SA_ID_Document) {
      if (!dobIsAssigned) {
        const dob = this.getDobFromIdNumber(person.idNumber);
        if (dob) {
          this.form.patchValue({ dateOfBirth: dob });
          dobIsAssigned = true;
        }
      }
      this.form.get('dateOfBirth').disable();
    }
    if (dobIsAssigned) {
      this.calculateAge();
      this.age = this.form.get('age').value;
    }
    if (mainMember.joinDate) {
      this.calculateJoinAge();
      this.joinAge = this.form.get('joinAge').value;
    }
    this.form.get('idNumber').disable();
    this.minDate = this.model.policyInceptionDate;

    this.isLoading = false;
  }

  private getDobFromIdNumber(idNumber: string): Date {
    try {
      const year = `20${idNumber.substr(0, 2)}`;
      const month = idNumber.substr(2, 2);
      const day = idNumber.substr(4, 2);
      const dob = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob.getTime() > today.getTime()) {
        dob.setFullYear(dob.getFullYear() - 100);
      }
      return dob;
    } catch {
      return null;
    }
  }

  private benefitAssigned(member: RolePlayer): boolean {
    if (!member) { return false; }
    if (!member.policies) { return false; }
    if (member.policies.length === 0) { return false; }
    if (!member.policies[0].benefits) { return false; }
    if (member.policies[0].benefits.length === 0) { return false; }
    if (member.policies[0].benefits[0].id === 0) { return false; }
    return true;
  }

  private dobAssigned(person: Person): boolean {
    if (!person) { return false; }
    if (!person.dateOfBirth) { return false; }
    const date = new Date(person.dateOfBirth);
    return date.getFullYear() > 1800;
  }

  populateModel() {
    const value = this.form.getRawValue();
    this.model.mainMember.rolePlayerId = value.rolePlayerId;
    this.model.mainMember.displayName = `${value.firstName} ${value.surname}`;
    this.model.mainMember.joinDate = new Date(value.policyJoinDate);
    this.model.mainMember.policies[0].benefits[0] = this.getSelectedBenefit(value.benefitId);
    this.model.mainMember.person.rolePlayerId = value.rolePlayerId;
    this.model.mainMember.person.firstName = value.firstName;
    this.model.mainMember.person.surname = value.surname;
    this.model.mainMember.person.idType = value.idTypeId;
    this.model.mainMember.person.idNumber = value.idNumber;
    this.model.mainMember.person.dateOfBirth = value.dateOfBirth;
    this.model.mainMember.person.age = value.age;
  }

  getSelectedBenefit(benefitId: number): Benefit {
    const benefit = this.benefits.find(s => s.id === benefitId);
    return benefit;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  calculateDateOfBirth(): void {
    const value = this.form.getRawValue();
    if (value.idTypeId === IdTypeEnum.SA_ID_Document) {
      const idNumber = value.idNumber as string;
      if (!isNaN(idNumber as any) && idNumber.length >= 6) {
        const dob = this.getDobFromIdNumber(idNumber);
        if (dob) {
          this.form.patchValue({ dateOfBirth: dob });
          this.calculateAge();
        }
      } else {
        this.form.patchValue({
          dateOfBirth: null,
          age: null
        });
      }
    }
  }

  calculateAge(): void {
    let age = 0;
    const dateOfBirth = new Date(this.form.getRawValue().dateOfBirth);
    if (dateOfBirth) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dob = new Date(dateOfBirth);
      age = today.getFullYear() - dob.getFullYear();
      const birthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (birthday.getTime() > today.getTime()) {
        age--;
      }
    }
    this.age = age;
    this.form.patchValue({ age });
    this.form.get('age').updateValueAndValidity();
  }

  calculateJoinAge(): void {
    const value = this.form.getRawValue();
    let joinDate: Date = value.policyJoinDate;
    let dateOfBirth: Date = value.dateOfBirth;

    if (!joinDate) {
      this.form.patchValue({ joinAge: null });
      this.joinAge = null;
      return;
    }

    if (!dateOfBirth) {
      this.form.patchValue({ age: null });
      this.age = null;
      return;
    }

    joinDate = new Date(joinDate);
    joinDate.setHours(0, 0, 0, 0);
    dateOfBirth = new Date(dateOfBirth);
    dateOfBirth.setHours(0, 0, 0, 0);

    let age = joinDate.getFullYear() - dateOfBirth.getFullYear();
    const birthday = new Date(joinDate.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate());
    if (birthday.getTime() > joinDate.getTime()) {
      age--;
    }

    this.joinAge = age;
    this.form.patchValue({ joinAge: age });
    this.form.get('joinAge').updateValueAndValidity();
    this.filterBenefits(age);
  }

  filterBenefits(age: number): void {
    this.filteredBenefits = [];
    for (const benefit of this.benefits) {
      if (benefit.ruleItems) {
        if (this.matchesAgeRange(benefit, age)) {
          this.filteredBenefits.push(benefit);
        }
      }
    }
  }

  private matchesAgeRange(benefit: Benefit, age: number): boolean {
    if (!benefit.ruleItems) { return true; }
    const maxAge = this.getRuleAge(benefit.ruleItems, 11, 200);
    const minAge = this.getRuleAge(benefit.ruleItems, 12, 0);
    return age >= minAge && age <= maxAge;
  }

  private getRuleAge(ruleItems: RuleItem[], ruleId: number, defaultAge: number): number {
    const rule = ruleItems.find(s => s.ruleId === ruleId);
    if (!rule) { return defaultAge; }
    const configuration = rule.ruleConfiguration.replace(/'/g, '"');
    const ruleData = JSON.parse(configuration);
    return ruleData[0].fieldValue as number;
  }
}
