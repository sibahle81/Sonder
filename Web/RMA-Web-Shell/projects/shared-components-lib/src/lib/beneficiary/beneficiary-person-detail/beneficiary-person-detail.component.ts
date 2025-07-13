import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { MaritalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/marital-status-enum';
import { MarriageTypeEnum } from 'projects/shared-models-lib/src/lib/enums/marriage-type-num';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ValidateSAIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number-sa.validator';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'beneficiary-person-detail',
  templateUrl: './beneficiary-person-detail.component.html',
  styleUrls: ['./beneficiary-person-detail.component.css']
})
export class BeneficiaryPersonDetailComponent extends UnSubscribe implements OnChanges {

  @Input() event: EventModel;
  @Input() personEvent: PersonEventModel;
  @Input() mode = ModeEnum.Default;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() title = 'Beneficiary Details';

  @Output() emitNewBeneficiary: EventEmitter<RolePlayer> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isIdLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;
  titles: TitleEnum[];
  idTypes: IdTypeEnum[];
  genderTypes: GenderEnum[];
  maritalStatusTypes: MaritalStatusEnum[];
  marriageTypes: MarriageTypeEnum[];
  maritalStatuses: MaritalStatusEnum[];
  isMarried = false;
  isRolePlayerExist = false

  countries: Lookup[];
  filteredCountries: Lookup[] = [];
  nationalities: Lookup[];
  filteredNationalities: Lookup[] = [];

  isSAIdentity = false;
  maxDate = new Date();
  employeeAge: number;
  DOB: Date;
  idType: number;
  rolePlayerContacts: RolePlayerContact[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly datePipe: DatePipe,
    private readonly lookupService: LookupService,
    private readonly rolePlayerService: RolePlayerService,
  ) { 
    super();
    this.getLookups();
  }

  ngOnChanges() {
    if (this.personEvent) {
      this.isLoading$.next(true);
      this.createForm();
      this.setFormMode();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      idType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      idNumber: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      title: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      firstName: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      surname: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      dateOfBirth: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      gender: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      maritalStatus: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      nationality: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      country: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      marriageType: [{ value: '', disabled: this.isReadOnly }],
      marriageDate: [{ value: '', disabled: this.isReadOnly }],
    });

