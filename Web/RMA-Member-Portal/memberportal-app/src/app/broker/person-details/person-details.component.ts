import { Component, Input, ViewChild, ElementRef, Output, OnChanges, EventEmitter, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'src/app/shared-utilities/datepicker/dateformat';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { IdTypeEnum } from 'src/app/shared/enums/id-type.enum';
import { Case } from 'src/app/shared/models/case';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { Person } from 'src/app/shared/models/person';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';


@Component({
  selector: 'person-details',
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class PersonDetailsComponent extends WizardDetailBaseComponent<RolePlayer> implements OnChanges, AfterViewInit {

  @ViewChild('idNumber') idNumber: ElementRef;
  @Input() parentModel: Case = new Case();
  @Input() showAge = false;
  @Output() isSaIDtype = new EventEmitter<boolean>();
  @Output() birthDateChanged = new EventEmitter<Date>();
  @Output() ageChanged = new EventEmitter<number>();
  @Input() newMainMember: RolePlayer;

  idTypes: Lookup[] = [];
  Identifications: string[] = [];
  currentQuery: string;
  idSearchResults: RolePlayer[] = [];
  formPopulatedWithModel = false;
  IdNumberInputType = 'text';
  isDateOfBirthSet = false;
  mainMemberVopdVerificationRequired = false;
  controlDisabled = true;

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (this.parentModel) {
      if (this.parentModel.mainMember.person) {
        this.model = this.parentModel.mainMember;
        if (this.form && !this.formPopulatedWithModel) {
          this.populateForm();
          this.formPopulatedWithModel = true;
        }
      }
    }
    if (this.newMainMember) {
      console.log(this.model);
      this.populateForm();
    }
  }

  isAlive = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,
    private readonly rolePlayerService: RolePlayerService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.onLoadLookups();
  }

  ngOnInit() {
    this.createForm(0);

  }

  ngAfterViewInit() {
    this.populateForm();
  }

  onLoadLookups(): void {
    this.lookupService.getIdTypes().subscribe(
      data => {
        this.idTypes = data;
      }
    );
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      rolePlayerId: [id],
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      idType: [{ value: '', disabled: true }],
      idNumber: [''],
      dateOfBirth: ['', [Validators.required]],
      isAlive: [''],
      dateOfDeath: [null],
      deathCertificateNumber: [''],
      isVopdVerified: [''],
      dateVopdVerified: [null],
      age: [''],
      isDeleted: [false],
      createdBy: [null],
      createdDate: [null]
    });
    this.form.get('age').disable();
    this.form.get('dateOfDeath').disable();
    this.form.get('idNumber').disable();
    this.form.get('deathCertificateNumber').disable();
    this.form.get('dateVopdVerified').disable();
    this.form.get('isAlive').disable();
  }

  populateForm(): void {
    if (this.model) {
      if (this.model.person) {
        const person = this.model.person;
        const idNumber = person.idNumber ? person.idNumber : person.passportNumber;
        const numbersOnly = idNumber.match('^[0-9]*$');
        this.form.patchValue({
          rolePlayerId: this.model.rolePlayerId,
          firstName: person ? person.firstName : '',
          surname: person ? person.surname : '',
          idType: numbersOnly ? IdTypeEnum.SAIDDocument : IdTypeEnum.PassportDocument,
          idNumber: idNumber ? idNumber : '',
          isAlive: person ? person.isAlive : true,
          dateOfDeath: person ? person.dateOfDeath : null,
          deathCertificateNumber: person ? person.deathCertificateNumber : '',
          isVopdVerified: person ? person.isVopdVerified : false,
          dateVopdVerified: person ? person.dateVopdVerified : null,
          isDeleted: person ? person.isDeleted : null,
          createdBy: person ? person.createdBy : null,
          createdDate: person ? person.createdDate : null
        });

        this.isAlive = person.isAlive;

        this.formPopulatedWithModel = true;
        if (person) {
          let dob = this.isDateAssigned(person.dateOfBirth) ? person.dateOfBirth : null;
          if (!dob && person.idType === IdTypeEnum.SAIDDocument && person.idNumber.length >= 6) {
            dob = this.calculetDateOfBirth(person.idNumber);
          }
          this.form.patchValue({ dateOfBirth: dob });
          this.calculateAge();
          if (this.model.person.idType) {
            if (this.model.person.idType !== IdTypeEnum.SAIDDocument) {
              this.isSaIDtype.emit(false);
              this.isDateOfBirthSet = false;
            } else {
              this.setDateOfBirth();
              this.isSaIDtype.emit(true);
              this.isDateOfBirthSet = true;
            }
          }
        }
      } else {
        this.formPopulatedWithModel = false;
      }
    }
  }

  populateModel(): void {
    const value = this.form.getRawValue();
    if (!this.model.person) {
      this.model.person = new Person();
    }
    this.model.person.rolePlayerId = (value.rolePlayerId > 0) ? value.rolePlayerId : this.model.rolePlayerId;
    this.model.person.firstName = value.firstName;
    this.model.person.surname = value.surname;
    this.model.person.idType = value.idType;
    this.model.person.idNumber = value.idNumber;
    this.model.person.passportNumber = value.idNumber;
    this.model.person.dateOfBirth = value.dateOfBirth;
    this.model.person.isAlive = value.isAlive;
    this.model.person.dateOfDeath = value.dateOfDeath;
    this.model.person.deathCertificateNumber = value.deathCertificateNumber;
    this.model.person.isVopdVerified = value.isVopdVerified;
    this.model.person.dateVopdVerified = value.dateVopdVerified;
    this.model.person.createdBy = value.createdBy;
    this.model.person.createdDate = value.createdDate;
    this.model.person.isDeleted = value.isDeleted;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.form) {
      if (!this.form.get('firstName').value) {
        validationResult.errorMessages.push('Firstname is required');
        validationResult.errors += 1;
      }
      if (!this.form.get('surname').value) {
        validationResult.errorMessages.push('Surname is required');
        validationResult.errors += 1;
      }
      if (!this.form.get('idType').value) {
        validationResult.errorMessages.push('ID type is required');
        validationResult.errors += 1;
      }
      if (!this.form.get('dateOfBirth').value) {
        validationResult.errorMessages.push('Date of Birth is required');
        validationResult.errors += 1;
      }
      if (this.form.get('dateOfBirth').value) {
        const dtm = new Date();
        dtm.setHours(0, 0, 0, 0);
        const today = new Date(dtm).getTime();
        const dob = new Date(this.form.get('dateOfBirth').value).getTime();
        if (dob > today) {
          validationResult.errorMessages.push('Date Of Birth cannot be in the future');
          validationResult.errors += 1;
        }
      }
    } else {
      validationResult.errorMessages.push('Person details required');
      validationResult.errors += 1;
    }
    return validationResult;
  }

  calculetDateOfBirth(idNumber: string): Date {
    const today = new Date();
    let year = +idNumber.substr(0, 2) + 2000;
    if (year > today.getFullYear()) { year -= 100; }
    const month = +idNumber.substr(2, 2) - 1;
    const day = +idNumber.substr(4, 2);
    return new Date(year, month, day);
  }

  calculateAge() {
    const dob1 = this.form.get('dateOfBirth').value;
    if (dob1 == null) {
      this.form.patchValue({ age: null });
      this.form.get('age').disable();
      return;
    }
    const dob = new Date(dob1);
    if (dob) {
      this.model.person.dateOfBirth = dob;
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      this.form.patchValue({ age: calculatedAge });
      this.form.get('age').disable();
      this.birthDateChanged.emit(dob);
      this.ageChanged.emit(calculatedAge);
    }
    this.validateDates();
  }

  loadData(): void {
    this.rolePlayerService.getPersonRolePlayerByIdNumber(this.currentQuery, this.form.get('idType').value).map(
      (c: RolePlayer[]) => {
        this.idSearchResults = c;
        this.updateUi();
      }
    ).subscribe();
  }

  updateUi() {
    if (this.idSearchResults.length > 0) {
      const person = this.idSearchResults[0].person;
      if (person) {
        this.form.patchValue({
          rolePlayerId: person.rolePlayerId,
          firstName: person ? person.firstName : '',
          surname: person ? person.surname : '',
          idNumber: person ? person.idNumber : '',
          dateOfBirth: person ? person.dateOfBirth : null,
          isAlive: person ? person.isAlive : true,
          dateOfDeath: person ? person.dateOfDeath : null,
          deathCertificateNumber: person ? person.deathCertificateNumber : '',
          isVopdVerified: person ? person.isVopdVerified : false,
          dateVopdVerified: person ? this.getDateFormattedDate(person.dateVopdVerified) : null
        });
      }
      this.calculateAge();
    }
  }

  clearFormControls() {
    this.form.patchValue({
      rolePlayerId: 0,
      firstName: '',
      surname: '',
      dateOfBirth: null,
      dateOfDeath: null,
      deathCertificateNumber: '',
      isVopdVerified: false,
      dateVopdVerified: null,
      age: ''
    });
  }

  getClientByIdentificaiton() {
    this.form.get('idNumber').setErrors(null);
    if (!this.form.get('idNumber').value) {
      this.form.get('idNumber').setErrors({ required: true });
    }

    if (this.form.get('idType').value !== IdTypeEnum.SAIDDocument) {
      this.IdNumberInputType = 'text';
      this.isSaIDtype.emit(false);
    } else {
      this.IdNumberInputType = 'number';
      this.isSaIDtype.emit(true);
    }

    if (this.form.get('idType').value) {
      this.currentQuery = this.idNumber.nativeElement.value;
      this.idSearchResults = [];
      this.clearFormControls();
      if (this.currentQuery.length === 13 && this.form.get('idType').value === IdTypeEnum.SAIDDocument) {
        this.loadData();
        this.setDateOfBirth();
      } else if (this.currentQuery.length < 13 && this.form.get('idType').value === IdTypeEnum.SAIDDocument) {
        this.form.get('idNumber').setErrors({ invalidSaIdLength: true });
      } else if (this.form.get('idType').value !== IdTypeEnum.SAIDDocument) {
        this.loadData();
      }
    }
  }

  setDateOfBirth() {
    const idNumber = this.form.get('idNumber').value;
    if (idNumber) {
      if (idNumber.length === 13 && this.form.get('idType').value === IdTypeEnum.SAIDDocument) {
        const today = new Date();
        let year = +idNumber.substr(0, 2) + 2000;
        if (year > today.getFullYear()) { year -= 100; }
        const month = +idNumber.substr(2, 2) - 1;
        const day = +idNumber.substr(4, 2);

        if (this.isValidMonth(month) && this.isValidDay(day)) {
          this.form.patchValue({ dateOfBirth: new Date(year, month, day) });
          this.isDateOfBirthSet = true;
        }
      }
    }
    this.calculateAge();
  }

  getDateFormattedDate(dt: Date): string {
    if (!dt) { return ''; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }

  isValidMonth(month: number): boolean {
    if (month > 0 && month < 13) {
      return true;
    }
    return false;
  }

  isValidDay(day: number): boolean {
    if (day > 0 && day < 32) {
      return true;
    }
    return false;
  }

  isDateAssigned(dt: Date): boolean {
    if (!dt) { return false; }
    const date = new Date(dt);
    return date.getFullYear() > 1;
  }

  validateDates(): void {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm).getTime();
    const dob = new Date(this.form.get('dateOfBirth').value).getTime();
    if (dob > today) {
      this.form.get('dateOfBirth').markAsTouched();
      this.form.get('dateOfBirth').setErrors({ dateOfBirthInThefuture: true });
    }
  }
}
