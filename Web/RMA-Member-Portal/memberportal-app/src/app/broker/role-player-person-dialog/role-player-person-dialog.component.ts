import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'src/app/shared-utilities/datepicker/dateformat';
import { ValidateEmail } from 'src/app/shared-utilities/validators/email.validator';
import { ValidateSAIdNumber } from 'src/app/shared-utilities/validators/id-number-sa.validator';
import { ValidatePhoneNumber } from 'src/app/shared-utilities/validators/phone-number.validator';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { RolePlayerRelation } from 'src/app/shared/models/roleplayer-relation';
import { RolePlayerType } from 'src/app/shared/models/roleplayer-type';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';

@Component({
  templateUrl: './role-player-person-dialog.component.html',
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class RolePlayerPersonDialogComponent implements OnInit {
  form: FormGroup;
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
  joinDate: Date;
  valueDate: Date;
  get isAlive(): boolean {
    if (!this.form) { return true; }
    return this.form.value.isAlive;
  }

  constructor(
    public dialogRef: MatDialogRef<RolePlayerPersonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly lookupService: LookupService,
    private readonly formBuilder: FormBuilder,
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
    const joiningDate = new Date(initDate.setDate(initDate.getDate() + 1));
    this.joinDate = joiningDate ? joiningDate : new Date();
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
    this.lookupService.getIdTypes().subscribe(data => {
      this.idTypes = data;
      this.filterIdentificationTypesByRolePlayer();
    });
  }

  loadCommunicationTypes(): void {
    this.lookupService.getCommunicationTypes().subscribe(
      data => this.communicationTypes = data
    );
  }

  enable() {
    this.form.enable();
  }

  disable() {
    this.form.disable();
  }

  isFirstDay = (d: Date): boolean => {
    const date = d.getDate();
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
      dateJoined: ['']
    });
  }

  populateForm(): void {
    const person = this.rolePlayer.person;
    if (this.rolePlayer.joinDate !== undefined) {
      const initDate = new Date(this.rolePlayer.joinDate);
    }
    if (this.joinDate !== null && this.rolePlayer.joinDate == undefined) {
      const initDate = new Date(this.joinDate);
      this.valueDate = new Date(initDate.setDate(initDate.getDate() - 1));
    }
    this.form.patchValue({
      rolePlayerId: this.rolePlayer.rolePlayerId,
      // rolePlayer fields
      tellNumber: this.rolePlayer.tellNumber ? this.rolePlayer.tellNumber : '',
      cellNumber: this.rolePlayer.cellNumber ? this.rolePlayer.cellNumber : '',
      emailAddress: this.rolePlayer.emailAddress ? this.rolePlayer.emailAddress : '',
      preferredCommunicationTypeId: this.rolePlayer.preferredCommunicationTypeId,
      // person fields
      firstName: person ? person.firstName : '',
      surname: person ? person.surname : '',
      idType: person ? (person.idType ? person.idType : 1) : 1,
      idNumber: person ? person.idNumber : '',
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
    this.changeIdType(null);
  }

  getRolePlayer(): RolePlayer {
    // Do not just create new role player,
    const value = this.form.getRawValue();
    const player = new RolePlayer();
    // rolePlayer fields
    player.person.isBeneficiary = this.rolePlayer.person ? this.rolePlayer.person.isBeneficiary : false;
    player.person.manualBeneficiary = this.rolePlayer.person ? this.rolePlayer.person.manualBeneficiary : true;
    player.person.rolePlayerId = this.rolePlayer.rolePlayerId;
    player.displayName = `${value.firstName} ${value.surname}`.trim();
    player.tellNumber = value.tellNumber;
    player.cellNumber = value.cellNumber;
    player.emailAddress = value.emailAddress;
    player.preferredCommunicationTypeId = value.preferredCommunicationTypeId;
    const initJoinDate = new Date(value.dateJoined);
    const correctJoinDate = new Date(initJoinDate.setDate(initJoinDate.getDate()));
    player.joinDate = correctJoinDate;
    player.isDeleted = this.rolePlayer.isDeleted;
    // person fields
    player.person.firstName = value.firstName;
    player.person.surname = value.surname;
    player.person.idType = value.idType;
    player.person.idNumber = value.idNumber;
    player.person.dateOfBirth = value.dateOfBirth;
    player.person.isAlive = value.isAlive;
    player.person.isStudying = value.isAlive ? value.isStudying : false;
    player.person.isDisabled = value.isAlive ? value.isDisabled : false;
    player.person.dateOfDeath = value.isAlive ? null : value.dateOfDeath;
    player.person.deathCertificateNumber = value.isAlive ? null : value.deathCertificateNumber;
    player.person.isVopdVerified = value.isVopdVerified;
    player.person.dateVopdVerified = value.dateVopdVerified;
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

  changeIdType(event: any): void {
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

  calculateDateOfBirth(event: any): void {
    this.checkRolePlayer();
    const isValid = this.form.get('idNumber').valid;
    if (!isValid) { return; }
    const idNumber = event.srcElement.value;
    this.checkPersonExists(idNumber);
  }

  checkPersonExists(idNumber: string) {
    this.searchPerson = true;
    const idType = this.form.get('idType').value;
    this.roleplayerService.getPersonRolePlayerByIdNumber(idNumber, idType).subscribe(result => {
      if (result.length === 0) {
        this.calculateBirthday(idNumber);
        this.calculateAge();
      } else {
        this.rolePlayer = result[0];
        this.populateForm();
        this.calculateBirthday(idNumber);
        this.calculateAge();
      }
      this.searchPerson = false;
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
      var _minJoinDate = this.datePipe.transform(minJoinDate, 'yyyy-MM-dd');

      const joinDate = new Date(this.form.getRawValue().dateJoined);
      var _joinDate = this.datePipe.transform(joinDate, 'yyyy-MM-dd');
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
      this.form.get('dateOfBirth').setErrors({ dateOfBirthInThefuture: true });
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
