import { Component, OnInit, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { ValidateSAIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number-sa.validator';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { RolePlayerType } from '../../shared/entities/roleplayer-type';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { RolePlayerRelation } from '../../shared/entities/roleplayer-relation';
import { RolePlayerService } from '../../shared/Services/roleplayer.service';
import { DatePipe } from '@angular/common';

import 'src/app/shared/extensions/date.extensions';
import { Person } from '../../shared/entities/person';
import { IdTypeEnum } from '../../shared/enums/idTypeEnum';

@Component({
  templateUrl: './role-player-person-dialog.component.html',
  styleUrls: ['./role-player-person-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class RolePlayerPersonDialogComponent implements OnInit {
  form: UntypedFormGroup;
  canAddEdit = false;
  rolePlayer: RolePlayer;
  rolePlayerTypes: RolePlayerType[] = [];
  communicationTypes: Lookup[] = [];
  idTypes: Lookup[] = [];
  isOlderChild = false;
  isAgeInMonths: boolean;
  isGroupRoleplayer: boolean;
  searchPerson = false;
  showChildOptions = true;
  showJoinDate = false;
  minJoinDate: Date;
  valueDate: Date;
  joinDate: Date;

  currentRolePlayerId = 0;
  foundRolePlayerId = 0;

  get isAlive(): boolean {
    if (!this.form) { return true; }
    return this.form.value.isAlive;
  }

  constructor(
    public dialogRef: MatDialogRef<RolePlayerPersonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly datePipe: DatePipe,
    private readonly roleplayerService: RolePlayerService
  ) {
    this.rolePlayer = data.rolePlayer;
    this.rolePlayerTypes = data.rolePlayerTypes;
    this.showChildOptions = data.showChildOptions;
    this.canAddEdit = data.canAddEdit;
    this.showJoinDate = data.showJoinDate === true;
    this.minJoinDate = data.joinDate ? data.joinDate : new Date();
    const initDate = new Date(data.joinDate);
    const joiningDate = new Date(initDate.setDate(initDate.getDate()));
    this.joinDate = joiningDate ? joiningDate : new Date();
    this.currentRolePlayerId = this.rolePlayer && this.rolePlayer.rolePlayerId ? this.rolePlayer.rolePlayerId : 0;
    this.foundRolePlayerId = 0;
  }

  ngOnInit() {
    this.loadIdTypes();
    this.loadCommunicationTypes();
    this.createForm();
    this.populateForm();
  }

  filterIdentificationTypesByRolePlayer() {
    if (this.rolePlayerTypes) {
      this.isGroupRoleplayer = this.rolePlayerTypes[0].rolePlayerTypeId === 4 ? true : false;

      if (!this.isGroupRoleplayer) {
        this.idTypes = this.idTypes.filter(i => i.id !== 0 && i.id !== 3);
      } else {
        this.idTypes = this.idTypes.filter(i => i.id === 0 || i.id === 3);
      }
    }
  }

  loadIdTypes(): void {
    // tslint:disable-next-line: deprecation
    this.lookupService.getIdTypes().subscribe({
      next: (data) => {
        this.idTypes = data;
        this.filterIdentificationTypesByRolePlayer();
      }
    });
  }

  loadCommunicationTypes(): void {
    // tslint:disable-next-line: deprecation
    this.lookupService.getCommunicationTypes().subscribe({
      next: (data) => {
        this.communicationTypes = data;
      }
    });
  }

  enable() {
    this.form.enable();
  }

  disable() {
    this.form.disable();
  }

  isFirstDay = (dtm: Date): boolean => {
    if (!dtm) { return false; }
    const date = dtm.getDate();
    const val = date / 1 === 1;
    return val;
  }

  createForm(): void {
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
      dateOfBirth: ['', [Validators.required]],
      age: [''],
      isAlive: [''],
      isStudying: [''],
      isDisabled: [''],
      dateOfDeath: [''],
      deathCertificateNumber: [''],
      isVopdVerified: [''],
      dateVopdVerified: [''],
      rolePlayerTypeId: ['', [Validators.required, Validators.min(1)]],
      dateJoined: [''],
      split: ['']
    });
  }

  populateForm(): void {
    const person = this.rolePlayer.person;
    person.idNumber = person.idNumber ? person.idNumber : person.passportNumber;
    if (this.rolePlayer.joinDate !== undefined) {
      this.valueDate = Date.getActualDate(this.rolePlayer.joinDate);
    }
    if (this.joinDate !== null && this.rolePlayer.joinDate === undefined) {
      this.valueDate = Date.getActualDate(this.joinDate);
    }
    this.form.patchValue({
      rolePlayerId: this.rolePlayer.rolePlayerId,
      // rolePlayer fields
      tellNumber: this.rolePlayer.tellNumber ? this.rolePlayer.tellNumber : '',
      cellNumber: this.rolePlayer.cellNumber ? this.rolePlayer.cellNumber : '',
      emailAddress: this.rolePlayer.emailAddress ? this.rolePlayer.emailAddress : '',
      preferredCommunicationTypeId: this.rolePlayer.preferredCommunicationTypeId,
      isNatural: this.rolePlayer.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person,
      // person fields
      firstName: person?.firstName ? person.firstName.trim() : '',
      surname: person?.surname ? person.surname.trim() : '',
      idType: person ? (person.idType ? person.idType : 1) : 1,
      idNumber: person?.idNumber ? person.idNumber.trim() : '',
      dateOfBirth: person ? person.dateOfBirth : null,
      age: 0,
      isAlive: person ? person.isAlive : true,
      isStudying: person ? person.isStudying : false,
      isDisabled: person ? person.isDisabled : false,
      dateOfDeath: person ? person.dateOfDeath : null,
      deathCertificateNumber: person ? person.deathCertificateNumber : '',
      isVopdVerified: person ? person.isVopdVerified : false,
      dateVopdVerified: person ? person.dateVopdVerified : null,
      dateJoined: this.valueDate ? this.valueDate : this.rolePlayer.joinDate,
      rolePlayerTypeId:
        this.rolePlayer.fromRolePlayers && this.rolePlayer.fromRolePlayers.length > 0
          ? this.rolePlayer.fromRolePlayers[0].rolePlayerTypeId
          : -1
    });

    this.setCommunicationValidators({ value: this.rolePlayer.preferredCommunicationTypeId });

    if (this.canAddEdit) {
      this.enable();
    } else {
      this.disable();
    }

    if (this.form.get('idType').value === 1) {
      this.form.get('dateOfBirth').disable();
    }
    if (this.form.get('idNumber').value) {
      this.calculateBirthday(this.form.get('idNumber').value);
      this.calculateAge();
    }
    this.form.get('age').disable();
    this.changeIdentificationType(null);
  }

  getRolePlayer(): RolePlayer {
    // Do not just create new role player,
    const value = this.form.getRawValue();
    const player = new RolePlayer();
    player.person = new Person();

    let rolePlayerId = this.currentRolePlayerId;
    if (this.foundRolePlayerId > 0) {
      rolePlayerId = this.foundRolePlayerId;
    }

    // rolePlayer fields
    player.rolePlayerId = rolePlayerId;
    player.displayName = `${value.firstName.trim()} ${value.surname.trim()}`;
    player.tellNumber = value.tellNumber;
    player.cellNumber = value.cellNumber;
    player.emailAddress = value.emailAddress;
    player.preferredCommunicationTypeId = value.preferredCommunicationTypeId;
    player.joinDate = this.adjustDate(new Date(value.dateJoined));
    player.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
    player.isDeleted = this.rolePlayer.isDeleted;
    player.benefits = this.rolePlayer.benefits;
    // person fields
    player.person.rolePlayerId = rolePlayerId;
    player.person.firstName = value.firstName.trim();
    player.person.surname = value.surname.trim();
    player.person.idType = value.idType;
    player.person.idNumber = value.idNumber.trim();
    player.person.dateOfBirth = this.adjustDate(new Date(value.dateOfBirth));
    player.person.isAlive = value.isAlive;
    player.person.isStudying = value.isAlive ? value.isStudying : false;
    player.person.isDisabled = value.isAlive ? value.isDisabled : false;
    player.person.dateOfDeath = value.isAlive ? null : value.dateOfDeath;
    player.person.deathCertificateNumber = value.isAlive ? null : value.deathCertificateNumber;
    player.person.isVopdVerified = value.isVopdVerified;
    player.person.dateVopdVerified = value.dateVopdVerified;
    player.person.isBeneficiary = this.rolePlayer.person ? this.rolePlayer.person.isBeneficiary : false;
    player.person.manualBeneficiary = this.rolePlayer.person ? this.rolePlayer.person.manualBeneficiary : true;
    // populate the fromRolePlayers array
    const fromRolePlayer = new RolePlayerRelation();
    fromRolePlayer.fromRolePlayerId = this.rolePlayer.rolePlayerId;
    fromRolePlayer.toRolePlayerId = 0;
    fromRolePlayer.rolePlayerTypeId = value.rolePlayerTypeId;
    player.fromRolePlayers.push(fromRolePlayer);
    // populate the policies
    player.policies = this.rolePlayer.policies;
    return player;
  }

  private adjustDate(date: Date): Date {
    const today = new Date();
    const timeZoneOffset = today.getTimezoneOffset();
    const adjustMinutes = (timeZoneOffset === 0) ? 0 : -timeZoneOffset;
    date.setHours(0, adjustMinutes, 0, 0);
    return date;
  }

  setCommunicationValidators(event: any) {
    this.setControlValidator('cellNumber', [ValidatePhoneNumber]);
    this.setControlValidator('tellNumber', [ValidatePhoneNumber]);
    this.setControlValidator('emailAddress', [ValidateEmail]);
    switch (event.value) {
      case 1: // Email
        this.setControlValidator('emailAddress', [Validators.required, ValidateEmail]);
        break;
      case 2: // Phone
        this.setControlValidator('cellNumber', [Validators.required, ValidatePhoneNumber]);
        break;
      case 3: // SMS
        this.setControlValidator('cellNumber', [Validators.required, ValidatePhoneNumber]);
        break;
    }
  }

  setControlValidator(name: string, validators: any[]): void {
    const control = this.form.get(name);
    if (control) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  checkIdentificationType(event: any): void {
    this.changeIdentificationType(event);
    this.checkPersonExists(this.form.get('idNumber').value);
  }

  changeIdentificationType(event: any): void {
    this.form.get('idNumber').clearValidators();
    const idType = this.form.get('idType').value;
    if (idType === 1) {
      this.form.get('idNumber').setValidators([ValidateSAIdNumber, Validators.required]);
      this.form.get('dateOfBirth').disable();
    } else {
      this.form.get('idNumber').setValidators([Validators.required, Validators.minLength(3)]);
      if (this.form.enabled) {
        this.form.get('dateOfBirth').enable();
      }
    }
    this.form.get('idNumber').updateValueAndValidity();
    if (this.form.get('idNumber').valid) {
      this.checkRolePlayer();
    }
  }

  checkIdentificationNumber(): void {
    this.checkRolePlayer();
    const isValid = this.form.get('idNumber').valid;
    if (!isValid) { return; }
    const idNumber = this.form.getRawValue().idNumber;
    this.checkPersonExists(idNumber);
  }

  checkPersonExists(idNumber: string) {
    const idType = this.form.get('idType').value as IdTypeEnum;
    
    if (String.isNullOrEmpty(idNumber)) { return; }
    if (idType !== IdTypeEnum.SA_ID_Document) { return; }

    this.searchPerson = true;
    // tslint:disable-next-line: deprecation
    this.roleplayerService.getRolePlayerByIdNumber(idNumber).subscribe({
      next: (roleplayers) => {
        if (roleplayers.length > 0) {
          const roleplayer = roleplayers[0];
          const roleplayerId = roleplayer.rolePlayerId;
          const currentRoleplayerId = this.currentRolePlayerId ? this.currentRolePlayerId : 0;
          if (currentRoleplayerId === 0) {
            {
              this.rolePlayer = roleplayer;
              this.foundRolePlayerId = roleplayerId;
              this.populateForm();
            }
          } else if (roleplayerId !== currentRoleplayerId) {
            this.rolePlayer = roleplayer;
            this.foundRolePlayerId = roleplayerId;
            this.populateForm();
          } else {
            this.foundRolePlayerId = roleplayerId;
          }
        } else {
          this.calculateBirthday(idNumber);
          this.calculateAge();
        }
      },
      complete: () => {
        this.searchPerson = false;
      }
    });
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
      this.form.patchValue({ dateOfBirth: new Date(year, month, day) });
      this.form.get('dateOfBirth').updateValueAndValidity();
    }
  }

  updateAge(event: any) {
    this.calculateAge();
  }

  calculateAge(): void {
    this.isAgeInMonths = false;
    let age = 0;
    if (this.form) {
      const dateOfBirth = this.form.getRawValue().dateOfBirth;
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
    this.validateJoinDateBeforeDoB();
  }

  validateJoinDateBeforeDoB(): void {
    if (this.showJoinDate) {
      const dateOfBirth = new Date(this.form.getRawValue().dateOfBirth);
      const minJoinDate = new Date(this.minJoinDate);
      // tslint:disable-next-line: variable-name
      const _minJoinDate = this.datePipe.transform(minJoinDate, 'yyyy-MM-dd');
      const joinDate = new Date(this.form.getRawValue().dateJoined);
      // tslint:disable-next-line: variable-name
      const _joinDate = this.datePipe.transform(joinDate, 'yyyy-MM-dd');
      if (joinDate < dateOfBirth) {
        this.form.get('dateJoined').markAsTouched();
        this.form.get('dateJoined').setErrors({ joinDateBeforeBirthday: true });
      }
      if (_joinDate < _minJoinDate) {
        this.form.get('dateJoined').markAsTouched();
        this.form.get('dateJoined').setErrors({ joinDateBeforePolicyStartDate: true });
      }
    }
  }

  validateDOBNotInFuture(): void {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm).getTime();
    const dateOfBirth = this.form.getRawValue().dateOfBirth;
    const dob = new Date(dateOfBirth).getTime();
    if (dob > today) {
      this.form.get('dateOfBirth').markAsTouched();
      this.form.get('dateOfBirth').setErrors({ dateOfBirthInTheFuture: true });
    }
  }

  checkRolePlayer(): void {
    this.form.get('firstName').markAsTouched();
    this.form.get('surname').markAsTouched();
    this.form.get('idType').markAsTouched();
    this.form.get('idNumber').markAsTouched();
    this.form.get('dateOfBirth').markAsTouched();
    this.form.get('preferredCommunicationTypeId').markAsTouched();
    this.form.get('rolePlayerTypeId').markAsTouched();
    this.form.get('emailAddress').markAsTouched();
    this.form.get('tellNumber').markAsTouched();
    this.form.get('cellNumber').markAsTouched();
    if (this.showJoinDate) {
      this.form.get('dateJoined').markAsTouched();
    }
  }

  getMinimumJoinDate(): string {
    return this.datePipe.transform(this.joinDate, 'yyyy-MM-dd');
  }

  saveRolePlayer(): void {
    this.checkRolePlayer();
    if (this.form.valid) {
      this.dialogRef.close(this.getRolePlayer());
    } else {
      console.log('Dialog errors:', this.form.errors);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