    if (this.personEvent?.rolePlayer?.person
        && (this.mode === ModeEnum.Edit || this.mode === ModeEnum.View)) {
      this.setForm();
    } else {
      this.isLoading$.next(false);
    }
  }

  setForm() {
    const dob = this.personEvent.rolePlayer.person?.dateOfBirth ? this.datePipe.transform(this.personEvent.rolePlayer.person.dateOfBirth, 'yyyy-MM-dd') : null;

    if (this.personEvent.rolePlayer.person.idType === IdTypeEnum.SA_ID_Document) {
      this.form.get('idNumber').setValidators([ValidateSAIdNumber, Validators.required, Validators.maxLength(13)]);
      this.isSAIdentity = true;
    }
    this.idType = this.personEvent.rolePlayer.person.idType;

    this.form.patchValue({
      idType: this.personEvent.rolePlayer.person.idType,
      idNumber: this.personEvent.rolePlayer.person.idType === IdTypeEnum.SA_ID_Document ? this.personEvent.rolePlayer.person.idNumber 
                                                                                        : this.personEvent.rolePlayer.person.passportNumber 
                                                                                        ? this.personEvent.rolePlayer.person.passportNumber : this.personEvent.rolePlayer.person.idNumber,
      title: TitleEnum[this.personEvent.rolePlayer.person.title],
      firstName: this.personEvent.rolePlayer.person.firstName,
      surname: this.personEvent.rolePlayer.person.surname,
      dateOfBirth: dob,
      gender: this.personEvent.rolePlayer.person.gender ? GenderEnum[this.personEvent.rolePlayer.person.gender] : null,
      maritalStatus: MaritalStatusEnum[this.personEvent.rolePlayer.person.maritalStatus],
      nationality: this.personEvent.rolePlayer.person.nationality,
      country: this.personEvent.rolePlayer.person.countryOriginId,
      marriageType: this.personEvent.rolePlayer.person.marriageType ? MarriageTypeEnum[this.personEvent.rolePlayer.person.marriageType] : null,
      marriageDate: this.personEvent.rolePlayer.person.marriageDate,
    });

    this.isLoading$.next(false);
  }

  readForm() {
    if (!this.form.valid) { return; }

    const formDetails = this.form.getRawValue();

    this.personEvent.rolePlayer = this.mode === ModeEnum.NewBeneficiary ? new RolePlayer() : this.personEvent.rolePlayer;

    this.personEvent.rolePlayer.displayName = this.form.get('firstName').value + ' ' + formDetails.surname;
    this.personEvent.rolePlayer.rolePlayerIdentificationType = this.personEvent.rolePlayer.rolePlayerIdentificationType ? this.personEvent.rolePlayer.rolePlayerIdentificationType : RolePlayerIdentificationTypeEnum.Person;
    this.personEvent.rolePlayer.clientType = this.personEvent.rolePlayer.clientType ? this.personEvent.rolePlayer.clientType : ClientTypeEnum.Individual;
    this.personEvent.rolePlayer.memberStatus = this.personEvent.rolePlayer.memberStatus ? this.personEvent.rolePlayer.memberStatus : MemberStatusEnum.Active;
    this.personEvent.rolePlayer.preferredCommunicationTypeId = this.personEvent.rolePlayer.preferredCommunicationTypeId ? this.personEvent.rolePlayer.preferredCommunicationTypeId : 1;

    this.personEvent.rolePlayer.person = this.personEvent.rolePlayer.person ? this.personEvent.rolePlayer.person : new Person();

    this.personEvent.rolePlayer.person.rolePlayerId = this.personEvent.rolePlayer.rolePlayerId ? this.personEvent.rolePlayer.rolePlayerId : 0;
    this.personEvent.rolePlayer.person.idType = formDetails.idType;
    this.personEvent.rolePlayer.person.idNumber = formDetails.idNumber;
    this.personEvent.rolePlayer.person.title = +TitleEnum[formDetails.title];
    this.personEvent.rolePlayer.person.firstName = formDetails.firstName;
    this.personEvent.rolePlayer.person.surname = formDetails.surname;
    this.personEvent.rolePlayer.person.dateOfBirth = new Date(this.datePipe.transform(formDetails.dateOfBirth, 'yyyy-MM-dd'));
    this.personEvent.rolePlayer.person.gender = +GenderEnum[formDetails.gender];
    this.personEvent.rolePlayer.person.maritalStatus = +MaritalStatusEnum[formDetails.maritalStatus];
    this.personEvent.rolePlayer.person.nationality = formDetails.nationality;
    this.personEvent.rolePlayer.person.countryOriginId = formDetails.country;
    this.personEvent.rolePlayer.person.maritalStatus = +MaritalStatusEnum[formDetails.maritalStatus];
    this.personEvent.rolePlayer.person.marriageType = +MarriageTypeEnum[formDetails.marriageType];
    this.personEvent.rolePlayer.person.marriageDate = formDetails.marriageDate ? new Date(this.datePipe.transform(formDetails.marriageDate, 'yyyy-MM-dd')) : null;
  }

  save() {
    this.isLoading$.next(true);
    this.readForm();

    if (this.personEvent.rolePlayer && this.personEvent.rolePlayer.rolePlayerId > 0) {
      this.updateRolePlayer();
    }
    else {
      this.addRolePlayer();
    }
  }

  edit() {
    this.mode = ModeEnum.Edit;
    this.setFormMode();
  }

  addRolePlayer() {
    this.rolePlayerService.addRolePlayer(this.personEvent.rolePlayer).subscribe(result => {
      if (result) {
        this.personEvent.rolePlayer.rolePlayerId = result;
        this.personEvent.insuredLifeId = result;
        this.emitNewBeneficiary.emit(this.personEvent.rolePlayer);
        this.form.disable();
        this.isLoading$.next(false);
      }
    });
  }

  updateRolePlayer() {
    this.rolePlayerService.updateRolePlayer(this.personEvent.rolePlayer).subscribe(result => {
      if (result) {
        this.emitNewBeneficiary.emit(this.personEvent.rolePlayer);
        this.form.disable();
        this.isLoading$.next(false);
      }
    });
  }

  setFormMode() {
    this.isRolePlayerExist = this.personEvent?.rolePlayer?.rolePlayerId > 0;

    if (this.isReadOnly) { return; }

    if (this.mode == ModeEnum.View || this.mode == ModeEnum.Default) {
      this.form.disable();
    }

    if (this.mode === ModeEnum.Edit) {
      if (this.isRolePlayerExist) {
        this.form.enable();

        this.form.get('idType').disable();
        this.form.get('idNumber').disable();
      } else {
        this.form.enable();
      }
    }
  }

  getLookups() {
    this.marriageTypes = this.ToArray(MarriageTypeEnum);
    this.maritalStatuses = this.ToArray(MaritalStatusEnum);
    this.titles = this.ToArray(TitleEnum);
    this.getIdTypes();
    this.genderTypes = this.ToArray(GenderEnum);
    this.maritalStatusTypes = this.ToArray(MaritalStatusEnum);

    forkJoin({
      nationalities: this.lookupService.getNationalities(),
      countries: this.lookupService.getCountries()
    }).pipe(takeUntil(this.unSubscribe$))
      .subscribe(({ nationalities, countries }) => {
        if (nationalities && countries) {
          this.nationalities = nationalities;
          this.filteredNationalities = nationalities;
          this.countries = countries;
          this.filteredCountries = countries;
        }
      });
  }

  idTypeChanged(value: any) {
    this.idType = value.value;
    this.form.get('idNumber').clearValidators();
    if (value.value === IdTypeEnum.SA_ID_Document) {
      this.form.get('idNumber').setValidators([ValidateSAIdNumber, Validators.required, Validators.maxLength(13)]);
      this.isSAIdentity = true;
    } else {
      this.form.get('idNumber').setValidators([Validators.required, Validators.minLength(3)]);
      this.isSAIdentity = false;
    }
    this.form.get('idNumber').updateValueAndValidity();
  }

  maritalStatusChanged(value: MaritalStatusEnum) {
    this.isMarried = +MaritalStatusEnum[value] === MaritalStatusEnum.Married;
    this.form.get('marriageType').clearValidators();
    this.form.get('marriageDate').clearValidators();
    if (+MaritalStatusEnum[value] === MaritalStatusEnum.Married) {
      this.form.get('marriageType').updateValueAndValidity();
      this.form.get('marriageDate').updateValueAndValidity();
      this.form.get('marriageType').enable();
      this.form.get('marriageDate').enable();
      this.form.get('marriageType').setValue(null);
      this.form.get('marriageDate').setValue(null);
    } else if (+MaritalStatusEnum[value] === MaritalStatusEnum.Separated) {
      this.form.get('marriageType').clearValidators();
      this.form.get('marriageDate').clearValidators();
      this.form.get('marriageType').enable();
      this.form.get('marriageDate').enable();
      this.form.get('marriageType').setValue(null);
      this.form.get('marriageDate').setValue(null);
    } else {
      this.form.get('marriageType').clearValidators();
      this.form.get('marriageDate').clearValidators();
      this.form.get('marriageType').setValue(null);
      this.form.get('marriageDate').setValue(null);
    }
  }

  getIdTypes() {
    this.lookupService.getIdTypes().pipe(takeUntil(this.unSubscribe$)).subscribe(results => {
      if (results.length > 0) {
        const identityTypes = new Array();
        identityTypes.push(results.find(a => a.id === IdTypeEnum.Passport_Document));
        identityTypes.push(results.find(a => a.id === IdTypeEnum.SA_ID_Document));
        this.idTypes = identityTypes;
      }
    });
  }

  getMarriageType(type: string) {
    if (!String.isNullOrEmpty(type)) {
      return this.formatText(type);
    }
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  onCountryKey(value) {
    this.filteredCountries = this.dropDownSearch(value, 'country');
  }

  onNationalityKey(value) {
    this.filteredNationalities = this.dropDownSearch(value, 'nationality');
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();

    switch (name) {
      case 'country':
        return this.setData(filter, this.filteredCountries, this.countries);
      case 'nationality':
        return this.setData(filter, this.filteredNationalities, this.nationalities);
      default: break;
    }
  }

  setData(filter: string, filteredList: Lookup[], originalList: Lookup[]) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      return filteredList.filter(option => option.name.toLocaleLowerCase().includes(filter));
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  search() {
    this.onIdChangeControlsReset();
    if (this.isSAIdentity) {
      this.setDOB();
    } else {
      this.form.get('dateOfBirth').enable();
      this.validateDateField();
    }

    let employeeIdNumber = ((this.form.controls.idNumber.value).replace(/[^\w\s]/gi, '')).replace(/\s/g, '');

    if (employeeIdNumber) {
      this.isIdLoading$.next(true);

      this.rolePlayerService.SearchRolePlayerByRegistrationNumber(KeyRoleEnum.InsuredLife, employeeIdNumber).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        if (result?.rolePlayerId > 0) {
          this.personEvent.rolePlayer = result
          this.edit();// edit mode
          this.setForm();
        }
        this.isIdLoading$.next(false)
      });
    }
  }

  setDOB() {
    const formModel = this.form.value;
    const idNumber = formModel.idNumber as string;
    if (idNumber !== null && idNumber.length >= 12) {
      this.extractDoBFromZAIdNumber(idNumber);
      this.doAgeCalculation(this.DOB);
    } else {
      this.form.get('dateOfBirth').enable();
      this.validateDateField();
    }
  }

  dobChange() {
    const dob = new Date(this.form.get('dateOfBirth').value);
    const idNumber = this.form.value.idNumber as string;

    if (this.isSAIdentity && idNumber) {
      const changedDate = this.datePipe.transform(new Date(dob), 'yyyy-MM-dd');
      const formattedDOB = this.datePipe.transform(this.DOB, 'yyyy-MM-dd');

      if (changedDate === formattedDOB || changedDate === this.subtractYears(100, this.DOB)) {
        this.DOB = new Date(changedDate);
      } else {
        this.setDOB();
      }

    } else {
      this.validateDateField();
    }
    this.doAgeCalculation(dob);
  }

  subtractYears(numOfYears: number, date: Date) {
    const pivotDate = new Date(date.getTime());
    pivotDate.setFullYear(pivotDate.getFullYear() - numOfYears);
    return this.datePipe.transform(pivotDate, 'yyyy-MM-dd');
  }

  extractDoBFromZAIdNumber(idNumber: string) {
    const birthDate = idNumber.substring(0, 6);
    const d = birthDate;
    const yy = d.substr(0, 2);
    const mm = d.substr(2, 2);
    const dd = d.substr(4, 2);
    const yyyy = (+yy < 30) ? '20' + yy : '19' + yy;

    this.DOB = new Date(yyyy + '-' + mm + '-' + dd);
    this.form.get('dateOfBirth').setValue(this.DOB);
  }

  doAgeCalculation(startDate: Date) {
    if (startDate) {
      this.employeeAge = this.getAge(startDate);
      const formDetails = this.form.getRawValue();
      const isTrainee = formDetails.trainee;
    }
  }

  getAge(birthDate: Date) {
    const now = new Date();
    let days = Math.floor((now.getTime() - new Date(birthDate).getTime()) / 1000 / 60 / 60 / 24);
    let age = 0;
    for (let y = birthDate.getFullYear(); y <= now.getFullYear(); y++) {
      const daysInYear = this.isLeap(y) ? 366 : 365;
      if (days >= daysInYear) {
        days -= daysInYear;
        age++;
      }
    }
    return age;
  }

  isLeap(year: number) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  validateDateField() {
    const control = this.form.get('dateOfBirth');
    if (control instanceof UntypedFormControl) {
      control.markAsTouched({ onlySelf: true });
    } else if (control instanceof UntypedFormGroup) {
      this.validateDateField();
    }
  }

  onIdChangeControlsReset() {
    this.form.controls.title.reset();
    this.form.controls.firstName.reset();
    this.form.controls.surname.reset();
    this.form.controls.dateOfBirth.reset();
    this.form.controls.gender.reset();
    this.form.controls.maritalStatus.reset();
    this.form.controls.nationality.reset();
    this.form.controls.country.reset();
    this.form.controls.marriageType.reset();
    this.form.controls.marriageDate.reset();
  }

  isContactValid(): boolean {
    let isValid = true;

    if (this.isWizard) {
      if (this.personEvent.rolePlayer && (!this.personEvent.rolePlayer.rolePlayerContacts || this.personEvent.rolePlayer.rolePlayerContacts.length <= 0)) {
        isValid = false;
      }

      if (this.personEvent.rolePlayer && (this.personEvent.rolePlayer.rolePlayerContacts && this.personEvent.rolePlayer.rolePlayerContacts.length > 0)) {
        this.personEvent.rolePlayer.rolePlayerContacts.forEach(contact => {
          if (this.personEvent.personEventStatus == PersonEventStatusEnum.New && !contact.isConfirmed) {
            isValid = false;
          }
        });
      }
    }
    return isValid;
  }
}
