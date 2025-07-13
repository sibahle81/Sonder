import { Component } from '@angular/core';
import { ClaimRolePlayerBankingModel } from '../../../shared/entities/claim-beneficiary-banking-model';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { ValidateSAIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number-sa.validator';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerType } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-type';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';


@Component({
  selector: 'claim-tracer',
  templateUrl: './claim-tracer.component.html',
  styleUrls: ['./claim-tracer.component.css']
})
export class ClaimTracerComponent extends WizardDetailBaseComponent<RolePlayer> {

  form: UntypedFormGroup;
  minDate: Date;
  day = new Date().getDay().toString();
  year = (new Date().getFullYear() - 1).toString();
  rolePlayer: RolePlayer;
  rolePlayerTypes: RolePlayerType[] = [];
  idTypes: Lookup[] = [];
  communicationTypes: Lookup[] = [];
  isLoading = false;
  dateOfBirth: Date;
  relationType: RolePlayerType;
  isOlderChild = false;
  searchPerson = false;
  isAgeInMonths: boolean;
  isGroupRoleplayer: boolean;
  maxDate = new Date();
  rolePlayerTypeIds = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly roleplayerService: RolePlayerService) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {
    if (this.form) { return; }
    this.minDate = new Date(`${this.year}-01-${this.day}`);

    this.form = this.formBuilder.group({
      // rolePlayer fields
      rolePlayerId: [''],
      tellNumber: ['', [ValidatePhoneNumber]],
      cellNumber: ['', [ValidatePhoneNumber]],
      emailAddress: ['', [ValidateEmail]],
      preferredCommunicationTypeId: ['', [Validators.min(1)]],
      isNatural: ['', [Validators.required]],
      // person fields
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      idType: ['', [Validators.required, Validators.min(1)]],
      idNumber: ['', [Validators.required, ValidateSAIdNumber]],
      dateOfBirth: [new Date(`${this.year}-01-${this.day}`), [Validators.required]],
      age: [''],
      isAlive: [''],
      isStudying: [''],
      isDisabled: [''],
      dateOfDeath: [''],
      deathCertificateNumber: [''],
      isVopdVerified: [''],
      dateVopdVerified: [''],
      rolePlayerTypeId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onLoadLookups(): void {
    this.loadCommunicationTypes();
  }

  populateModel(): void {
    const value = this.form.value;

    this.dateOfBirth = new Date(this.form.get('dateOfBirth').value);

    const year = this.dateOfBirth.getFullYear();
    const month = this.dateOfBirth.getMonth();
    const day = this.dateOfBirth.getDate();

    const birthDate = new Date(year, month, day);
    this.dateOfBirth = new Date(birthDate + 'Z');

    this.model.tellNumber = value.tellNumber;
    this.model.cellNumber = value.cellNumber;
    this.model.emailAddress = value.emailAddress;
    this.model.preferredCommunicationTypeId = value.preferredCommunicationTypeId;
    this.model.rolePlayerIdentificationType = value.isNatural ? RolePlayerIdentificationTypeEnum.Person : RolePlayerIdentificationTypeEnum.Company;
    this.model.person.firstName = value.firstName;
    this.model.person.surname = value.surname;
    this.model.person.idType = value.idType;
    this.model.person.idNumber = value.idNumber;
    this.model.person.dateOfBirth = this.dateOfBirth;
    this.model.person.isAlive = true;
    this.model.person.isStudying = false;
    this.model.person.isDisabled = false;
    this.model.person.dateOfDeath = new Date();
    this.model.person.deathCertificateNumber = '';
    this.model.person.isVopdVerified = true;
    this.model.person.dateVopdVerified = new Date();
    this.model.keyRoleTypeId = value.rolePlayerTypeId;

  }

  populateForm(): void {
    this.getRolePlayerTypes();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  getRolePlayerTypes() {
    this.isLoading = true;
    this.rolePlayerService.getRolePlayerTypes(this.rolePlayerTypeIds).subscribe(
      data => {
        this.rolePlayerTypes = data;
        this.loadIdTypes();
        this.relationType = data.find(a => a.name == 'Beneficiary');
        this.isLoading = false;

        const person = this.model;
        this.form.patchValue({
          rolePlayerId: person.rolePlayerId,
          // rolePlayer fields
          tellNumber: person.tellNumber,
          cellNumber: person.cellNumber,
          emailAddress: person.emailAddress,
          preferredCommunicationTypeId: person.preferredCommunicationTypeId != null ? person.preferredCommunicationTypeId : 1,
          isNatural: person.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person,
          // person fields
          firstName: person ? person.person.firstName : '',
          surname: person ? person.person.surname : '',
          idType: person ? (person.person.idType ? person.person.idType : 1) : 1,
          idNumber: person ? person.person.idNumber : '',
          dateOfBirth: person ? person.person.dateOfBirth : null,
          age: 0,
          isAlive: person ? person.person.isAlive : true,
          isStudying: person ? person.person.isStudying : false,
          isDisabled: person ? person.person.isDisabled : false,
          dateOfDeath: person ? person.person.dateOfDeath : null,
          deathCertificateNumber: person ? person.person.deathCertificateNumber : '',
          isVopdVerified: person ? person.person.isVopdVerified : false,
          dateVopdVerified: person ? person.person.dateVopdVerified : null,
          rolePlayerTypeId: this.relationType.rolePlayerTypeId
        });

        this.dateOfBirth = new Date(person.person.dateOfBirth + 'Z');
        this.setCommunicationValidators({ value: this.model.preferredCommunicationTypeId });

        if (this.form.get('idType').value === 1) {
          this.form.get('dateOfBirth').disable();
        }
        if (this.form.get('idNumber').value) {
          this.calculateBirthday(this.form.get('idNumber').value);
          this.calculateAge();
        }
        this.form.get('age').disable();
        this.form.get('idNumber').clearValidators();
      }
    );
  }

  loadIdTypes(): void {
    this.isLoading = true;
    this.lookupService.getIdTypes().subscribe(data => {
      this.idTypes = data;
      this.filterIdentificationTypesByRolePlayer();
      this.isLoading = false;
    });
  }

  loadCommunicationTypes(): void {
    this.isLoading = true;
    this.lookupService.getCommunicationTypes().subscribe(
      data => this.communicationTypes = data
    );
    this.isLoading = false;
  }

  filterIdentificationTypesByRolePlayer() {
    if (this.rolePlayerTypes.length > 0) {
      this.isGroupRoleplayer = this.rolePlayerTypes[0].rolePlayerTypeId === 4 ? true : false;

      if (!this.isGroupRoleplayer) {
        this.idTypes = this.idTypes.filter(i => i.id !== 0 && i.id !== 3);
      } else {
        this.idTypes = this.idTypes.filter(i => i.id === 0 || i.id === 3);
      }
      this.isLoading = false;
    }
  }

  get isAlive(): boolean {
    if (!this.form) { return true; }
    return this.form.value.isAlive;
  }

  setCommunicationValidators(event: any) {
    this.form.get('cellNumber').setValidators([ValidatePhoneNumber]);
    this.form.get('tellNumber').setValidators([ValidatePhoneNumber]);
    this.form.get('emailAddress').setValidators([ValidateEmail]);
    switch (event.value) {
      case 1: // Email
        this.form.get('emailAddress').setValidators([Validators.required, ValidateEmail]);
        break;
      case 2: // Phone
        this.form.get('cellNumber').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
      case 3: // SMS
        this.form.get('cellNumber').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
    }
    this.form.get('cellNumber').updateValueAndValidity();
    this.form.get('tellNumber').updateValueAndValidity();
    this.form.get('emailAddress').updateValueAndValidity();
  }

  checkPersonExists(idNumber: string) {
    this.isLoading = true;
    this.searchPerson = true;
    const idType = this.form.get('idType').value;
    this.roleplayerService.getPersonRolePlayerByIdNumber(idNumber, idType).subscribe(result => {
      if (result.length === 0) {
        this.calculateBirthday(idNumber);
        this.calculateAge();
      } else {
        this.rolePlayer = result[0];
        this.populateForm();
        this.form.get('idNumber').setErrors({ idAlreadyExists: true });
        this.calculateBirthday(idNumber);
        this.calculateAge();
      }
      this.searchPerson = false;
    });
    this.isLoading = false;
  }

  calculateBirthday(idNumber: string): void {
    const idType = this.form.get('idType').value;
    if (idType !== 1) {
      return;
    }
    if (idNumber.length >= 6) {
      const today = new Date();
      let year = +idNumber.substr(0, 2) + 2000;
      if (year > today.getFullYear()) { year -= 100; }
      const month = +idNumber.substr(2, 2) - 1;
      const day = +idNumber.substr(4, 2);
      const birthDate = new Date(year, month, day);
      this.form.patchValue({ dateOfBirth: new Date(birthDate + 'Z') });
      this.form.get('dateOfBirth').updateValueAndValidity();
    }
  }

  calculateAge(): void {
    this.isAgeInMonths = false;
    let age = 0;
    if (this.form) {
      const dateOfBirth = new Date(this.form.getRawValue().dateOfBirth + 'Z');
      if (dateOfBirth) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dob = new Date(dateOfBirth);
        age = today.getFullYear() - dob.getFullYear();
        const birthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (birthday.getTime() > today.getTime()) {
          age--;
        }
        if (age === 0) {
          this.isAgeInMonths = true;
          age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          age = age * 12 + m;
        }
      }
    }
    this.isOlderChild = age >= 21 && age <= 24;
    this.form.patchValue({ age });
    this.validateDOBNotInFuture();
  }

  validateDOBNotInFuture(): void {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm).getTime();
    const dateOfBirth = new Date(this.form.getRawValue().dateOfBirth + 'Z');
    const dob = new Date(dateOfBirth).getTime();
    if (dob > today) {
      this.form.get('dateOfBirth').markAsTouched();
      this.form.get('dateOfBirth').setErrors({ dateOfBirthInThefuture: true });
    }
  }

  changeIdType(event: any): void {
    this.form.get('idNumber').clearValidators();
    const idType = this.form.get('idType').value;
    if (idType === 1) {
      this.form.get('idNumber').setValidators([ValidateSAIdNumber, Validators.required]);
      this.form.get('dateOfBirth').disable();
    } else {
      this.form.get('idNumber').setValidators([Validators.required, Validators.minLength(3)]);
      this.form.get('dateOfBirth').enable();

      this.form.patchValue({
        dateOfBirth: ''
      });
    }
    this.form.get('idNumber').updateValueAndValidity();
  }

  // === HTML METHODS === //

  // Method in Html Date of Birth
  updateAge(event: any) {
    this.calculateAge();
  }

  // Method in Html IdNumber
  calculateDateOfBirth(event: any): void {
    const isValid = this.form.get('idNumber').valid;
    if (isValid) {
      const idNumber = event.srcElement.value;
      this.calculateBirthday(idNumber);
      this.calculateAge();
    }
  }
}
